import { io, type Socket } from 'socket.io-client';
import type {
  ChatMessage, ClientToServer, DrawOp, JoinResult, ReactionId, RoomSettings, RoomView, ServerToClient, Stroke,
} from '@wene/shared';
import { createStore, useStore } from './store';
import { prefs } from './prefs';
import { play } from './sound';
import { setRoomInUrl } from './env';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) || undefined;

export const socket: Socket<ServerToClient, ClientToServer> = io(SERVER_URL, {
  autoConnect: !location.pathname.startsWith('/admin'),
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 4000,
  timeout: 10000,
});

export interface Reaction { key: number; playerId: string; id: ReactionId }
export interface GameState {
  view: RoomView | null;
  chat: ChatMessage[];
  connected: boolean;
  everConnected: boolean;
  online: number | null;
  notice: { key: string; ts: number } | null;
  reactions: Reaction[];
  celebrate: { kind: 'correct' | 'close'; points?: number; ts: number } | null;
  muted: Record<string, true>;
  clockOffset: number;
}

export const game = createStore<GameState>({
  view: null, chat: [], connected: false, everConnected: false, online: null, notice: null, reactions: [], celebrate: null, muted: {}, clockOffset: 0,
});
export const useGame = <S,>(sel: (g: GameState) => S) => useStore(game, sel);

// ---------------------------------------------------------------- canvas model
/** Canonical stroke list mirrored from the server; the canvas renders from this. */
export const canvasModel = {
  strokes: [] as Stroke[],
  redo: [] as Stroke[],
  listeners: new Set<(e: { type: 'ops'; ops: DrawOp[] } | { type: 'sync' }) => void>(),
  emit(e: { type: 'ops'; ops: DrawOp[] } | { type: 'sync' }) { this.listeners.forEach((l) => l(e)); },
};

export function applyOp(op: DrawOp) {
  const m = canvasModel;
  switch (op.t) {
    case 'begin': m.strokes.push({ kind: 'line', id: op.id, c: op.c, s: op.s, e: op.e, p: [op.x, op.y] }); m.redo = []; break;
    case 'pts': {
      const s = m.strokes[m.strokes.length - 1];
      if (s && s.kind === 'line' && s.id === op.id) s.p.push(...op.p);
      break;
    }
    case 'fill': m.strokes.push({ kind: 'fill', id: op.id, c: op.c, x: op.x, y: op.y }); m.redo = []; break;
    case 'undo': { const s = m.strokes.pop(); if (s) m.redo.push(s); break; }
    case 'redo': { const s = m.redo.pop(); if (s) m.strokes.push(s); break; }
    case 'clear': m.strokes = []; m.redo = []; break;
  }
}

// ---------------------------------------------------------------- session persistence
interface SavedSession { code: string; session: string; at: number }
const SESSION_KEY = 'wene.session';
// sessionStorage is per-tab and survives reloads: a reload resumes the game, while two tabs are two players.
const saveSession = (s: SavedSession | null) => {
  try { if (s) sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); else sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
};
const savedSession = (): SavedSession | null => {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null'); } catch { return null; }
};
/** A persistent per-browser session token lets the server recognise a returning player. */
function sessionFor(code: string) {
  const s = savedSession();
  return s && s.code === code ? s.session : undefined;
}

let currentCode: string | null = null;

function profile() {
  const p = prefs.get();
  return { name: p.name.trim(), avatar: p.avatar };
}

type Res = { ok: true } & JoinResult | { ok: false; error: string };
function withTimeout<T>(fn: (ack: (r: T) => void) => void, ms = 8000): Promise<T> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve({ ok: false, error: 'timeout' } as T), ms);
    fn((r) => { clearTimeout(t); resolve(r); });
  });
}

function onJoined(r: Res) {
  if (r.ok) {
    currentCode = r.code;
    saveSession({ code: r.code, session: r.session, at: Date.now() });
    setRoomInUrl(r.code);
  }
  return r;
}

