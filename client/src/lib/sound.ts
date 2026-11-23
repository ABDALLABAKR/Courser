import { prefs } from './prefs';

/** Original procedural sound effects generated with the Web Audio API (no audio files, no licensing concerns). */
let ctx: AudioContext | null = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12, slideTo?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

const SFX = {
  click: () => tone(660, 0, 0.07, 'triangle', 0.08, 880),
  pop: () => tone(420, 0, 0.12, 'sine', 0.12, 900),
  tick: () => tone(1200, 0, 0.05, 'square', 0.04),
  close: () => { tone(520, 0, 0.1, 'triangle', 0.1); tone(620, 0.1, 0.12, 'triangle', 0.1); },
  // pentatonic-ish arpeggio
  correct: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.07, 0.22, 'triangle', 0.12)),
  othersCorrect: () => tone(880, 0, 0.12, 'sine', 0.07, 1320),
  turnEnd: () => [784, 659, 523].forEach((f, i) => tone(f, i * 0.1, 0.25, 'sine', 0.1)),
  start: () => [392, 523, 659].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.1)),
  victory: () => {
    const notes = [523, 659, 784, 659, 784, 1046];
    notes.forEach((f, i) => tone(f, i * 0.12, i === notes.length - 1 ? 0.6 : 0.16, 'triangle', 0.13));
    notes.forEach((f, i) => tone(f / 2, i * 0.12, 0.16, 'sine', 0.06));
  },
};
export type Sfx = keyof typeof SFX;

export function play(name: Sfx) {
  if (!prefs.get().sound) return;
  try { SFX[name](); } catch { /* audio unavailable */ }
}
