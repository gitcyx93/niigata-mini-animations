"""V51: add licensed Foley to the corrected V50, without changing the base gain or visuals."""
import base64
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
SR, DUR = 32000, 28.1
N = round(SR * DUR)
OUT = ROOT / 'viz/autumn/audio/yahiko-v51'
REF = ROOT / 'reference/yahiko-v50-sound'
OUT.mkdir(parents=True, exist_ok=True)
ffmpeg = os.environ.get('FFMPEG') or shutil.which('ffmpeg')
if not ffmpeg:
    ffmpeg = next((Path.home() / 'AppData/Local/Microsoft/WinGet/Packages').glob('Gyan.FFmpeg.Essentials_*/ffmpeg-*/bin/ffmpeg.exe'), None)
if not ffmpeg:
    raise RuntimeError('FFmpeg not found; set FFMPEG to an existing executable')
ffmpeg = str(ffmpeg)
rows = {int(r['key'].split(':')[1]): r for r in json.loads((REF / 'candidates.json').read_text(encoding='utf8'))}
used, events = set(), []
stems = {k: np.zeros((N, 2), np.float32) for k in ['door', 'shutter', 'steps', 'park']}

def decode(path, filters=None):
    args = [ffmpeg, '-v', 'error', '-i', str(path)]
    if filters:
        args += ['-af', filters]
    raw = subprocess.check_output(args + ['-f', 'f32le', '-ac', '2', '-ar', str(SR), 'pipe:1'])
    x = np.frombuffer(raw, '<f4').reshape(-1, 2).copy()
    assert len(x) and np.isfinite(x).all()
    return x

def source(sid, filters):
    r = rows[sid]
    assert r['license'] in ('CC0', 'BY') and r['license_urls']
    used.add(sid)
    return decode(REF / r['file'], filters)

