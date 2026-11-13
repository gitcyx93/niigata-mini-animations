#!/usr/bin/env python3
"""Build the ramen v15 soundtrack: effects-only and effects + synthesized music.

Recorded beds reuse sources already committed for Yahiko (licences in
viz/explore/audio/ramen-v15/LICENSES.md). Every short cue and the music are
synthesized here with numpy; nothing is presented as a field recording.
Timings follow PLAN in viz/explore/ramen-meisho-v15-sound.html (Fable v11 pacing).
Run: python3 viz/tools/build-ramen-v15-audio.py
"""
import json, os, subprocess
import numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'viz/explore/audio/ramen-v15')
SR, DUR = 44100, 43.0
N = int(SR * DUR)
rng = np.random.default_rng(20261113)


def load(rel, start=0.0, length=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start)] + (['-t', str(length)] if length else []) + \
          ['-i', os.path.join(ROOT, rel), '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-']
    a = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)
    return a.reshape(-1, 2).T.copy()


def fft_filter(x, lo=0.0, hi=None, soft=0.15):
    """Band-pass by FFT mask with soft edges (works on mono or stereo)."""
    X = np.fft.rfft(x, axis=-1)
    f = np.fft.rfftfreq(x.shape[-1], 1 / SR)
    m = np.ones_like(f)
    if lo > 0:
        m *= np.clip((f - lo * (1 - soft)) / (lo * soft * 2 + 1e-9), 0, 1)
    if hi:
        m *= np.clip((hi * (1 + soft) - f) / (hi * soft * 2 + 1e-9), 0, 1)
    return np.fft.irfft(X * m, n=x.shape[-1], axis=-1)


def env(n, a, r, shape=1.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
    return e ** shape


def fade(x, fi, fo):
    n = x.shape[-1]; e = np.ones(n)
    k = int(fi * SR); e[:k] = np.linspace(0, 1, k) if k else e[:k]
    k = int(fo * SR); e[n - k:] = np.linspace(1, 0, k) if k else e[n - k:]
    return x * e


def rms(x):
    return float(np.sqrt(np.mean(x ** 2)) + 1e-12)


# ---------- buses ----------
fx = np.zeros((2, N)); music = np.zeros((2, N)); duck = np.ones(N)
cues = []


def place(bus, sig, at, gain=1.0, pan=0.0, name=None):
    if sig.ndim == 1:
        sig = np.stack([sig * np.sqrt((1 - pan) / 2) * 1.414, sig * np.sqrt((1 + pan) / 2) * 1.414])
    i = int(at * SR); n = min(sig.shape[1], N - i)
    if n <= 0: return
    bus[:, i:i + n] += sig[:, :n] * gain
    if name: cues.append({'t': round(at, 2), 'cue': name})


def ducked(at, length=0.5, depth=0.6):
    i = int(at * SR); n = int(length * SR)
    seg = 1 - depth * np.sin(np.linspace(0, np.pi, n)) ** 0.5
    duck[i:i + n] = np.minimum(duck[i:i + n], seg[:max(0, min(n, N - i))])


# ---------- synthesized cues ----------
def noise(n):
    return rng.standard_normal(n)


def pop(f0=520, dur=0.16):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.7 * np.exp(-t / 0.018))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.045)
    return s + 0.15 * fft_filter(noise(n), 2000, 7000) * env(n, 0.001, 0.008)


def clink(f=1300, dur=0.9, bright=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t + p) * np.exp(-t / d)
            for r, a, d, p in [(1, 1, .35, 0), (2.76, .5 * bright, .16, 1), (5.40, .25 * bright, .07, 2), (8.9, .1 * bright, .03, .5)])
    return s * np.minimum(1, t / 0.002) + 0.2 * fft_filter(noise(n), 3000, 9000) * env(n, 0.0005, 0.004)


def thunk(f=130, dur=0.3):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t * (1 + 0.3 * np.exp(-t / .02))) * env(n, 0.002, 0.06) + 0.35 * fft_filter(noise(n), 200, 1500) * env(n, 0.001, 0.015)


def mix(*sigs):
    n = max(len(x) for x in sigs); out = np.zeros(n)
    for x in sigs: out[:len(x)] += x
    return out


def bowl_down():
    return mix(thunk(150, 0.35) * 0.9, clink(980, 0.7, 0.6) * 0.35)


def wood(f=950):
    n = int(0.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 2.3 * t)) * env(n, 0.0008, 0.018) + 0.3 * fft_filter(noise(n), 800, 4000) * env(n, .0005, .006)


