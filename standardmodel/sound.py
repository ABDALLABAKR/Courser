#!/usr/bin/env python3
"""Score for "The Standard Model" — synthesized, then mixed under the four narration tracks.

  python3 sound.py soundtrack.wav

* quiet, mysterious atmosphere for the eye, the fields and the tower of frames
* rhythmic textures as the quarks appear (warm, golden)
* delicate crystalline tones for the leptons
* intensity builds through the force carriers
* a powerful but sophisticated crescendo for the Higgs boson and the complete chart
* an atmospheric fading tone, then silence
Timing mirrors sm-core.js (narration placement) so every hit lands on its cue.
"""
import subprocess, sys
import numpy as np

SR = 48000
VO = [('vo1_quarks.mp3', 0.6), ('vo2_leptons.mp3', 154.49), ('vo3_bosons.mp3', 281.89), ('vo4_higgs.mp3', 386.17)]
A, B, G, Hg = [(lambda o: (lambda x: o + x))(o) for _, o in VO]
DUR = 509.0; N = int(DUR * SR)
rng = np.random.default_rng(1964)
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

# ---------------- ACT I: atmosphere → the hidden architecture
i0, i1, tt = sl(0, A(56.5)); air = lowpass(rng.standard_normal(len(tt)), 300) * 0.006 * env(tt, 0, A(56.5), 4, 3); L[i0:i1] += air.astype(np.float32); R[i0:i1] += np.roll(air, 2400).astype(np.float32)
pad([55, 82.4, 110], 0.0, A(24), 5, 4, 0.05, vib=2.5, bright=0.2)                                     # deep, mysterious (A)
place(bell(659.3, 5, 2.2), 0.7, 0.012, -0.3); place(bell(987.8, 5, 2.0), A(1.6), 0.008, 0.3)
pad([220, 329.6, 440, 523.3], A(4.3), A(14.5), 3, 2, 0.02, vib=3.0)                                   # the eye: a soft high shimmer
swell(A(11.5), A(14.2), 0.03)
for k in range(10): place(glass(float(rng.choice([1318.5, 1567.98, 1760.0, 1975.5]))), A(13.6) + k * 0.4, 0.006, float(rng.uniform(-.7, .7)))  # molecules / atoms
pad([73.4, 110, 146.8, 220], A(21), A(46), 4, 3, 0.045, vib=3.5)                                       # the fields (D minor colour)
for t0 in (A(32.93), A(38.07), A(41.22)): place(bell(880, 4, 1.4), t0 + 0.2, 0.012, 0.2)              # excitations
pad([98, 146.8, 196, 293.7, 392], A(44.6), A(56.5), 3, 2.5, 0.06, vib=4.0, shape=lambda tt: 0.5 + 0.5 * np.clip((tt - A(44.6)) / 6, 0, 1))  # the tower rises
swell(A(48.0), A(50.47), 0.05); place(thump(49), A(50.47), 0.06); place(bell(392, 6, 2.6), A(50.47), 0.03); place(bell(587.3, 6, 2.4), A(50.5), 0.016, 0.3)
for k in range(12): place(glass(1046.5 * 2 ** (k / 12 * 1.0)), A(52.0) + k * 0.2, 0.006, -0.6 + k * 0.1)  # golden pulse travels up

# ---------------- the quarks: warm, rhythmic
QS, QE = A(56.5), A(153.0); bpm = 84; beat = 60 / bpm
pad([146.8, 220, 293.7, 370], QS, QE, 3, 2.5, 0.045, vib=4.2)                                          # D major warmth
scale = [293.7, 329.6, 370.0, 440.0, 493.9, 587.3]
t = QS + 1.0; k = 0
while t < QE - 2.0:
    lvl = 0.5 + 0.5 * np.clip((t - QS) / 20, 0, 1)
    place(pluck(scale[(k * 3) % 6], 1.0, 0.28), t, 0.011 * lvl, 0.35 * np.sin(k)); place(pluck(scale[(k * 3 + 2) % 6] / 2, 1.0, 0.3), t + beat / 2, 0.008 * lvl, -0.35 * np.sin(k))
    if k % 4 == 0: place(thump(55), t, 0.02 * lvl)
    t += beat; k += 1
for t0 in (A(64.21), A(77.62), A(97.96), A(107.84), A(120.48), A(133.51)): place(bell(587.3, 5, 2.0), t0, 0.022); place(bell(880, 5, 1.8), t0 + 0.04, 0.012, 0.3)
for t0 in (A(72.71), A(85.26)): place(bell(440, 5, 2.2), t0 + 0.3, 0.02, -0.2)
place(thump(41), A(102.7), 0.06); swell(A(101.4), A(102.7), 0.04)                                         # collision
place(thump(36, 2.4), A(128.0), 0.06)                                                                       # top decays
pad([110, 164.8, 220], A(145.4), A(153.0), 1.5, 2.5, 0.05)

# ---------------- the leptons: crystalline
LS, LE = A(151.0), B(126.5)
pad([164.8, 246.9, 329.6, 415.3], LS, LE, 3, 3, 0.04, vib=3.2, bright=0.2)                              # E major 7 colour, airy
t = LS + 2; k = 0
while t < LE - 2:
    f = [1318.5, 1661.2, 1975.5, 2489.0, 1975.5, 1661.2][k % 6]; place(glass(f), t, 0.0045 + 0.0015 * np.sin(k * 0.7), 0.6 * np.sin(k * 1.3)); t += 0.62; k += 1
