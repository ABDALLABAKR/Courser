#!/usr/bin/env python3
"""Score for "Chaos Theory" — synthesized from the film's own data, mixed under the narration.

  python3 sound.py sounddata.json narration.mp3 soundtrack.wav

* warm, near-silent air; each wingbeat is a soft flutter
* the wake becomes swirling textures and a gathering storm
* the ocean builds to the tsunami — then time freezes: sudden hush, a suspended shimmer
* split screen: two voices sonify the two Lorenz trajectories (world A left, world B right).
  They start in perfect unison and drift apart exactly as the trajectories do.
* the ensemble of uncertainty becomes a widening granular shimmer
* layers fall away; one soft resonant tone; silence
"""
import json, subprocess, sys
import numpy as np

SR = 48000
D = json.load(open(sys.argv[1])); M = D['marks']
DUR = D['end']; N = int(DUR * SR); t = np.arange(N) / SR
rng = np.random.default_rng(1972)
L = np.zeros(N); R = np.zeros(N)

def seg(t0, t1, fi, fo): return np.clip((t - t0) / fi, 0, 1) * np.clip((t1 - t) / fo, 0, 1)
def lowpass(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
def place(sig, at, gain, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    L[i:j] += s * np.cos((pan + 1) * np.pi / 4) * 1.41; R[i:j] += s * np.sin((pan + 1) * np.pi / 4) * 1.41
def pad(freqs, env, gain, det=0.003, vib=4.5):
    l = np.zeros(N); r = np.zeros(N)
    for f in freqs:
        for v in range(3):
            ph = 2 * np.pi * np.cumsum(f * (1 + det * (v - 1)) * (1 + 0.003 * np.sin(2 * np.pi * (vib + 0.3 * v) * t + v))) / SR
            s = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.12 * np.sin(3 * ph); pan = (v - 1) * 0.6
            l += s * np.cos((pan + 1) * np.pi / 4); r += s * np.sin((pan + 1) * np.pi / 4)
    k = gain / (len(freqs) * 3); return l * env * k, r * env * k
def add(lr):
    global L, R
    L += lr[0]; R += lr[1]
def bell(f, dur, decay):
    n = int(dur * SR); tt = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * m * tt) for m, a in [(1, 1), (2.76, .3), (5.4, .1)]) * np.minimum(1, tt / 0.004) * np.exp(-tt / decay)

# --- warm air, near silence at first
air = lowpass(rng.standard_normal(N), 300); air2 = lowpass(rng.standard_normal(N), 300)
airenv = (0.004 + 0.006 * seg(M['open'], DUR, 4, 6)) * np.clip(t / 3, 0, 1)
L += air * airenv; R += air2 * airenv
add(pad([130.8, 196.0, 261.6], seg(1.0, M['spread'] + 4, 4, 4), 0.03, vib=3.0))             # golden warmth (C major colour)

# --- wings: opening swish, then a soft flutter on every downstroke
def flutter(dur=0.32):
    n = int(dur * SR); x = lowpass(rng.standard_normal(n), 14); e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2; return x * e
place(flutter(1.2), M['open'], 0.05)
for b in D['beats']: place(flutter(), b - 0.08, 0.06, float(rng.uniform(-.3, .3)))
for b in D['beats'][:4]: place(bell(1568, 2.0, 0.6), b, 0.006, 0.4)

# --- the ripple expands: swirling textures, rising pad, the storm
sw = seg(M['spread'], M['far'] + 1.5, 3, 2.5)
for k, f0 in enumerate([420, 610, 880, 1270]):                                                # airy whistles that drift (vortex sounds)
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.08 * np.sin(2 * np.pi * (0.13 + 0.05 * k) * t + k))) / SR
    s = np.sin(ph) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.4 + 0.2 * k) * t)) * sw * 0.006
    L += s * (0.5 + 0.5 * np.sin(k)); R += s * (0.5 - 0.5 * np.sin(k))
add(pad([110, 164.8, 246.9, 329.6], seg(M['spread'] + 2, M['far'] + 2, 5, 3), 0.045, vib=5.0))  # emerald minor
storm = seg(M['storm'], M['far'] + 2.5, 2.5, 2.5); rum = lowpass(rng.standard_normal(N), 900) * storm * 0.05; L += rum; R += np.roll(rum, 3000)