def fade(x, attack=.01, release=.04):
    x = x.copy()
    a, b = min(len(x)//2, round(attack*SR)), min(len(x)//2, round(release*SR))
    if a:
        x[:a] *= np.linspace(0, 1, a)[:, None]
    if b:
        x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x

def level(x, peak):
    p = float(np.max(np.abs(x)))
    assert p > 1e-7
    return x * (peak/p)

def place(stem, x, at, sid, source_start, note):
    assert 0 <= at < DUR and len(x) <= N
    start = round(at*SR)
    first = min(len(x), N-start)
    stems[stem][start:start+first] += x[:first]
    if first < len(x):
        stems[stem][:len(x)-first] += x[first:]
    events.append(dict(stem=stem, at=round(at, 5), length=round(len(x)/SR, 5), source=sid,
                       source_start=round(source_start, 5), wraps=first<len(x), note=note))

def write_wav(path, x):
    assert np.isfinite(x).all() and np.max(np.abs(x)) < 1
    with wave.open(str(path), 'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes(np.round(x*32767).astype('<i2').tobytes())

base_path = ROOT / 'viz/autumn/audio/yahiko-v49/master.mp3'
base = decode(base_path)
assert len(base) == N, 'Unexpected base duration; do not silently stretch or truncate it'
# Door velocity is 6u(1-u): one pull, no repeated scrape and no invented hinge squeak.
door = source(381966, 'highpass=f=140,lowpass=f=4300')
door = door[round(.7*SR):round(1.6*SR)]
u = np.linspace(0, 1, len(door))
door *= (4*u*(1-u))[:, None]
place('door', level(fade(door), .038), 18.5, 381966, .7, 'Right sliding panel: 0.9s pull; speed-shaped envelope')
# Use the complete short shutter; wrap the last tail instead of cutting it at 28.1.
shutter = source(231286, 'highpass=f=180,lowpass=f=5500')
shutter = level(fade(shutter, .002, .015), .032)
for t in [2.1, 24.6, 27.9]:
    place('shutter', shutter, t, 231286, 0, 'One camera on the left bank; no phone click layer')

stone = source(521590, 'highpass=f=180,lowpass=f=3600')
# These source ranges each contain a separate step, not a looped walking rhythm.
stone_clips = [fade(stone[round(a*SR):round(b*SR)], .004, .045) for a,b in [(0.08,.30),(.60,.88),(1.16,1.40)]]
for who, phase in enumerate([1.5, 0]):
    for k in range(1, 9):
        e = (k*math.pi-phase)/24
        if not 0 < e < 1:
            continue
        a = .5+2.9*(1-(1-e)**(1/1.35))
        # Back-view feet return to the paving at each phase crossing; retain the easing.
        clip = level(stone_clips[(k+who)%3], .011*(1-.35*e))
        clip[:, who] *= .85
        place('steps', clip, 17+a, 521590, [.08,.60,1.16][(k+who)%3], 'Visitor foot plant from eased V50 walking phase')
# Innkeeper takes one small step, then stays silent while bowing.
place('steps', level(stone_clips[0], .006), 19.82, 521590, .08, 'Single quiet step over the threshold')

gravel = source(648338, 'highpass=f=170,lowpass=f=3300')
# Select a brief isolated impact from the first 2s, then align it to the retimed torii walk.
power = np.mean(gravel[:2*SR]**2, axis=1)
energy = np.convolve(power, np.ones(320)/320, mode='valid')
center = int(np.argmax(energy))
g0 = max(0, center-round(.035*SR))
gstep = level(fade(gravel[g0:g0+round(.22*SR)], .005, .06), .007)
grid = np.linspace(2.8, 6, 10001)
u = (grid-2.8)/3.2
age = 3.2*(u-.75*u*u+.5*u*u*u)
for ph in [0, 1.5]:
    for k in range(1, 5):
        target = 1.5+(k*math.pi-ph)/5.4
        if 1.5 < target < age[-1]:
            at = float(np.interp(target, age, grid))
            place('steps', gstep, at, 648338, g0/SR, 'Torii foot plant includes sourceTime easing, not a uniform time offset')

park = source(75273, 'highpass=f=260,lowpass=f=2500')
# A single forward segment crosses the film boundary; do not reverse or tile the ambience.
park = fade(park[30*SR:round(38.6*SR)], .8, .8)
park *= .0015 / max(1e-9, float(np.sqrt(np.mean(park**2))))
if np.max(np.abs(park)) > .014:
    park *= .014 / np.max(np.abs(park))
place('park', park, 22.3, 75273, 30, 'Low-level Tokyo dusk park recording, not Yahiko location sound or isolated crowd')

# Requested balance revision: only camera and footsteps, +4 dB each.
boost = 10**(4/20)
stems['shutter'] *= boost
stems['steps'] *= boost
added = sum(stems.values())
mixed = base+added
assert np.allclose(mixed-added, base, atol=2e-8), 'Base gain changed'
assert np.max(np.abs(mixed)) < .95, 'Clipping risk; lower added effects, never normalize the approved base'
# The wrapping park segment must be contiguous at the loop boundary.
assert np.allclose(stems['park'][-1], park[round(5.8*SR)-1])
assert np.allclose(stems['park'][0], park[round(5.8*SR)])
for name,x in {**stems, 'new-effects':added, 'master':mixed}.items():
    write_wav(OUT / (name+'.wav'), x)
# Opening solos use the exact mix gain, not individual normalization.
for name, x in {'mix':mixed, 'base':base, 'park':stems['park'], 'shutter':stems['shutter'], 'steps':stems['steps']}.items():
    write_wav(OUT / ('opening-'+name+'.wav'), x[:6*SR])
subprocess.run([ffmpeg, '-v','error','-y','-i',str(OUT/'master.wav'),'-c:a','libmp3lame','-b:a','192k',str(OUT/'master.mp3')], check=True)
encoded = decode(OUT/'master.mp3')
assert len(encoded) == N and np.max(np.abs(encoded)) < .95
manifest = dict(version='V51 audition r2', duration=DUR, sample_rate=SR, base_gain=1,
                stem_adjustment_db={'shutter':4, 'steps':4, 'door':0, 'park':0},
                base_sha256=hashlib.sha256(base_path.read_bytes()).hexdigest(),
                base_peak=float(np.max(np.abs(base))), mixed_peak=float(np.max(np.abs(mixed))),
                encoded_peak=float(np.max(np.abs(encoded))), events=events,
                sources=[rows[s] for s in sorted(used)], listened=False,
                limits=['Old V49 wind/window layers retained; not independently remixed',
                        'Park candidate contains distant traffic/birds; not a clean crowd stem',
                        'No new cable-car pass sound; existing ropeway bed retained'])
(OUT/'mix.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
credits = '# V51 新增声音来源与授权\n\n以下均为真实录音的 Freesound MP3 预览，并非弥彦现场实录。已剪辑、滤波、调低音量并按动作放置。\n\n'
for sid in sorted(used):
    r=rows[sid]
    credits += f"- **{r['title']}** — {r['author']}；{r['page']}；{r['license_urls'][0]}\n"
credits += '\n## 沿用 V49 / V38 底轨\n\n'+(ROOT/'viz/autumn/audio/yahiko-v38/LICENSES.md').read_text(encoding='utf8')
(OUT/'LICENSES.md').write_text(credits,encoding='utf8')

page = (ROOT/'viz/autumn/yahiko-v50.html').read_text(encoding='utf8')
page = page.replace('弥彦 V50 试作', '弥彦 V51 · 动作音效试听版').replace('新潟四季 · 秋 / V50 试作','新潟四季 · 秋 / V51 音效试听')
page = re.sub(r'(<script id="yahiko-audio-data"[^>]*>).*?(</script>)',lambda m:m[1]+'data:audio/mpeg;base64,'+base64.b64encode((OUT/'master.mp3').read_bytes()).decode()+m[2],page,count=1,flags=re.S)
page = page.replace('Yahiko V50 trial, V38 ambience re-cut to the new shot order','Yahiko V51, V49 base unchanged plus action-timed Foley')
page = page.replace('audio/yahiko-v38/LICENSES.md','audio/yahiko-v51/LICENSES.md')
page = page.replace('弥彦 V39 试作 · 环境音与猫叫 · 27.8 秒','弥彦 V51 · 动作音效试听版 · 28.1 秒')
page = page.replace("credits.innerHTML='猫叫：", "credits.innerHTML='新增拉门：MattRuthSound · CC BY 4.0；快门、脚步、公园氛围：CC0（完整来源见链接）。猫叫：")
sheet = '<summary>V51 音效时间表与分轨试听</summary><p>本轮仅相机、脚步各提高 4 dB，其他声音不动。<a href="audio/yahiko-v51/opening.html">开头 0–6 秒同音量分轨试听</a>。分轨保持成片音量，未做人耳听审。</p><div id="solo-buttons" style="display:flex;gap:5px;flex-wrap:wrap"></div><table style="width:100%;text-align:left;font-size:12px;line-height:1.8"><tbody>'
for t,label in [('2.1 / 24.6 / 27.9 秒','岸边三次相机快门，末次尾音跨循环'),('鸟居行走段 / 17.5–20.4 秒','按人物步相放置的轻脚步'),('18.5–19.4 秒','半扇木滑门摩擦，跟随开门速度'),('19.82 秒','店家迈出门槛'),('19.85 秒','沿用原猫叫'),('22.3 秒 → 下一轮 2.8 秒','轻公园氛围，循环处不断开'),('全片','沿用原风铃、索道、水、海、风叶与窗框底轨；无配乐')]:
    sheet+=f'<tr><td>{t}</td><td>{label}</td></tr>'
sheet+='</tbody></table>'
page,n = re.subn(r"sheet\.innerHTML='.*?';",lambda m:'sheet.innerHTML='+json.dumps(sheet,ensure_ascii=False)+';',page,count=1)
assert n==1
old="[['原底轨：3–6秒','audition-base-3-6.wav'],['神社风铃','audition-shrine-chime.wav'],['神社树林风','audition-shrine-wind.wav'],['只听海景','audition-sea.wav']]"
assert old in page
page=page.replace(old,"[['全部新增音效','new-effects.wav'],['拉门','door.wav'],['快门','shutter.wav'],['脚步','steps.wav'],['公园氛围','park.wav']]")
page=page.replace("audition.src='audio/yahiko-v38/'+file", "audition.src='audio/yahiko-v51/'+file")
# Protect every drawing instruction: the corrected V50 FX must remain verbatim.
fx=(ROOT/'viz/autumn/yahiko-v50-fx.js').read_text(encoding='utf8')
assert fx in page
(ROOT/'viz/autumn/yahiko-v51.html').write_text(page,encoding='utf8')
print(json.dumps({'duration':DUR,'events':len(events),'peak':manifest['mixed_peak'],'encoded_peak':manifest['encoded_peak'],'base_gain':1,'output':'viz/autumn/yahiko-v51.html'},ensure_ascii=False))
