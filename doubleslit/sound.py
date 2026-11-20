#!/usr/bin/env python3
"""Sound design for "The Double-Slit Experiment".

Synthesizes the score from the exact event schedule the picture uses
(events.json, exported from index.html), then mixes it under the narration.

  python3 sound.py events.json narration.mp3 soundtrack.wav

* near silence → mechanical sounds as the apparatus appears
* two slightly detuned tones during the wave scene (their beating *is* interference)
* every electron detection produces its own tiny click; pitch follows where it landed,
  so thousands of detections merge into an evolving rhythmic texture
* the measurement scene abruptly drops the musical intensity
* a single soft tone, then silence
"""
import json, subprocess, sys
import numpy as np

SR = 48000
ev = json.load(open(sys.argv[1]))
DUR = ev['marks']['end']
N = int(DUR * SR)
M = ev['marks']
rng = np.random.default_rng(1801)
L = np.zeros(N); R = np.zeros(N)
t = np.arange(N) / SR

def env_adsr(n, a, d):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / (d * SR)); return e

def place(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i + len(sig) <= 0: return
    j = min(N, i + len(sig)); s = sig[: j - i] * gain
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:j] += s * gl * 1.41; R[i:j] += s * gr * 1.41

def tone(freqs, dur, a=0.01, d=0.5, amps=None):
    n = int(dur * SR); tt = np.arange(n) / SR; s = np.zeros(n)
    for k, f in enumerate(freqs): s += (amps[k] if amps else 1.0) * np.sin(2 * np.pi * f * tt)
    return s * env_adsr(n, a, d)

def noise_burst(dur, decay, smooth=1):
    n = int(dur * SR); x = rng.standard_normal(n)
    if smooth > 1: x = np.convolve(x, np.ones(smooth) / smooth, mode='same')
    return x * np.exp(-np.arange(n) / (decay * SR))

def lowpass(x, k):  # moving-average smoothing (cheap, gentle)
    return np.convolve(x, np.ones(k) / k, mode='same')

def seg_env(t0, t1, fi, fo):
    e = np.clip((t - t0) / fi, 0, 1) * np.clip((t1 - t) / fo, 0, 1); return e

# ---------------------------------------------------------------- room tone
room = lowpass(rng.standard_normal(N), 240) * 0.004 * np.clip(t / 3, 0, 1) * np.clip((DUR - 1.5 - t) / 2, 0, 1)
L += room; R += lowpass(rng.standard_normal(N), 240) * 0.004 * np.clip(t / 3, 0, 1) * np.clip((DUR - 1.5 - t) / 2, 0, 1)

# ---------------------------------------------------------------- scene 1
place(tone([2349, 4698], 1.6, 0.002, 0.45, [1, 0.25]), M['point'], 0.05)                       # the point appears
n = int((M['barrier'] + 1.6 - M['pointMove']) * SR); tt = np.arange(n) / SR                 # it travels: a pure, thin line of sound
glide = 880 * (1 + 0.04 * tt / tt[-1]); ph = 2 * np.pi * np.cumsum(glide) / SR
place(np.sin(ph) * np.clip(tt / 0.6, 0, 1) * np.clip((tt[-1] - tt) / 0.8, 0, 1), M['pointMove'], 0.022, -0.3)
def mech(at, g=1.0, pan=0.0):                                                                # a delicate mechanical event
    place(tone([58], 0.9, 0.003, 0.25), at, 0.22 * g, pan)
    place(tone([421, 1133, 2271, 3517], 1.4, 0.001, 0.35, [1, .6, .35, .2]), at + 0.01, 0.035 * g, pan)
    place(lowpass(noise_burst(0.08, 0.012), 6), at, 0.08 * g, pan)
mech(M['barrier'], 1.0); mech(M['barrier'] + 0.42, 0.45, 0.4)
for p in ev['classical']:                                                                    # classical impacts: dull, wooden ticks
    tk = tone([620 + 40 * rng.random()], 0.05, 0.0005, 0.012); nb = lowpass(noise_burst(0.02, 0.003), 3); tk[:len(nb)] += nb * 0.4
    place(tk, p[0], 0.06, float(np.clip(p[1], -1, 1)) * 0.6)
