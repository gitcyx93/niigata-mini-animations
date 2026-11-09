"""Execute the prepared SFX trial through both upstream REAPER bridges."""
import argparse
import json
import math
import os
import subprocess
from pathlib import Path


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for key in ['daemon', 'mcp', 'resource', 'out']:
        p.add_argument('--' + key, type=Path, required=True)
    a = p.parse_args()
    out = a.out.resolve()
    cue = json.loads((out / 'cue.json').read_text())
    logs = out / 'live-calls'
    logs.mkdir(exist_ok=False)
    env = dict(os.environ, REAPER_RESOURCE_PATH=str(a.resource.resolve()), REAPER_MCP_TELEMETRY='0')
    counter = 0

    def execute(command, tag):
        nonlocal counter
        counter += 1
        r = subprocess.run(command, env=env, capture_output=True, text=True, timeout=75)
        (logs / f'{counter:02}-{tag}.log').write_text(r.stdout + '\n' + r.stderr)
        r.check_returncode()
        return r.stdout

    def daemon(name, args=None):
        text = execute(['python3', str(a.daemon / 'reaperd.py'), 'cmd', name,
                        json.dumps(args or {})], 'daemon-' + name)
        result = json.loads(text.splitlines()[-1])
        assert result['ok'], result
        return result['data']

    def mcp(name, args=None):
        text = execute(['node', str(Path(__file__).with_name('mcp_call.mjs')),
                        str(a.mcp / 'main.js'), name, json.dumps(args or {})], 'mcp-' + name)
        result = json.loads(text)
        assert not result.get('isError'), result
        value = result['content'][0]['text']
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value

    # Confirm the active project before touching anything.
    info = mcp('get_project_info')
    assert Path(info['name']).resolve() == out / 'trial.rpp', info
    assert not info['isPlaying'] and not info['isRecording'], info
    state = daemon('get_context')
    assert [t['name'] for t in state['tracks'] if not t.get('is_master')] == ['SEA_DAEMON', 'SEA_MCP']
    for name in ['daemon.wav', 'mcp.wav']:
        assert not (out / name).exists(), 'Use a fresh experiment output directory'

    batch = daemon('batch', {'stop_on_error': True, 'commands': [
        {'type': 'set_track_volume', 'payload': {'target_track_name': 'SEA_DAEMON', 'volume': cue['gain']}},
        {'type': 'set_track_pan', 'payload': {'target_track_name': 'SEA_DAEMON', 'pan': cue['pan']}},
        {'type': 'run_script', 'payload': {'path': str(out / 'daemon-arrange.lua'), 'args': cue}},
        {'type': 'mute_track', 'payload': {'target_track_name': 'SEA_DAEMON', 'mute': False}},
        {'type': 'mute_track', 'payload': {'target_track_name': 'SEA_MCP', 'mute': True}},
    ]})
    assert batch['all_ok'], batch
    d_item = batch['results'][2]['data']['return_value']
    assert abs(d_item['position']-cue['start']) < 1e-6 and abs(d_item['fadeIn']-cue['fadeIn']) < 1e-6
    assert daemon('get_capture_preflight', {'target_track_name': 'SEA_DAEMON'})['capture_allowed']

    # Set identical encoding through the upstream render-settings interface.
    mcp('set_render_settings', {'outputDirectory': str(out), 'filePattern': 'daemon',
        'format': 'wav', 'secondaryFormat': 'none', 'source': 'master', 'bounds': 'custom',
        'startTime': cue['start'], 'endTime': cue['end'], 'sampleRate': 32000,
        'channels': 2, 'bitDepth': '32f', 'normalize': 'off', 'limit': False, 'dither': False})
    daemon('set_time_selection', {'start': {'type': 'time', 'seconds': cue['start']},
                                 'end': {'type': 'time', 'seconds': cue['end']}})
    daemon('render', {'output_file': str(out / 'daemon.wav'), 'bounds': 'time_selection'})

    mcp('set_track_property', {'trackIndex': 1, 'property': 'volume', 'value': 20*math.log10(cue['gain'])})
    mcp('set_track_property', {'trackIndex': 1, 'property': 'pan', 'value': cue['pan']})
    mcp('set_media_item_properties', {'trackIndex': 1, 'itemIndex': 0,
        'position': cue['start'], 'length': cue['duration'],
        'fadeInLength': cue['fadeIn'], 'fadeOutLength': cue['fadeOut']})
    mcp('set_item_fades', {'trackIndex': 1, 'itemIndex': 0, 'fadeInShape': 0, 'fadeOutShape': 0})
    mcp('set_track_property', {'trackIndex': 0, 'property': 'mute', 'value': 1})
    mcp('set_track_property', {'trackIndex': 1, 'property': 'mute', 'value': 0})
    m_item = mcp('get_media_item_properties', {'trackIndex': 1, 'itemIndex': 0})
    m_track = mcp('get_track_properties', {'trackIndex': 1})
    assert abs(m_item['position']-cue['start']) < 1e-6 and abs(m_track['volumeRaw']-cue['gain']) < 1e-9
    mcp('set_render_settings', {'filePattern': 'mcp', 'bounds': 'custom',
                              'startTime': cue['start'], 'endTime': cue['end']})
    rendered = mcp('render_project', {'analyze': True})
    mcp('save_project')
    for route in ['daemon', 'mcp']:
        assert (out / f'{route}.wav').stat().st_size > 1000
        config = {k: cue[k] for k in ['source', 'sourceOffset', 'gain', 'start', 'end', 'fadeIn', 'fadeOut']}
        config.update(output=str(out / f'full-mix-{route}'),
                      provenance={'source_sha256': cue['source_sha256'], 'license': cue['source_license'], 'route': route})
        (out / f'mixer-input-{route}.json').write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
    (out / 'verified.json').write_text(json.dumps({'daemon': d_item, 'mcp': m_item,
        'mcp_track': m_track, 'render': rendered}, ensure_ascii=False, indent=2) + '\n')
    print(out / 'verified.json')


if __name__ == '__main__':
    main()