for t0 in (B(12.98), B(30.25), B(45.19), B(61.46), B(76.0), B(84.89)): place(glass(1318.5, 4), t0, 0.02); place(glass(1975.5, 4), t0 + 0.05, 0.012, 0.4)
for k in range(30): place(glass(float(rng.choice([2637.0, 3135.9, 3520.0])), 1.2), B(39.0) + k * 0.15, 0.004, float(rng.uniform(-.8, .8)))  # cosmic-ray shower
place(thump(70), B(50.4), 0.03)                                                                            # tau decays
i0, i1, tt = sl(B(99.4), B(117.2)); e = env(tt, B(99.4), B(117.2), 1.5, 2)                               # oscillation: three slowly beating tones
for f, p in ((659.3, -0.6), (662.5, 0.0), (666.0, 0.6)):
    s = np.sin(2 * np.pi * f * tt) * e * 0.006; l, r = pan_lr(s, p); L[i0:i1] += l.astype(np.float32); R[i0:i1] += r.astype(np.float32)

# ---------------- the force carriers: building intensity
BS, BE = B(125.0), Hg(1.5)
def build(tt): return 0.45 + 0.55 * np.clip((tt - G(0)) / (G(100) - G(0)), 0, 1)
pad([65.4, 98, 130.8, 196], BS, BE, 3, 3, 0.07, vib=4.8, bright=0.45, shape=build)                       # C minor depth
pad([261.6, 311.1, 392], G(17.8), G(30), 2, 2, 0.025)                                                   # the light wave
t = G(0.5); k = 0
while t < G(100):
    lvl = build(np.array([t]))[0]; place(thump(49, 1.2), t, 0.025 * lvl); place(pluck([196, 233.1, 261.6, 311.1][k % 4], 0.8, 0.22), t + 0.36, 0.012 * lvl, 0.4 * np.sin(k)); t += 0.72; k += 1
for t0 in (G(11.96), G(29.99), G(55.33), G(76.71)): place(bell(523.3, 5, 2.0), t0, 0.024); place(bell(784, 5, 1.8), t0 + 0.04, 0.012, -0.3)
place(thump(41, 2), G(45.5), 0.05)                                                                          # flux tube snaps
for t0 in (G(65.0), G(66.4)): place(bell(392, 4, 1.6), t0, 0.016)                                           # beta decay vertices
swell(G(88.0), G(90.14), 0.05); place(thump(36, 2.4), G(90.14), 0.07); pad([130.8, 196, 261.6, 392, 523.3], G(90.1), G(101), 0.6, 2.5, 0.06)

# ---------------- the Higgs: shimmer → crescendo → the complete chart
pad([110, 164.8, 220, 277.2], Hg(-1.5), Hg(30), 3, 2, 0.05, vib=3.0, bright=0.25)                        # A major, luminous
for k in range(40): place(glass(float(rng.choice([1760.0, 2217.5, 2637.0, 3322.4]))), Hg(0) + k * 0.7, 0.0035, float(rng.uniform(-.8, .8)))
swell(Hg(31.0), Hg(34.05), 0.06); place(thump(41, 2.4), Hg(34.05), 0.08)
pad([55, 110, 164.8, 220, 277.2, 329.6, 440, 554.4], Hg(33.8), Hg(44), 0.8, 3, 0.11, vib=5.0, bright=0.45)  # crescendo at the boson
place(bell(880, 6, 2.6), Hg(34.05), 0.03); place(bell(1318.5, 6, 2.2), Hg(34.1), 0.016, 0.3)
pad([73.4, 110, 146.8], Hg(43.8), Hg(53), 2, 2, 0.04)                                                       # the strong-interaction energy
grand = lambda tt: 0.35 + 0.65 * np.clip((tt - Hg(55)) / 11, 0, 1) * np.clip((Hg(77) - tt) / 2, 0.35, 1)
pad([65.4, 98, 130.8, 164.8, 196, 261.6, 329.6, 392, 523.3], Hg(52.6), Hg(92), 4, 4, 0.12, vib=5.0, bright=0.4, shape=grand)  # the monument (C major)
for t0, f in ((Hg(59.12), 523.3), (Hg(60.38), 659.3), (Hg(61.73), 784.0), (Hg(64.13), 1046.5)): place(bell(f, 6, 2.4), t0, 0.026); place(thump(49, 1.6), t0, 0.04)
swell(Hg(64.0), Hg(66.08), 0.06); place(thump(36, 3), Hg(66.08), 0.08)
for t0 in (Hg(80.31), Hg(82.47), Hg(85.12)): place(bell(415.3, 5, 2.0), t0, 0.018, -0.2)                 # the open questions (a darker colour)
pad([82.4, 123.5, 164.8, 207.7], Hg(90.6), Hg(110), 3, 4, 0.05, vib=3.5)
place(bell(523.3, 7, 3.0), Hg(108.91), 0.03); place(bell(784.0, 7, 2.6), Hg(108.96), 0.016, 0.3)
i0, i1, tt = sl(Hg(108.5), DUR - 1.2); e = np.clip((tt - Hg(108.5)) / 2.5, 0, 1) * np.clip((DUR - 1.2 - tt) / 4.5, 0, 1)
s = (np.sin(2 * np.pi * 130.8 * tt) + 0.3 * np.sin(2 * np.pi * 261.6 * tt) + 0.1 * np.sin(2 * np.pi * 392.4 * tt)) * e * 0.05; L[i0:i1] += s.astype(np.float32); R[i0:i1] += s.astype(np.float32)
place(glass(1046.5, 6), Hg(117.2), 0.012)

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