def swish(dur, lo, hi, a=0.3, shape=1.0):
    n = int(dur * SR); x = fft_filter(noise(n), lo, hi)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * np.clip(t, 0, 1)) ** (a * 4) * (1 + 0.25 * np.sin(2 * np.pi * 23 * t * dur))
    return x * e ** shape


def brush(dur=0.36):
    return swish(dur + 0.08, 1800, 7000, 0.25) * 0.9 + swish(dur + 0.08, 300, 1400, 0.4) * 0.25


def stamp():
    n = int(0.5 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 85 * t * (1 + .5 * np.exp(-t / .015))) * env(n, 0.001, 0.09)
    slap = fft_filter(noise(n), 300, 2500) * env(n, 0.0008, 0.02)
    return body + 0.6 * slap


def page_turn():
    n = int(0.55 * SR); x = noise(n); out = np.zeros(n); seg = n // 8
    for k in range(8):                                     # band sweeps upward as the sheet flips
        sl = slice(k * seg, (k + 1) * seg if k < 7 else n)
        out[sl] = fft_filter(x[sl], 500 + k * 350, 2500 + k * 700)
    t = np.linspace(0, 1, n)
    return out * np.sin(np.pi * t) ** 1.5 * (1 + 0.5 * (np.sin(2 * np.pi * 9 * t) > 0))


def slurp():
    n = int(0.42 * SR); x = noise(n); out = np.zeros(n); seg = n // 6
    for k in range(6):
        sl = slice(k * seg, (k + 1) * seg if k < 5 else n)
        out[sl] = fft_filter(x[sl], 500 + k * 260, 900 + k * 420)
    t = np.linspace(0, 1, n)
    return out * np.sin(np.pi * t) ** 2 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 14 * t)))


def additive(f, dur, partials, a=0.05, r=0.4, vib=0.0, vibf=5.0):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * (t + vib / (2 * np.pi * vibf) * np.sin(2 * np.pi * vibf * t))
    s = sum(amp * np.sin(k * ph) for k, amp in partials)
    e = np.minimum(1, t / a) * np.minimum(1, np.maximum(0, (dur - t) / r))
    return s * e


def ship_horn():
    p = [(1, 1), (2, .55), (3, .35), (4, .2), (5, .12), (6, .06)]
    h = additive(110, 1.6, p, .18, .6, .004, 4.5) + 0.8 * additive(164.8, 1.6, p, .2, .6, .004, 4.1)
    h = fft_filter(h, 60, 900)
    echo = np.zeros(len(h) + int(.42 * SR)); echo[:len(h)] += h; echo[int(.42 * SR):] += .28 * h
    return echo


def sour():
    p = [(1, 1), (2, .45), (3, .2), (4, .08)]
    return additive(110, 1.6, p, .12, .9, .003) + .7 * additive(116.5, 1.6, p, .14, .9, .003)


def noodle_slap():
    n = int(.25 * SR)
    return thunk(115, 0.25) * 0.8 + 0.5 * fft_filter(noise(n), 900, 5000) * env(n, .0005, .01)


def brown(n, lo=40, hi=500):
    return fft_filter(np.cumsum(noise(n)) * 0.02, lo, hi)


def murmur(dur):
    """Indistinct room tone: low brown noise with slow swells (not voices)."""
    n = int(dur * SR); t = np.arange(n) / SR
    b = brown(n, 80, 700); b /= rms(b)
    sw = 0.75 + 0.25 * np.sin(2 * np.pi * 0.31 * t) * np.sin(2 * np.pi * 0.17 * t + 1)
    return np.stack([b * sw, np.roll(b, 4410) * sw])


# ---------- recorded beds (already in repo, licences in LICENSES.md) ----------
def norm_to(x, target_db):
    return x * (10 ** (target_db / 20) / rms(x))


sea = load('viz/autumn/audio/yahiko-v38/sea-source.ogg', 20, 12.0)
wind = load('viz/autumn/audio/yahiko-v16-travel/stems/environment.flac', 2, 8.0)
river = load('reference/yahiko-v25/sound-candidates-v1/03-water/349076-trickling-stream-preview.mp3', 4, 9.0)
furin = load('reference/yahiko-v25/sound-candidates-v1/edited-v1/01-furin-single-tail.wav')

