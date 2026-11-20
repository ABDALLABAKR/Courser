#!/usr/bin/env python3
"""Score for "Gravitational Lensing" — synthesized, then mixed under the narration.

  python3 sound.py marks.json narration.mp3 soundtrack.wav

* an extremely subtle atmospheric tone at the start
* delicate orchestral (string-like) textures as the spacetime grid appears
* a powerful but restrained crescendo at the Einstein ring
* shimmering textures whenever gravitational arcs appear
* in the final scene the layers are removed one by one, leaving a quiet resonant tone
* silence
"""
import json, subprocess, sys
import numpy as np

SR = 48000
M = json.load(open(sys.argv[1]))
DUR = M['end']; N = int(DUR * SR); t = np.arange(N) / SR
rng = np.random.default_rng(1919)
L = np.zeros(N); R = np.zeros(N)

def seg(t0, t1, fi, fo):
    return np.clip((t - t0) / fi, 0, 1) * np.clip((t1 - t) / fo, 0, 1)

def lowpass(x, k): return np.convolve(x, np.ones(k) / k, mode='same')

def strings(freqs, env, gain, spread=0.003, vib=4.8):
    """ensemble of slightly detuned voices with vibrato and a soft harmonic spectrum"""
    l = np.zeros(N); r = np.zeros(N)
    for f in freqs:
        for v in range(4):
            det = 1 + spread * (v - 1.5) / 1.5 + rng.uniform(-0.0008, 0.0008)
            ph = 2 * np.pi * np.cumsum(f * det * (1 + 0.0035 * np.sin(2 * np.pi * (vib + v * 0.37) * t + v))) / SR
            s = np.sin(ph) + 0.42 * np.sin(2 * ph) + 0.2 * np.sin(3 * ph) + 0.09 * np.sin(4 * ph)
            pan = (v - 1.5) / 2.2
            l += s * np.cos((pan + 1) * np.pi / 4); r += s * np.sin((pan + 1) * np.pi / 4)
    k = gain / (len(freqs) * 4)
    return l * env * k, r * env * k

def add(lr):
    global L, R
    L += lr[0]; R += lr[1]

def place(sig, at, gain, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.cos((pan + 1) * np.pi / 4) * 1.41; R[i:j] += s * np.sin((pan + 1) * np.pi / 4) * 1.41

def bell(f, dur, decay):
    n = int(dur * SR); tt = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * m * tt) for m, a in [(1, 1), (2.76, .35), (5.4, .12)])
    return s * np.minimum(1, tt / 0.004) * np.exp(-tt / decay)

# atmosphere: an extremely subtle tone + filtered air, present until the very end of the music
air = lowpass(rng.standard_normal(N), 400) * 0.006
drone_env = np.clip(t / 6, 0, 1) * np.clip((M['end'] - 3.5 - t) / 3.0, 0, 1)
L += (air + 0.012 * np.sin(2 * np.pi * 55 * t) + 0.006 * np.sin(2 * np.pi * 82.4 * t)) * drone_env
R += (lowpass(rng.standard_normal(N), 400) * 0.006 + 0.012 * np.sin(2 * np.pi * 55.1 * t + 1) + 0.006 * np.sin(2 * np.pi * 82.5 * t)) * drone_env

# orchestral textures: spacetime appears
remove = lambda k: np.clip((M['simplify'] + k * 1.6 - t) / 2.5, 0, 1)            # final scene: layers removed one by one
add(strings([110, 164.8, 220], seg(M['grid'], DUR, 6, 1) * remove(0), 0.05))         # low strings (A minor colour)
add(strings([261.6, 329.6], seg(M['curve'], DUR, 5, 1) * remove(1), 0.035, vib=5.3))   # mid voices as spacetime curves
add(strings([392.0, 493.9, 587.3], seg(M['side'], DUR, 5, 1) * remove(2), 0.022, spread=0.004))  # light paths: higher, thinner

