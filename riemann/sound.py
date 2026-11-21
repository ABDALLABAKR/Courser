#!/usr/bin/env python3
"""Score for "The Riemann Hypothesis" — synthesized, then mixed under the narration.

  python3 sound.py soundtrack.wav

* near silence; one distinct, crystalline piano note for every prime as it appears
* deep atmospheric synthesizers for the zeta function and its landscape
* a precise, repeated tone once the critical line appears
* a mathematical rhythm for the hidden music of the primes
* almost silence at the end, then one resonant piano note under the final question
Times are narration seconds (V(x) = film time), mirroring rh-*.js.
"""
import subprocess, sys
import numpy as np

SR = 48000
VO = [('vo.mp3', 0.8)]
V = lambda x: 0.8 + x
DUR = 145.0; N = int(DUR * SR)
rng = np.random.default_rng(1859)
L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)

def sl(t0, t1):
    i0, i1 = max(0, int(t0 * SR)), min(N, int(t1 * SR)); return i0, i1, np.arange(i0, i1) / SR
def env(tt, t0, t1, fi, fo): return np.clip((tt - t0) / fi, 0, 1) * np.clip((t1 - tt) / fo, 0, 1)
def lowpass(x, k): return np.convolve(x, np.ones(k) / k, mode='same')
def pan_lr(s, p): return s * np.cos((p + 1) * np.pi / 4) * 1.41, s * np.sin((p + 1) * np.pi / 4) * 1.41
def place(sig, at, gain, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig)); l, r = pan_lr(sig[: j - i] * gain, pan); L[i:j] += l; R[i:j] += r
def pad(freqs, t0, t1, fi, fo, gain, det=0.003, vib=4.5, bright=0.35, shape=None):
    i0, i1, tt = sl(t0, t1); e = env(tt, t0, t1, fi, fo)
    if shape is not None: e = e * shape(tt)
    l = np.zeros(len(tt)); r = np.zeros(len(tt))
    for f in freqs:
        for v in range(3):
            ph = 2 * np.pi * np.cumsum(f * (1 + det * (v - 1)) * (1 + 0.003 * np.sin(2 * np.pi * (vib + 0.3 * v) * tt + v))) / SR
            s = np.sin(ph) + bright * np.sin(2 * ph) + bright * 0.35 * np.sin(3 * ph); pn = (v - 1) * 0.6
            l += s * np.cos((pn + 1) * np.pi / 4); r += s * np.sin((pn + 1) * np.pi / 4)
    k = gain / (len(freqs) * 3); L[i0:i1] += (l * e * k).astype(np.float32); R[i0:i1] += (r * e * k).astype(np.float32)
def bell(f, dur, decay, partials=((1, 1), (2.76, .3), (5.4, .1))):
    n = int(dur * SR); tt = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * m * tt) for m, a in partials) * np.minimum(1, tt / 0.004) * np.exp(-tt / decay)
def glass(f, dur=2.6): return bell(f, dur, 0.9, ((1, 1), (2.0, 0.25), (3.01, 0.12), (4.17, 0.06)))
def pluck(f, dur=1.2, decay=0.35):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(4 * np.pi * f * tt) * np.exp(-tt / 0.08)
    return s * np.minimum(1, tt / 0.003) * np.exp(-tt / decay)