# page beds with 0.5 s crossfades around page turns
place(fx, fade(norm_to(murmur(5.0), -40), .3, .5), 0.0)                                   # 1 shop room tone
place(fx, fade(norm_to(fft_filter(sea[:, :int(5.6 * SR)], 90, 2600), -31), .5, .5), 4.2)   # 2 Yokohama harbour
place(fx, fade(norm_to(murmur(5.6), -37), .5, .5), 9.2)                                   # 3 Asakusa street
place(fx, fade(norm_to(fft_filter(wind[:, :int(7.6 * SR)], 60, 700), -34), .5, .6), 14.2)  # 4 snow wind behind glass
place(fx, fade(norm_to(murmur(7.6), -45), .5, .5), 14.2)
place(fx, fade(norm_to(murmur(7.0), -44), .5, .5), 21.2)                                  # 5 quiet shop
place(fx, fade(norm_to(fft_filter(sea[:, int(6 * SR):int(13.5 * SR)], 60, 700), -38), .5, .5), 27.6)  # 6 distant sea on the map
place(fx, fade(norm_to(fft_filter(river[:, :int(8.4 * SR)], 120, 3500), -33), .5, .6), 34.6)  # 7 Shinano river

# page 1 — present-day shop, thought cloud, Hokkaido
for at, f, p in [(0.8, 1500, -.5), (2.1, 1250, .6), (3.6, 1700, -.3)]:
    place(fx, clink(f, .6, .7), at, 0.05, p, 'chopstick / bowl clink')
for at in (1.05, 2.9):
    place(fx, slurp(), at, 0.10, 0.0, 'slurp')
place(fx, pop(560), 0.55, 0.22, -.1, 'thought cloud pop'); ducked(0.55)
place(fx, fade(furin[:, :int(2.4 * SR)], 0, .8), 2.32, 0.55, -.1, 'furin: Hokkaido appears'); ducked(2.32, 1.0)

# page 2 — Yokohama
place(fx, ship_horn(), 4.95, 0.10, .4, 'distant ship horn'); ducked(4.95, 1.6, .4)
place(fx, pop(470), 5.6, 0.18, -.2, 'speech bubble')
for at in (5.45, 6.88, 8.31):
    place(fx, noodle_slap(), at, 0.20, -.25, 'noodle slap')

# page 3 — Asakusa queue
place(fx, pop(500), 10.5, 0.16, -.3, 'speech bubble')
for k, at in enumerate([11.12, 11.36, 11.6, 13.02, 13.26, 13.5]):
    place(fx, wood(880 + 90 * (k % 2)), at, 0.12, -.4 + .15 * (k % 3), 'geta step')

# page 4 — Takeya
place(fx, pop(620), 15.62, 0.24, -.1, '「好了！」 bubble'); ducked(15.62)
place(fx, bowl_down(), 16.25, 0.30, .2, 'bowl set down')
place(fx, sour(), 18.1, 0.10, -.3, 'slur lands'); ducked(18.1, 1.4, .5)
place(fx, pop(330, .22), 18.55, 0.14, .4, 'pensive thought')

# page 5 — writing ラーメン
for i in range(7):
    place(fx, brush(), 22.2 + 0.46 * i, 0.10, (i - 3) * .05, 'brush stroke')
place(fx, pop(700), 25.35, 0.14, .3, 'la / men cards')
place(fx, stamp(), 26.22, 0.40, .25, 'seal stamp'); ducked(26.22, .6)

# page 6 — map of regional bowls
place(fx, swish(0.9, 600, 3000, .4), 28.1, 0.05, -.4, 'route drawn')
place(fx, pop(480), 28.85, 0.15, -.1, 'Yokohama')
SCALE = [587.3, 659.3, 784.0, 880.0, 987.8, 1174.7, 1318.5]          # D yo scale, rising per bowl
for k, t0 in enumerate([.5, .82, 1.14, 1.46, 1.78, 2.1, 2.42]):
    place(fx, clink(SCALE[k] * 2, .7, .5), 28 + t0 + .12, 0.07, .4 - .12 * k, 'regional bowl')
place(fx, fade(furin[:, :int(2.0 * SR)], 0, .7), 31.02, 0.40, .1, 'furin: Niigata'); ducked(31.02, 1.0)
place(fx, stamp(), 32.85, 0.38, .25, 'seal stamp'); ducked(32.85, .6)

# page 7 — Niigata five
for k, a in enumerate([.35, 1.15, 3.35, 3.85, 4.35]):
    place(fx, mix(bowl_down() * .6, clink(SCALE[k + 1] * 1.5, .6, .4) * .25), 35 + a + .3, 0.28, (k - 2) * .15, 'Niigata bowl')
place(fx, stamp(), 41.1, 0.42, .2, 'seal stamp'); ducked(41.1, .6)

# page turns
for at in (4.1, 9.1, 14.1, 21.1, 27.5, 34.5, 42.45):
    place(fx, page_turn(), at, 0.09, .3, 'page turn')

