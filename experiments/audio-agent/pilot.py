"""Agent-authored cue -> candidates -> original V38 mixer configuration."""
import argparse
import hashlib
import json
import math
import platform
import struct
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / 'viz/autumn/audio/yahiko-v38'


def write_json(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def plan():
    mix = json.loads((BASE / 'mix.json').read_text())
    sea = mix['sea']
    return dict(scene='yahiko-summit-sea', start=sea['start'], end=sea['end'],
                duration=round(sea['end'] - sea['start'], 6),
                timeline_source='viz/autumn/audio/yahiko-v38/mix.json',
                storyboard_source='stories/yahiko-v38.md',
                intent='山顶远眺海面，轻柔远景海浪氛围，保留原镜头时段',
                prompt='Soft distant ocean surf, gentle continuous waves washing against a shore, quiet airy outdoor ambience, smooth natural water sound.',
                negative_prompt='Music, speech, voices, birds, bells, loud crashing waves, distortion, abrupt impacts.',
                model='cvssp/audioldm2', model_license='CC-BY-NC-SA-4.0',
                seeds=[38, 39], steps=50, generation_seconds=5.0,
                highpass_hz=sea['highpassHz'], lowpass_hz=sea['lowpassHz'],
                fade_in=0.5, fade_out=0.65,
                target_rms=0.0065, peak_cap=0.025,
                selection='试听比较后用 select 显式指定；不以电平替代听感判断')


def generate(cue, out):
    import torch
    if not torch.backends.mps.is_available():
        raise RuntimeError('MPS unavailable: run this command in the Apple Silicon Mac terminal.')
    from diffusers import AudioLDM2Pipeline
    from huggingface_hub import model_info
    from scipy.io.wavfile import write
    for seed in cue['seeds']:
        if (out / f'candidate-{seed}.wav').exists():
            raise FileExistsError(f'candidate-{seed}.wav exists; use a new output directory')
    revision = model_info(cue['model']).sha
    started = time.perf_counter()
    pipe = AudioLDM2Pipeline.from_pretrained(cue['model'], revision=revision, torch_dtype=torch.float32).to('mps')
    pipe.enable_attention_slicing()
    load_seconds = time.perf_counter() - started
    records = []
    for seed in cue['seeds']:
        torch.mps.synchronize()
        started = time.perf_counter()
        audio = pipe(cue['prompt'], negative_prompt=cue['negative_prompt'],
                     num_inference_steps=cue['steps'], audio_length_in_s=cue['generation_seconds'],
                     num_waveforms_per_prompt=1,
                     generator=torch.Generator(device='cpu').manual_seed(seed)).audios[0]
        torch.mps.synchronize()
        path = out / f'candidate-{seed}.wav'
        write(path, 16000, audio)
        records.append(dict(seed=seed, path=path.name, seconds=time.perf_counter()-started,
                            sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
        write_json(out / 'generation.json', dict(model=cue['model'], revision=revision,
                   license=cue['model_license'], dtype='float32', device='mps',
                   torch=torch.__version__, platform=platform.platform(),
                   load_seconds=load_seconds, candidates=records))


def select(cue, candidate, offset, out, license_text):
    if not math.isfinite(offset) or offset < 0:
        raise ValueError('offset must be finite and non-negative')
    candidate = candidate.resolve(strict=True)
    filters = f"highpass=f={cue['highpass_hz']},lowpass=f={cue['lowpass_hz']}"
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(candidate),
          '-af', filters, '-ar', '32000', '-ac', '2', '-f', 'f32le', 'pipe:1'])
    samples = [x[0] for x in struct.iter_unpack('<f', raw)]
    begin = round(offset * 32000) * 2
    count = round(cue['duration'] * 32000) * 2
    excerpt = samples[begin:begin+count]
    if len(excerpt) != count or not all(math.isfinite(x) for x in excerpt):
        raise ValueError('candidate too short or contains non-finite samples')
    peak = max(abs(x) for x in excerpt)
    rms = math.sqrt(sum(x*x for x in excerpt) / count)
    if rms < 1e-7:
        raise ValueError('candidate is silent')
    gain = min(cue['target_rms']/rms, cue['peak_cap']/peak)
    # Original WebAudio mixer owns filtering, placement, fades and complete mixing.
    config = dict(source=str(candidate), sourceOffset=offset, gain=gain,
                  start=cue['start'], end=cue['end'],
                  output=str((out / 'full-mix').resolve()),
                  provenance=dict(license=license_text, sha256=hashlib.sha256(candidate.read_bytes()).hexdigest()))
    write_json(out / 'mixer-input.json', config)
    write_json(out / 'selection.json', dict(**config['provenance'], source=str(candidate),
               filtered_rms=rms, filtered_peak=peak, gain=gain,
               review='selected explicitly; subjective quality not automatically scored'))
    preview = out / 'audition.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-n', '-i', str(candidate), '-af',
        filters + f",atrim=start={offset}:duration={cue['duration']},asetpts=PTS-STARTPTS,volume={gain},afade=t=in:d={cue['fade_in']},afade=t=out:st={cue['duration']-cue['fade_out']}:d={cue['fade_out']}",
        '-ar', '32000', '-ac', '2', '-c:a', 'pcm_s16le', str(preview)], check=True)
    return config


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['plan', 'generate', 'select'])
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--candidate', type=Path)
    parser.add_argument('--offset', type=float)
    parser.add_argument('--license')
    args = parser.parse_args()
    out = args.out.resolve()
    if out == BASE.resolve() or BASE.resolve() in out.parents:
        parser.error('use a separate experiment output directory')
    out.mkdir(parents=True, exist_ok=True)
    cue_path = out / 'cue.json'
    if args.action == 'plan':
        if cue_path.exists():
            parser.error('cue.json exists; use a new output directory')
        write_json(cue_path, plan())
    else:
        cue = json.loads(cue_path.read_text())
        if args.action == 'generate':
            generate(cue, out)
        else:
            if not args.candidate:
                args.candidate = BASE / 'sea-source.ogg'
                if args.offset is None:
                    args.offset = 12
                args.license = 'Luftrum, Oceanwavescrushing, CC BY 3.0; viz/autumn/audio/yahiko-v38/LICENSES.md'
            if args.offset is None:
                args.offset = 0
            if not args.license:
                manifest = out / 'generation.json'
                generated = json.loads(manifest.read_text()) if manifest.exists() else {}
                digest = hashlib.sha256(args.candidate.read_bytes()).hexdigest()
                if not any(c['sha256'] == digest for c in generated.get('candidates', [])):
                    parser.error('external candidate requires --license with author/source/license')
                args.license = generated['license'] + '; ' + generated['model'] + '@' + generated['revision']
            for name in ['audition.wav', 'mixer-input.json', 'selection.json']:
                if (out / name).exists():
                    parser.error(f'{name} exists; use a new output directory')
            select(cue, args.candidate, args.offset, out, args.license)
    print(out)


if __name__ == '__main__':
    main()