def thump(f=55, dur=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR; return np.sin(2 * np.pi * f * tt * (1 + 0.6 * np.exp(-tt / 0.05))) * np.exp(-tt / 0.35) * np.minimum(1, tt / 0.004)
def swell(t0, t1, gain, lo=110):  # filtered-noise riser
    i0, i1, tt = sl(t0, t1); x = lowpass(rng.standard_normal(len(tt)), 40) * ((tt - t0) / (t1 - t0)) ** 2 * gain
    L[i0:i1] += x.astype(np.float32); R[i0:i1] += np.roll(x, 900).astype(np.float32)

def piano(f, dur=4.0, decay=1.6):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for m, a in ((1, 1), (2, 0.42), (3, 0.2), (4, 0.11), (5, 0.06), (6, 0.03)):
        fm = f * m * np.sqrt(1 + 0.0004 * m * m); s += a * np.sin(2 * np.pi * fm * tt) * np.exp(-tt * m ** 0.7 / decay)
    hammer = rng.standard_normal(n) * np.exp(-tt / 0.004) * 0.05
    return (s + hammer) * np.minimum(1, tt / 0.002)

# ---------------- 1. primes: silence, then one note for each prime
i0, i1, tt = sl(0, V(34)); air = lowpass(rng.standard_normal(len(tt)), 300) * 0.004 * env(tt, 0, V(34), 6, 3); L[i0:i1] += air.astype(np.float32); R[i0:i1] += np.roll(air, 2400).astype(np.float32)
PN = {2: (7.42, 523.3), 3: (8.25, 587.3), 5: (9.21, 659.3), 7: (10.08, 784.0), 11: (11.02, 880.0), 13: (12.1, 1046.5), 17: (12.68, 1174.7)}
for p, (t0, f) in PN.items(): place(piano(f, 5, 1.8), V(t0), 0.05, -0.5 + 0.15 * list(PN).index(p)); place(glass(f * 2, 3), V(t0), 0.006, 0.3)
place(piano(392.0, 5, 2), V(6.2), 0.02)                                              # "1"
for t0, f in ((14.55, 659.3), (15.15, 784.0), (15.55, 349.2), (16.0, 349.2), (16.45, 1046.5)): place(piano(f, 3, 1.2), V(t0), 0.03, 0.2)
for k, t0 in enumerate((17.4, 17.85, 18.3, 18.75)): place(piano([392, 523.3, 659.3, 784][k], 4, 1.5), V(t0), 0.035, -0.3 + 0.2 * k)
place(piano(261.6, 6, 2.2), V(19.15), 0.04); place(piano(392, 6, 2.2), V(19.17), 0.03)
pad([65.4, 98, 130.8], V(20.4), V(34), 4, 3, 0.03, vib=2.5, bright=0.2)                    # the tower: low and wide
t = V(21.0); k = 0
while t < V(33.0):
    place(piano(float(rng.choice([1046.5, 1174.7, 1318.5, 1568.0, 1760.0])), 3, 1.0), t, 0.012 * (0.6 + 0.4 * np.sin(k)), float(rng.uniform(-.7, .7)))
    t += 0.55 + 0.9 * rng.random() * (1 - 0.6 * (t > V(29.4))); k += 1
for t0 in (24.2, 24.5): place(glass(1568, 3), V(t0), 0.012, 0.4)
place(piano(130.8, 6, 2.5), V(27.3), 0.04); place(piano(123.5, 6, 2.5), V(27.32), 0.03)       # the gap
swell(V(30.5), V(33.4), 0.025)

# ---------------- 2. Riemann and the zeta function: deep atmospheric synthesizers
place(piano(293.7, 7, 2.6), V(33.6), 0.04); place(piano(440, 7, 2.6), V(33.62), 0.025)
pad([36.7, 55, 73.4, 110], V(33.4), V(58.5), 4, 2.5, 0.07, vib=2.0, bright=0.3)             # D minor depth
pad([146.8, 174.6, 220, 293.7], V(39.8), V(52.5), 3, 2, 0.025, vib=4.0)
for k in range(6): place(piano([587.3, 698.5, 880, 1046.5, 1174.7, 1396.9][k], 3, 1.2), V(39.9 + 0.4 * k), 0.022, -0.5 + 0.2 * k)
for k in range(30): place(glass(2093 * 2 ** (k / 30), 1.2), V(42.2 + k * 0.1), 0.003 * (1 - k / 32), 0.6 - k * 0.04)     # infinite tail
for k, t0 in enumerate((45.2, 45.6, 46.0, 46.4)): place(piano([523.3, 784, 1046.5, 1318.5][k], 4, 1.5), V(t0), 0.03, -0.2 + 0.15 * k)
swell(V(49.0), V(52.2), 0.04)
pad([41.2, 61.7, 82.4, 123.5], V(52.4), V(59.5), 2, 2.5, 0.06, vib=3.0, bright=0.4)            # the landscape
place(bell(587.3, 6, 2.4), V(55.8), 0.03); place(thump(41, 2), V(55.8), 0.04)

# ---------------- 3. the critical line: a precise repeated tone
pad([110, 164.8], V(58.0), V(82.0), 3, 2, 0.03, vib=1.5, bright=0.15)
for k in range(12): place(glass(1760, 2), V(67.0 + 0.24 * k), 0.006, 0.4 * np.sin(k))
t = V(69.7)
while t < V(81.4): place(bell(880.0, 1.4, 0.35, ((1, 1), (2.0, 0.08))), t, 0.016); t += 0.75
place(piano(440, 6, 2.4), V(72.0), 0.03); place(piano(659.3, 6, 2.2), V(72.03), 0.02)

# ---------------- 4. the hidden rhythm: pulse + interlocking figures
RS, RE = V(81.6), V(93.6); beat = 60 / 96
pad([73.4, 110, 146.8, 220], RS, RE + 1, 1.5, 2, 0.04, vib=3.5)
t = RS + 0.6; k = 0
while t < RE:
    lvl = 0.55 + 0.45 * np.clip((t - V(85.9)) / 6, 0, 1)
    if k % 4 == 0: place(thump(55, 1.0), t, 0.03 * lvl)
    place(pluck([293.7, 440, 370, 587.3, 440, 659.3, 554.4, 880][k % 8], 0.9, 0.22), t, 0.012 * lvl, 0.4 * np.sin(k * 0.9))
    if k % 2: place(pluck([587.3, 740, 880, 1174.7][k // 2 % 4], 0.7, 0.15), t + beat / 2, 0.007 * lvl, -0.4)
    t += beat; k += 1
place(bell(659.3, 5, 2.2), V(88.6), 0.02); swell(V(92.0), V(93.8), 0.03)

# ---------------- 5. the unsolved mystery
place(piano(220, 8, 3), V(93.9), 0.04); place(piano(329.6, 8, 3), V(93.92), 0.025)
pad([55, 82.4, 110, 164.8], V(94.0), V(112.5), 2, 3, 0.05, vib=2.5, bright=0.25)
for k in range(46): place(glass(float(rng.choice([1760, 2093, 2637, 3136])), 1.4), V(99.4 + k * 0.14), 0.0035, float(rng.uniform(-.8, .8)))   # zeros rushing past
place(piano(164.8, 7, 2.6), V(106.4), 0.035)
place(piano(440, 8, 3), V(109.9), 0.03); place(piano(659.3, 8, 3), V(109.93), 0.02)
place(piano(523.3, 6, 2.6), V(116.0), 0.03); place(piano(880, 7, 2.8), V(117.6), 0.03)
swell(V(119.6), V(122.6), 0.025); pad([36.7, 55], V(119.6), V(124), 1.5, 2, 0.04)
pad([55, 82.4, 110, 164.8, 220, 329.6], V(122.6), V(131.5), 3, 3, 0.06, vib=3.0, bright=0.3)   # the composition
place(bell(440, 7, 3), V(129.9), 0.025); place(bell(659.3, 7, 2.6), V(129.95), 0.014, 0.3)
place(piano(110, 10, 4.5), V(137.9), 0.07); place(piano(220, 10, 4.5), V(137.91), 0.05); place(piano(329.6, 10, 4.0), V(137.93), 0.03); place(piano(440, 10, 3.6), V(137.95), 0.02, 0.2)

# ---------------- space: long soft reverb (overlap-add FFT convolution)
ir_n = int(3.0 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.85 * SR)); ir = lowpass(ir, 8); ir /= np.sqrt((ir ** 2).sum())
def reverb(x):
    blk = 1 << 20; F = 1 << int(np.ceil(np.log2(blk + ir_n))); IR = np.fft.rfft(ir, F); y = np.zeros(len(x) + F, np.float32)
    for s0 in range(0, len(x), blk):
        seg = x[s0:s0 + blk].astype(np.float64); y[s0:s0 + F] += np.fft.irfft(np.fft.rfft(seg, F) * IR, F).astype(np.float32)
    return y[:len(x)]
L = L * 0.78 + 0.45 * reverb(L); R = R * 0.78 + 0.45 * reverb(R)
tail = np.clip((DUR - 0.6 - np.arange(N) / SR) / 0.8, 0, 1).astype(np.float32)
music = np.stack([L * tail, R * tail], 1)

# ---------------- narration + ducking
voice = np.zeros((N, 2), np.float32)
for f, at in VO:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    vo = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2); i = int(at * SR); m = min(N - i, len(vo)); voice[i:i + m] += vo[:m]
k = int(0.15 * SR); venv = np.convolve(np.abs(voice).mean(1), np.ones(k, np.float32) / k, mode='same')
duck = (1 - 0.45 * np.clip(venv / (np.percentile(venv[venv > 1e-4], 95) * 0.35 + 1e-9), 0, 1)).astype(np.float32)
mix = voice * 0.95 + 1.4 * music * duck[:, None]
mix /= max(1.0, float(np.abs(mix).max()) / 0.9)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', sys.argv[1]], input=(np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes(), check=True)
print('wrote', sys.argv[1], f'{DUR:.1f}s', 'music peak', round(float(np.abs(music).max()), 3), 'voice peak', round(float(np.abs(voice).max()), 3))