# --- ocean → tsunami → freeze
oc = seg(M['far'], M['freeze'], 2.0, 0.03)
grow = np.clip((t - M['wave']) / (M['freeze'] - M['wave']), 0, 1) ** 1.8
roar = lowpass(rng.standard_normal(N), 160) * (0.02 + 0.09 * grow) * oc
L += roar; R += np.roll(roar, 4800)
swell = (np.sin(2 * np.pi * 41.2 * t) + 0.5 * np.sin(2 * np.pi * 61.7 * t) + 0.3 * np.sin(2 * np.pi * 82.4 * t)) * (0.01 + 0.07 * grow) * oc
L += swell; R += swell
add(pad([82.4, 123.5, 164.8, 196.0, 246.9], seg(M['wave'], M['freeze'], 3, 0.03) * (0.3 + 0.7 * grow), 0.07, det=0.005))
# time stops: an abrupt hush, one suspended shimmer
frz = seg(M['freeze'], M['unravel'] + 2.5, 0.4, 2.0)
for f in [1318.5, 1975.5, 2637.0]: L += 0.006 * frz * np.sin(2 * np.pi * f * t); R += 0.006 * frz * np.sin(2 * np.pi * f * 1.002 * t)
for k in range(9): place(bell(float(rng.choice([659.3, 784.0, 987.8, 1174.7])), 3, 1.2), M['unravel'] + k * 0.45, 0.012, float(rng.uniform(-.7, .7)))
add(pad([146.8, 220.0, 293.7], seg(M['effect'] - 0.3, M['split'] + 1.0, 1.5, 2.0), 0.04))     # "this is the butterfly effect"

# --- two worlds, two voices: the Lorenz x-coordinate as pitch (A left, B right)
xa = np.array(D['xa']); xb = np.array(D['xb']); tx = D['lorStart'] + np.arange(len(xa)) * D['lorDt']
ia = np.interp(t, tx, xa); ib = np.interp(t, tx, xb)
voice = seg(M['split'], D['lorStart'] + len(xa) * D['lorDt'], 1.2, 1.4)
fa = 330 * 2 ** (ia / 30); fb = 330 * 2 ** (ib / 30)
va = np.sin(2 * np.pi * np.cumsum(fa) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(fa) / SR)
vb = np.sin(2 * np.pi * np.cumsum(fb) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(fb) / SR)
L += 0.03 * voice * (va * 0.85 + vb * 0.15); R += 0.03 * voice * (vb * 0.85 + va * 0.15)

# --- the laws: calm, grounded harmony; then the ensemble of uncertainty
add(pad([98.0, 146.8, 196.0, 246.9], seg(M['laws'], M['ensemble'] + 1, 2.0, 2.0), 0.045, vib=3.5))
k = 0
while True:
    at = M['ensemble'] + k * 0.08; k += 1
    if at > M['returnB']: break
    spread = (at - M['ensemble']) / (M['returnB'] - M['ensemble'])
    if rng.random() < 0.25 + 0.75 * spread:
        f = 880 * 2 ** (rng.normal(0, 0.05 + 1.2 * spread))
        place(bell(float(np.clip(f, 200, 4000)), 1.4, 0.35), at, 0.006 + 0.004 * spread, float(rng.uniform(-spread, spread)))
add(pad([73.4, 110.0, 146.8], seg(M['ocean'], M['returnB'] + 2, 2.5, 3), 0.05))                # "an ocean of uncertainty"

# --- the butterfly returns; layers thin out as the camera pulls back
add(pad([130.8, 196.0, 261.6, 329.6], seg(M['returnB'], M['tiny'] + 1.5, 2.5, 3.5), 0.04, vib=3.0))
for b in np.arange(M['returnB'], M['pull'] + 4, 1 / 0.8): place(flutter(0.4), b, 0.04)
place(bell(523.25, 6, 2.5), M['title'], 0.035); place(bell(784.0, 6, 2.2), M['title'] + 0.05, 0.018, 0.3)
n = int((DUR - 1.0 - M['last']) * SR); tt = np.arange(n) / SR
place((np.sin(2 * np.pi * 130.8 * tt) + 0.3 * np.sin(2 * np.pi * 261.6 * tt)) * np.minimum(1, tt / 1.5) * np.clip((tt[-1] - tt) / 2.5, 0, 1), M['last'], 0.05)

# --- space
ir_n = int(2.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.7 * SR)); ir = lowpass(ir, 7); ir /= np.sqrt((ir ** 2).sum())
F = 1 << int(np.ceil(np.log2(N + ir_n))); IR = np.fft.rfft(ir, F)
L = L * 0.8 + 0.42 * np.fft.irfft(np.fft.rfft(L, F) * IR, F)[:N]; R = R * 0.8 + 0.42 * np.fft.irfft(np.fft.rfft(R, F) * IR, F)[:N]
music = np.stack([L, R], 1) * np.clip((DUR - 0.5 - t) / 0.6, 0, 1)[:, None]

# --- narration + ducking
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[2], '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
lead = int(D['lead'] * SR); voice_t = np.zeros((N, 2)); m = min(N - lead, len(vo)); voice_t[lead:lead + m] = vo[:m]
venv = np.convolve(np.abs(voice_t).mean(1), np.ones(int(0.15 * SR)) / int(0.15 * SR), mode='same')
duck = 1 - 0.42 * np.clip(venv / (venv.max() * 0.25 + 1e-9), 0, 1)
mix = voice_t * 0.92 + music * duck[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.89)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', sys.argv[3]], input=(np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes(), check=True)
print('wrote', sys.argv[3], f'{DUR:.1f}s', 'music peak', round(float(np.abs(music).max()), 3))
