"""Prepare the same recorded SFX scene for two REAPER agent bridges."""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def prepare(source, mix_path, out):
    source = source.resolve(strict=True)
    mix = json.loads(mix_path.read_text())
    sea = mix['sea']
    duration = round(sea['end'] - sea['start'], 6)
    out = out.resolve()
    if out == mix_path.parent.resolve() or mix_path.parent.resolve() in out.parents:
        raise ValueError('Use a separate experiment directory')
    out.mkdir(parents=True, exist_ok=False)
    media = out / 'sea-filtered.wav'
    filters = (f"highpass=f={sea['highpassHz']},lowpass=f={sea['lowpassHz']},"
               f"atrim=start={sea['sourceOffset']}:duration={duration},asetpts=PTS-STARTPTS")
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-i', str(source), '-af', filters,
                    '-ar', '32000', '-ac', '2', '-c:a', 'pcm_f32le', str(media)], check=True)
    cue = dict(scene='yahiko-summit-sea', start=sea['start'], end=sea['end'],
               duration=duration, source=str(source), sourceOffset=sea['sourceOffset'],
               source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),
               source_license='Luftrum / Oceanwavescrushing / CC BY 3.0; see V38 LICENSES.md',
               intent='远眺海面：原录音降低 3 dB，延长淡入至 0.8 秒，声音居中。',
               gain=sea['gain'] * 10 ** (-3 / 20), pan=0,
               fadeIn=0.8, fadeOut=0.65, sampleRate=32000)
    (out / 'cue.json').write_text(json.dumps(cue, ensure_ascii=False, indent=2) + '\n')
    tracks = []
    for name in ('SEA_DAEMON', 'SEA_MCP'):
        tracks.append(f'''  <TRACK
    NAME "{name}"
    VOLPAN 0.01 0 1 -1
    MUTESOLO 1 0 0
    <ITEM
      POSITION 0
      LENGTH {duration}
      VOLPAN 1 0 1 -1
      SOFFS 0
      FADEIN 0 0 0
      FADEOUT 0 0 0
      NAME "sea-filtered.wav"
      <SOURCE WAVE
        FILE {json.dumps(str(media))}
      >
    >
  >''')
    project = '<REAPER_PROJECT 0.1 7.85 1\n  SAMPLERATE 32000\n  TEMPO 120\n'
    project += '\n'.join(tracks) + '\n>\n'
    (out / 'trial.rpp').write_text(project)
    (out / 'daemon-arrange.lua').write_text('''local a = ...
local track
for i = 0, reaper.CountTracks(0) - 1 do
  local t = reaper.GetTrack(0, i)
  local _, name = reaper.GetTrackName(t)
  if name == "SEA_DAEMON" then assert(not track, "Ambiguous track"); track = t end
end
assert(track and reaper.CountTrackMediaItems(track) == 1, "Expected trial track and one item")
local item = reaper.GetTrackMediaItem(track, 0)
for key, value in pairs({D_POSITION=a.start, D_LENGTH=a.duration,
  D_FADEINLEN=a.fadeIn, D_FADEOUTLEN=a.fadeOut, C_FADEINSHAPE=0, C_FADEOUTSHAPE=0}) do
  assert(reaper.SetMediaItemInfo_Value(item, key, value))
  assert(math.abs(reaper.GetMediaItemInfo_Value(item, key)-value) < 0.000001)
end
reaper.UpdateArrange()
return {position=reaper.GetMediaItemInfo_Value(item, "D_POSITION"),
  length=reaper.GetMediaItemInfo_Value(item, "D_LENGTH"),
  fadeIn=reaper.GetMediaItemInfo_Value(item, "D_FADEINLEN"),
  fadeOut=reaper.GetMediaItemInfo_Value(item, "D_FADEOUTLEN")}
''')
    print(json.dumps(dict(project=str(out / 'trial.rpp'), cue=str(out / 'cue.json'),
                          gain_db=20 * math.log10(cue['gain'])), indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--mix', type=Path, default=ROOT / 'viz/autumn/audio/yahiko-v38/mix.json')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    prepare(args.source, args.mix, args.out)
