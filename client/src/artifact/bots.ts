/**
 * Practice bots for the artifact build. They join through the same socket handlers as
 * people, so the server rules apply to them too. When a bot draws, it paints the word's
 * emoji as pixel art. Bot guessers read the secret word from the host-side room (they
 * live in the host's page), then take a few wrong guesses before guessing right.
 */
import { BRUSH_SIZES, PALETTE, CANVAS_H, CANVAS_W, COORD_SCALE, type RoomView, type DrawOp, type ChatMessage } from '@wene/shared';
import type { HostServer } from './hostServer';
import { WORDS } from './hostServer';

const EMOJI: Record<string, string> = {
  'سێو': '🍎', 'نان': '🍞', 'هێلکە': '🥚', 'ترێ': '🍇', 'شووتی': '🍉', 'چا': '🍵', 'برنج': '🍚', 'پەنیر': '🧀',
  'پشیلە': '🐱', 'سەگ': '🐶', 'ماسی': '🐟', 'مار': '🐍', 'ئەسپ': '🐴', 'شێر': '🦁', 'مریشک': '🐔', 'کەروێشک': '🐰',
  'پەپوولە': '🦋', 'مەڕ': '🐑', 'بزن': '🐐', 'مانگا': '🐄', 'ورچ': '🐻', 'گورگ': '🐺', 'ڕێوی': '🦊',
  'خۆر': '☀️', 'مانگ': '🌙', 'ئەستێرە': '⭐', 'دار': '🌳', 'گوڵ': '🌸', 'هەور': '☁️', 'باران': '🌧️', 'بەفر': '❄️',
  'چیا': '⛰️', 'ئاگر': '🔥', 'ماڵ': '🏠', 'دەرگا': '🚪', 'کتێب': '📕', 'کورسی': '🪑', 'کلیل': '🔑', 'پەنجەرە': '🪟',
  'قەڵەم': '🖊️', 'سەعات': '⏰', 'کڵاو': '🎩', 'پێڵاو': '👟', 'مۆم': '🕯️', 'مۆبایل': '📱', 'ئۆتۆمبێل': '🚗',
  'پاسکیل': '🚲', 'فڕۆکە': '✈️', 'کەشتی': '🚢', 'پرد': '🌉', 'دەهۆڵ': '🥁', 'قەڵا': '🏰', 'تۆپ': '⚽', 'تۆپی پێ': '⚽',
  'مەلەوانی': '🏊', 'ڕاکردن': '🏃', 'زۆرانبازی': '🤼', 'شاخەوانی': '🧗', 'ڕۆبۆت': '🤖', 'مووشەک': '🚀',
  'کۆمپیوتەر': '💻', 'مایکرۆسکۆپ': '🔬', 'دڵ': '❤️', 'چاو': '👁️', 'دەریا': '🌊', 'دوورگە': '🏝️', 'بیابان': '🏜️',
  'دارستان': '🌲', 'نەخشە': '🗺️',
};

const BOT_PROFILES = [
  { name: 'ئاسۆ 🤖', avatar: { skin: 2, color: 0, eyes: 2, mouth: 0, acc: 2 } },
  { name: 'شیلان 🤖', avatar: { skin: 1, color: 6, eyes: 1, mouth: 3, acc: 3 } },
  { name: 'ڕێباز 🤖', avatar: { skin: 3, color: 4, eyes: 0, mouth: 5, acc: 4 } },
  { name: 'نازدار 🤖', avatar: { skin: 0, color: 5, eyes: 4, mouth: 1, acc: 1 } },
  { name: 'هێمن 🤖', avatar: { skin: 4, color: 7, eyes: 3, mouth: 4, acc: 5 } },
];

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const PAL = PALETTE.filter((c) => c !== '#FFFFFF').map((c) => ({ c, rgb: hex(c) }));