place(tone([110, 220.4, 329.9], 3.0, 0.9, 1.4, [1, .5, .3]), M['barrier2'] - 0.6, 0.05)         # the hits become slits

# ---------------------------------------------------------------- scene 2: interference you can hear
w0, w1 = M['waves'], M['dissolve'] + 0.8
for f, df, a in [(110, 0.55, 1.0), (165, 0.8, 0.55), (220, 1.1, 0.4), (330, 1.7, 0.22)]:
    e = seg_env(w0, w1, 3.0, 2.0) * (0.55 + 0.45 * np.clip((t - M['slits']) / 2, 0, 1)) * (1 + 0.5 * seg_env(M['screen'], w1, 2.5, 2.0))
    L += a * 0.032 * e * np.sin(2 * np.pi * f * t); R += a * 0.032 * e * np.sin(2 * np.pi * (f + df) * t + 0.3)  # detuned pair → beats
shim = seg_env(M['screen'], w1, 3.0, 2.0) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * t))
L += 0.006 * shim * np.sin(2 * np.pi * 880 * t); R += 0.006 * shim * np.sin(2 * np.pi * 1320.7 * t)

# ---------------------------------------------------------------- scene 3: one electron at a time
mech(M['apparatus'], 0.8, -0.2); mech(M['apparatus'] + 0.9, 0.5, 0.3)
n = int(1.1 * SR); tt = np.arange(n) / SR; whirr = np.sin(2 * np.pi * np.cumsum(70 + 60 * tt / tt[-1]) / SR) * np.sin(np.pi * tt / tt[-1]) ** 2
place(lowpass(np.sign(whirr) * np.abs(whirr) ** 0.5, 9), M['apparatus'] + 0.25, 0.025)
scale = [440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5, 1568.0]       # pentatonic, mapped from position
pings = [tone([f, 2 * f], 0.09, 0.0006, 0.022, [1, 0.2]) for f in scale]
tick = lowpass(noise_burst(0.006, 0.0012), 2)
el = np.array(ev['electrons'])
times = el[:, 0]
def local_rate(ts):
    r = np.empty(len(ts))
    for i in range(len(ts)):
        lo = np.searchsorted(ts, ts[i] - 0.25); hi = np.searchsorted(ts, ts[i] + 0.25); r[i] = (hi - lo) / 0.5
    return r
rate = local_rate(times)
for (te, z), rr in zip(el, rate):
    k = int(np.clip((z + 3) / 6 * len(scale), 0, len(scale) - 1)); g = 0.22 / np.sqrt(max(1.0, rr / 3.0))
    if te > M['measure']: g *= 0.15
    place(pings[k] * 0.55 + np.pad(tick, (0, len(pings[k]) - len(tick))) * 0.8, te, g, float(np.clip(z / 3, -1, 1)) * 0.75)
# the texture becomes rhythm: a soft pulse that grows with the detection rate
beat = 60 / 96; pulse_start = times[min(len(times) - 1, 60)]
k = 0
while True:
    tb = pulse_start + k * beat; k += 1
    if tb > M['measure']: break
    nr = np.searchsorted(times, tb); g = min(1.0, np.log10(max(1, nr)) / 4.2) * 0.12
    place(tone([52, 104], 0.5, 0.004, 0.12, [1, 0.3]), tb, g)
    if k % 2 == 0: place(tone([2637], 0.12, 0.001, 0.03), tb + beat / 2, g * 0.12, 0.3)
pad = seg_env(times[min(len(times) - 1, 2900)], M['measure'], 3.5, 0.05)                         # "an interference pattern"
for f, a in [(220, 1), (261.63, .7), (329.63, .6), (440, .3)]:
    L += 0.012 * a * pad * np.sin(2 * np.pi * f * t); R += 0.012 * a * pad * np.sin(2 * np.pi * (f * 1.002) * t)