# crescendo at the Einstein ring: powerful but restrained (swell, then settle)
cres = np.clip((t - M['align']) / (M['einstein'] - M['align']), 0, 1) ** 1.6 * np.clip((M['pull'] + 2 - t) / 4.5, 0, 1)
add(strings([55, 82.4, 110, 164.8, 220, 277.2, 329.6, 440, 554.4, 659.3], cres * remove(0), 0.16, spread=0.005, vib=5.0))
for m, dt in [(1, 0), (1.5, 0.02), (2, 0.04)]:                                         # one soft, low "timpani" bloom at the ring
    n = int(4 * SR); tt = np.arange(n) / SR; place(np.sin(2 * np.pi * 55 * m * tt) * np.exp(-tt / 1.2) * np.minimum(1, tt / 0.02), M['einstein'] + dt, 0.05 / m)

# shimmering textures when arcs appear (stretched / multiplied images, ring, cluster arcs)
def shimmer(t0, dur, dens, base_gain):
    k = int(dur * dens)
    for i in range(k):
        at = t0 + rng.random() * dur; f = float(rng.choice([1318.5, 1567.98, 1760.0, 1975.5, 2349.3, 2637.0]))
        place(bell(f, 2.4, 0.5 + rng.random() * 0.6), at, base_gain * (0.5 + rng.random()), float(rng.uniform(-0.85, 0.85)))
shimmer(M['arcs'], 6.0, 2.2, 0.012); shimmer(M['ring'] - 0.5, 4.0, 3.0, 0.012); shimmer(M['arcs2'], 3.0, 2.4, 0.01)
shimmer(M['clusterArcs'], 6.0, 3.5, 0.011); shimmer(M['shear'], 6.0, 1.5, 0.007)
place(bell(880, 4, 1.8), M['einstein'], 0.03); place(bell(1320, 4, 1.6), M['einstein'] + 0.05, 0.016, 0.3)

# a darker undertone for the inferred, invisible mass
add(strings([73.4, 110], seg(M['mass'], M['simplify'] + 1.0, 4, 2.5), 0.03, vib=3.2))

# what remains: a quiet resonant tone, then silence
n = int((DUR - M['arc'] - 0.9) * SR); tt = np.arange(n) / SR
res = (np.sin(2 * np.pi * 110 * tt) + 0.35 * np.sin(2 * np.pi * 220 * tt) + 0.12 * np.sin(2 * np.pi * 330.3 * tt)) * np.minimum(1, tt / 2.5) * np.clip((tt[-1] - tt) / 2.8, 0, 1)
place(res, M['arc'], 0.05)
place(bell(659.3, 5, 2.2), M['title'], 0.02)

# space: a long, soft exponential reverb
ir_n = int(3.2 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.9 * SR)); ir = lowpass(ir, 9); ir /= np.sqrt((ir ** 2).sum())
F = 1 << int(np.ceil(np.log2(N + ir_n))); IR = np.fft.rfft(ir, F)
L = L * 0.75 + 0.5 * np.fft.irfft(np.fft.rfft(L, F) * IR, F)[:N]; R = R * 0.75 + 0.5 * np.fft.irfft(np.fft.rfft(R, F) * IR, F)[:N]
music = np.stack([L, R], 1) * np.clip((DUR - 0.4 - t) / 0.6, 0, 1)[:, None]                 # complete silence at the end

# narration + gentle ducking
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[2], '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
lead = int(M['lead'] * SR); voice = np.zeros((N, 2)); m = min(N - lead, len(vo)); voice[lead:lead + m] = vo[:m]
venv = np.convolve(np.abs(voice).mean(1), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
duck = 1 - 0.4 * np.clip(venv / (venv.max() * 0.25 + 1e-9), 0, 1)
mix = voice * 0.92 + music * duck[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.89)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', sys.argv[3]], input=(np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes(), check=True)
print('wrote', sys.argv[3], f'{DUR:.1f}s', 'music peak', round(float(np.abs(music).max()), 3))
