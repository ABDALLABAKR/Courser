/**
 * Synthesised sound effects (Web Audio) — no audio files to download.
 */
type Effect = 'key' | 'delete' | 'error' | 'flip' | 'win' | 'lose';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.06) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function play(effect: Effect): void {
  try {
    switch (effect) {
      case 'key': tone(520, 0, 0.06, 'triangle', 0.035); break;
      case 'delete': tone(360, 0, 0.06, 'triangle', 0.03); break;
      case 'error': tone(180, 0, 0.12, 'square', 0.025); tone(150, 0.1, 0.14, 'square', 0.025); break;
      case 'flip': tone(660, 0, 0.08, 'sine', 0.03); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.05)); break;
      case 'lose': [392, 330, 262].forEach((f, i) => tone(f, i * 0.16, 0.35, 'sine', 0.045)); break;
    }
  } catch {
    /* audio is optional */
  }
}