# ---------------------------------------------------------------- scene 4: measurement (abruptly quieter)
for i, dt in enumerate([0, 0.37, 0.61, 1.05]): place(tone([1760, 3520], 0.06, 0.0005, 0.012), M['probes'] + 0.6 + dt, 0.05, -0.4 if i % 2 else 0.4)
mech(M['probes'] + 0.2, 0.35)
wp = np.array(ev['whichpath']); wrate = local_rate(wp[:, 0])
dry = {0: tone([329.63], 0.05, 0.0005, 0.01), 1: tone([392.0], 0.05, 0.0005, 0.01)}
probe_tick = tone([3135.96], 0.03, 0.0003, 0.006)
for (te, z, s), rr in zip(wp, wrate):
    g = 0.12 / np.sqrt(max(1.0, rr / 3.0)); pan = 0.6 if s else -0.6
    place(probe_tick, te - 0.1, g * 0.6, pan); place(dry[int(s)], te, g, float(np.clip(z / 3, -1, 1)) * 0.6)
place(tone([98, 146.8], 4.0, 0.6, 1.6, [1, .5]), M['split'], 0.05)

# ---------------------------------------------------------------- scene 5: the geometry of probability
p0, p1 = M['landscape'], M['collapse'] + 0.4
pe = seg_env(p0, p1, 4.0, 1.2) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.12 * t))
for f, a in [(146.83, 1), (220.0, .8), (293.66, .6), (369.99, .45), (440.0, .35), (659.25, .15)]:
    L += 0.016 * a * pe * np.sin(2 * np.pi * f * t); R += 0.016 * a * pe * np.sin(2 * np.pi * f * 1.0015 * t + 1.1)
for k in range(int((p1 - p0) * 6)):
    place(tone([float(rng.choice([1174.66, 1318.5, 1760.0, 2349.3]))], 0.5, 0.002, 0.12), p0 + 1.5 + k / 6 + rng.random() * 0.1, 0.012, float(rng.uniform(-.8, .8)))
place(tone([880, 1320, 1760], 2.5, 0.01, 0.8, [1, .5, .25]), M['equation'], 0.03)
n = int(2.2 * SR); tt = np.arange(n) / SR                                                    # collapse: a falling glissando into one point
place(np.sin(2 * np.pi * np.cumsum(880 * 2 ** (-2 * tt / tt[-1])) / SR) * np.exp(-tt * 1.4), M['collapse'], 0.03)

# ---------------------------------------------------------------- scene 6: silence, one event, one tone
place(tone([1046.5, 1568], 1.8, 0.4, 0.6, [1, .4]), M['slitsOpen'], 0.02)
place(tone([2793.8], 0.25, 0.0005, 0.04) + np.pad(tick, (0, int(0.25 * SR) - len(tick))), M['lastPoint'], 0.12)
place(tone([432.0, 864.0, 1296.0], 5.5, 0.05, 1.5, [1, .3, .1]), M['tone'], 0.07)

# ---------------------------------------------------------------- space (short exponential reverb)
ir_n = int(1.6 * SR); ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / (0.42 * SR)); ir = lowpass(ir, 5); ir /= np.sqrt((ir ** 2).sum())
F = 1 << int(np.ceil(np.log2(N + ir_n)))
IR = np.fft.rfft(ir, F)
L = L + 0.32 * np.fft.irfft(np.fft.rfft(L, F) * IR, F)[:N]; R = R + 0.32 * np.fft.irfft(np.fft.rfft(R, F) * IR, F)[:N]
music = np.stack([L, R], 1)
music *= np.clip((DUR - 0.25 - t) / 0.25, 0, 1)[:, None]                                         # complete silence at the end

# ---------------------------------------------------------------- narration + gentle ducking
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[2], '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
lead = int(ev['lead'] * SR); voice = np.zeros((N, 2)); m = min(N - lead, len(vo)); voice[lead:lead + m] = vo[:m]
venv = np.abs(voice).mean(1); venv = np.convolve(venv, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode='same')
duck = 1 - 0.45 * np.clip(venv / (venv.max() * 0.25 + 1e-9), 0, 1)
mix = voice * 0.92 + music * duck[:, None] * 1.0
mix /= max(1.0, np.abs(mix).max() / 0.89)
pcm = (np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', '-', sys.argv[3]], input=pcm, check=True)
print('wrote', sys.argv[3], f'{DUR:.1f}s', 'music peak', round(float(np.abs(music).max()), 3))