# ---------- synthesized music (D yo-scale, ~66 BPM, no drums, no vocals) ----------
BEAT = 60 / 66
NOTE = {'D3': 146.8, 'E3': 164.8, 'G3': 196.0, 'A3': 220.0, 'B3': 246.9, 'D4': 293.7, 'E4': 329.6, 'G4': 392.0,
        'A4': 440.0, 'B4': 493.9, 'D5': 587.3, 'E5': 659.3, 'D2': 73.4, 'E2': 82.4, 'G2': 98.0, 'A2': 110.0, 'B2': 123.5}


def koto(f, dur=2.4, amp=1.0):
    """Plucked-string tone: additive partials, upper ones die faster, slight inharmonic shimmer."""
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, 9):
        fk = f * k * (1 + 0.0007 * k * k)
        s += (0.9 / k ** 1.1) * np.sin(2 * np.pi * fk * t + k) * np.exp(-t * (1.1 + 0.9 * k))
    s *= np.minimum(1, t / 0.004)
    return s * amp + 0.05 * fft_filter(noise(n), 1500, 6000) * env(n, .0005, .006)


def pad(freqs, dur, amp=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + i) + 0.3 * np.sin(4 * np.pi * f * t + 2 * i) for i, f in enumerate(freqs))
    return s * np.minimum(1, t / 1.2) * np.minimum(1, (dur - t) / 1.2) * amp / len(freqs)


# chords follow the pages: (start, end, pad notes, bass root)
CH = [(0, 4.6, ['D3', 'A3', 'E4'], 'D2'), (4.6, 9.6, ['G3', 'D4', 'A4'], 'G2'), (9.6, 14.6, ['B3', 'D4', 'A4'], 'B2'),
      (14.6, 21.6, ['E3', 'B3', 'D4', 'G4'], 'E2'), (21.6, 28, ['G3', 'D4', 'B4'], 'G2'), (28, 35, ['A3', 'E4', 'B4'], 'A2'),
      (35, 43, ['D3', 'A3', 'E4', 'B4'], 'D2')]
mel_notes = ['D4', 'E4', 'G4', 'A4', 'B4', 'D5', 'E5']
mrng = np.random.default_rng(66)
for a, b, chord, root in CH:
    place(music, pad([NOTE[c] for c in chord], b - a + 1.0, 1.0), max(0, a - 0.5), 0.05, 0)
    t = a
    while t < b - 0.2:                                           # bass pluck each bar (4 beats)
        place(music, koto(NOTE[root] * 2, 3.0, 0.8), t, 0.10, -.1)
        t += 4 * BEAT
    # melody: sparse eighth-note phrases, stepwise, resting on chord tones
    idx = 2; t = a + BEAT
    while t < b - 0.6:
        if mrng.random() < 0.55:
            idx = int(np.clip(idx + mrng.choice([-2, -1, -1, 1, 1, 2]), 0, len(mel_notes) - 1))
            place(music, koto(NOTE[mel_notes[idx]], 2.2, 0.9), t, 0.075, .25 * np.sin(t))
        t += BEAT * (0.5 if mrng.random() < 0.6 else 1.0)
music = fade(fft_filter(music, 50, 9000), 0.4, 1.0) * duck[None, :]

# ---------- master ----------
fx = fade(fx, 0.02, 0.15)
peak_fx = float(np.max(np.abs(fx)))
target = 10 ** (-1.5 / 20)
g_fx = target / max(peak_fx, 1e-9)
fx *= min(g_fx, 4.0)
music *= 10 ** (-30 / 20) / rms(music)                       # music sits well under the effects
master = fx + music
pk = float(np.max(np.abs(master)))
if pk > target:
    fx *= target / pk; music *= target / pk; master *= target / pk

os.makedirs(OUT, exist_ok=True)


def write(name, x):
    pcm = np.clip(x.T, -1, 1).astype(np.float32).tobytes()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-',
                    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', os.path.join(OUT, name)], input=pcm, check=True)


write('effects.m4a', fx)
write('master.m4a', master)
db = lambda x: round(20 * np.log10(rms(x)), 1)
json.dump({'duration': DUR, 'sampleRate': SR, 'effects_rms_db': db(fx), 'music_rms_db': db(music),
           'master_peak': round(float(np.max(np.abs(master))), 3), 'music': 'synthesized here: D yo-scale plucks + pad, ~66 BPM, ducked under key cues',
           'cues': sorted(cues, key=lambda c: c['t'])},
          open(os.path.join(OUT, 'mix.json'), 'w'), ensure_ascii=False, indent=1)
print('effects', db(fx), 'dB  music', db(music), 'dB  peak', round(float(np.max(np.abs(master))), 3), ' cues', len(cues))