/** Render an emoji small and turn it into coloured cells (null when the device has no colour emoji font). */
function emojiCells(emoji: string, n = 22): { x: number; y: number; c: string }[] | null {
  const S = n * 4;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.font = `${Math.floor(S * 0.82)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, S / 2, S / 2 + S * 0.04);
  const d = ctx.getImageData(0, 0, S, S).data;
  const cells: { x: number; y: number; c: string }[] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) {
        const i = ((y * 4 + yy) * S + (x * 4 + xx)) * 4;
        r += d[i] * d[i + 3]; g += d[i + 1] * d[i + 3]; b += d[i + 2] * d[i + 3]; a += d[i + 3];
      }
      if (a / 16 < 110) continue;
      const rgb = [r / a, g / a, b / a];
      if (rgb[0] > 235 && rgb[1] > 235 && rgb[2] > 235) continue;
      let best = PAL[0], bd = Infinity;
      for (const p of PAL) {
        const dd = (p.rgb[0] - rgb[0]) ** 2 * 0.3 + (p.rgb[1] - rgb[1]) ** 2 * 0.59 + (p.rgb[2] - rgb[2]) ** 2 * 0.11;
        if (dd < bd) { bd = dd; best = p; }
      }
      cells.push({ x, y, c: best.c });
    }
  }
  // A monochrome emoji font gives one colour only: treat as unusable and fall back.
  return cells.length > 8 && new Set(cells.map((c) => c.c)).size > 1 ? cells : null;
}

export class Bot {
  readonly id: string;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private turnKey = '';
  private playerId = '';
  private strokeId = Math.floor(Math.random() * 1e6) * 1000;
  private lastView: RoomView | null = null;

  constructor(private host: HostServer, private index: number) {
    this.id = `bot-${index}-${Math.random().toString(36).slice(2, 7)}`;
  }

  join() {
    const p = BOT_PROFILES[this.index % BOT_PROFILES.length];
    this.send('room:join', [{ code: this.host.code, profile: p }], (res: any) => { if (res?.ok) this.playerId = res.playerId; });
  }

  leave() { this.clear(); this.send('room:leave', []); this.host.disconnect(this.id); }

  private send(ev: string, args: unknown[], ack?: (r: unknown) => void) { this.host.receive(this.id, ev, args, ack); }
  private later(ms: number, fn: () => void) { this.timers.push(setTimeout(fn, ms)); }
  private clear() { this.timers.forEach(clearTimeout); this.timers = []; }

  receive(ev: string, args: unknown[]) {
    if (ev === 'state') this.onState(args[0] as RoomView);
    if (ev === 'chat:msg') {
      const m = args[0] as ChatMessage;
      if (m.kind === 'correct' && this.lastView && Math.random() < 0.25) this.later(rnd(500, 1500), () => this.send('reaction:send', [Math.random() < 0.5 ? 'dastkhosh' : 'bzhi']));
    }
  }

  private onState(v: RoomView) {
    this.lastView = v;
    if (!this.playerId) this.playerId = v.you;
    const me = v.players.find((p) => p.id === v.you);
    if ((v.phase === 'lobby' || v.phase === 'gameOver') && me && !me.ready) this.send('room:ready', [true]);
    const key = `${v.phase}:${v.round}:${v.artistId}`;
    if (key === this.turnKey) return;
    this.turnKey = key;
    this.clear();
    if (v.phase === 'choosing' && v.artistId === v.you && v.choices) {
      const idx = Math.max(0, v.choices.findIndex((c) => EMOJI[c.word]));
      this.later(rnd(1200, 2800), () => this.send('word:choose', [idx]));
    }
    if (v.phase === 'drawing' && v.artistId === v.you && v.word) this.draw(v.word);
    if (v.phase === 'drawing' && v.artistId !== v.you) this.planGuesses(v);
  }

  private planGuesses(v: RoomView) {
    const total = Math.max(5000, (v.endsAt ?? 0) - v.serverNow);
    const secret = this.host.room?.secretWord;
    if (!secret) return;
    const wrongs = WORDS.filter((w) => w.word !== secret);
    const correctAt = rnd(0.22, 0.85) * total;
    const nWrong = Math.floor(rnd(1, 3.5));
    for (let i = 0; i < nWrong; i++) {
      this.later(rnd(0.08, 0.95) * correctAt, () => this.send('chat:send', [wrongs[Math.floor(Math.random() * wrongs.length)].word]));
    }
    if ([...secret].length >= 4 && Math.random() < 0.35) {
      this.later(correctAt * 0.9, () => this.send('chat:send', [[...secret].slice(0, -1).join('')])); // a near miss
    }
    if (Math.random() < 0.85) this.later(correctAt, () => this.send('chat:send', [secret]));
  }

  private draw(word: string) {
    const cells = EMOJI[word] ? emojiCells(EMOJI[word]) : null;
    const ops: DrawOp[] = [];
    const nx = (px: number) => Math.round((px / CANVAS_W) * COORD_SCALE);
    const ny = (py: number) => Math.round((py / CANVAS_H) * COORD_SCALE);
    if (cells) {
      const n = 22;
      const cell = (CANVAS_H * 0.78) / n;
      const x0 = CANVAS_W / 2 - (n * cell) / 2, y0 = CANVAS_H / 2 - (n * cell) / 2;
      const size = BRUSH_SIZES.find((s) => s >= cell * 1.15) ?? 40;
      cells.sort((a, b) => a.y - b.y || a.x - b.x);
      for (const c of cells) ops.push({ t: 'begin', id: ++this.strokeId, c: c.c, s: size, e: 0, x: nx(x0 + (c.x + 0.5) * cell), y: ny(y0 + (c.y + 0.5) * cell) });
    } else {
      // No emoji available: a looping scribble so guessers at least see the bot working.
      const id = ++this.strokeId;
      ops.push({ t: 'begin', id, c: '#18243B', s: 10, e: 0, x: nx(600), y: ny(450) });
      const pts: number[] = [];
      for (let i = 1; i < 120; i++) { const a = i / 6; pts.push(nx(600 + Math.cos(a) * i * 3), ny(450 + Math.sin(a) * i * 2.4)); }
      for (let i = 0; i < pts.length; i += 40) ops.push({ t: 'pts', id, p: pts.slice(i, i + 40) });
    }
    const batch = 14;
    for (let i = 0; i < ops.length; i += batch) {
      const slice = ops.slice(i, i + batch);
      this.later(1500 + (i / batch) * 450, () => this.send('draw:ops', [slice]));
    }
  }
}