export const actions = {
  async quickPlay() {
    return onJoined(await withTimeout<Res>((ack) => socket.emit('room:quickplay', { profile: profile(), session: savedSession()?.session }, ack)));
  },
  async create(settings?: Partial<RoomSettings>) {
    return onJoined(await withTimeout<Res>((ack) => socket.emit('room:create', { profile: profile(), settings, session: savedSession()?.session }, ack)));
  },
  async join(code: string) {
    const c = code.trim().toUpperCase();
    return onJoined(await withTimeout<Res>((ack) => socket.emit('room:join', { code: c, profile: profile(), session: sessionFor(c) ?? savedSession()?.session }, ack)));
  },
  /** Record a join made outside these actions (artifact practice rooms). */
  adoptJoin(r: Res) { return onJoined(r); },
  leave() {
    socket.emit('room:leave');
    resetLocal();
  },
  settings(patch: Partial<RoomSettings>) {
    return withTimeout<{ ok: boolean; error?: string }>((ack) => socket.emit('room:settings', patch, ack));
  },
  ready(v: boolean) { socket.emit('room:ready', v); },
  start() { return withTimeout<{ ok: boolean; error?: string }>((ack) => socket.emit('room:start', ack)); },
  kick(id: string) { socket.emit('room:kick', id); },
  playAgain() { socket.emit('room:playAgain'); },
  choose(i: number) { socket.emit('word:choose', i); },
  chat(text: string) { return withTimeout<{ ok: boolean; error?: string }>((ack) => socket.emit('chat:send', text, ack)); },
  react(id: ReactionId) { socket.emit('reaction:send', id); },
  report(playerId: string, reason: string) { return withTimeout<{ ok: boolean; error?: string }>((ack) => socket.emit('report', { playerId, reason }, ack)); },
  draw(ops: DrawOp[]) { socket.emit('draw:ops', ops); },
  toggleMute(id: string) {
    game.set((g) => {
      const muted = { ...g.muted };
      if (muted[id]) delete muted[id]; else muted[id] = true;
      return { muted };
    });
  },
};

function resetLocal() {
  currentCode = null;
  saveSession(null);
  canvasModel.strokes = [];
  canvasModel.redo = [];
  game.set({ view: null, chat: [], reactions: [], celebrate: null });
  setRoomInUrl(null);
}

export const notify = (key: string) => game.set({ notice: { key, ts: Date.now() } });

/** Server-synchronised "now" for countdowns. */
export const serverNow = () => Date.now() + game.get().clockOffset;

// ---------------------------------------------------------------- socket wiring
let prevPhase: string | null = null;
let reactionKey = 0;

socket.on('connect', async () => {
  game.set({ connected: true, everConnected: true });
  // Automatic rejoin after a network blip, or after a page reload mid-game.
  const saved = savedSession();
  const code = currentCode ?? (saved && Date.now() - saved.at < 10 * 60_000 ? saved.code : null);
  if (code && prefs.get().name.trim().length >= 2) {
    const r = await actions.join(code);
    if (!r.ok) {
      resetLocal();
      if (currentCode !== null || r.error !== 'room_not_found') notify(`err_${r.error}`);
    }
  }
});
socket.on('disconnect', () => game.set({ connected: false }));
socket.on('online', (n) => game.set({ online: n }));

socket.on('state', (view) => {
  const g = game.get();
  const clockOffset = view.serverNow - Date.now();
  if (prevPhase !== view.phase) {
    if (view.phase === 'choosing' && prevPhase !== 'choosing') play('start');
    if (view.phase === 'turnEnd') play('turnEnd');
    if (view.phase === 'gameOver') play('victory');
    prevPhase = view.phase;
  }
  if (view.code !== g.view?.code) currentCode = view.code;
  const saved = savedSession();
  if (saved && saved.code === view.code) saveSession({ ...saved, at: Date.now() });
  game.set({ view, clockOffset });
});

socket.on('chat:history', (msgs) => game.set({ chat: msgs }));
socket.on('chat:msg', (m) => {
  game.set((g) => ({ chat: [...g.chat.slice(-150), m] }));
  if (m.kind === 'correct' && m.params?.name !== undefined) {
    const me = game.get().view?.players.find((p) => p.id === game.get().view?.you);
    if (me && m.params.name !== me.name) play('othersCorrect');
  }
  if (m.kind === 'join') play('pop');
});
socket.on('draw:sync', (strokes) => {
  canvasModel.strokes = strokes;
  canvasModel.redo = [];
  canvasModel.emit({ type: 'sync' });
});
socket.on('draw:ops', (ops) => {
  ops.forEach(applyOp);
  canvasModel.emit({ type: 'ops', ops });
});
socket.on('reaction', ({ playerId, id }) => {
  if (game.get().muted[playerId]) return;
  const key = ++reactionKey;
  game.set((g) => ({ reactions: [...g.reactions.slice(-12), { key, playerId, id }] }));
  setTimeout(() => game.set((g) => ({ reactions: g.reactions.filter((r) => r.key !== key) })), 2600);
});
socket.on('guess:result', ({ result, points }) => {
  game.set({ celebrate: { kind: result, points, ts: Date.now() } });
  play(result === 'correct' ? 'correct' : 'close');
});
socket.on('kicked', (reason) => {
  resetLocal();
  notify(`kicked_${reason}`);
});
