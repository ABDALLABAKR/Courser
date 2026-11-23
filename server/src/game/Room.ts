import {
  BRUSH_SIZES, CHOOSE_SECONDS, COORD_SCALE, MIN_PLAYERS, PALETTE, answerKey, compareGuess,
} from '@wene/shared';
import type {
  Avatar, ChatMessage, DrawOp, PlayerView, RoomSettings, RoomView, ServerToClient, Stroke, TurnSummary, Phase, ReactionId,
} from '@wene/shared';
import type { Timing } from '../config';
import { now, pick, shortId, token } from '../util';
import { artistPoints, guessPoints, hintCount } from './scoring';
import type { WordEntry, WordSource } from './words';

export interface Player {
  id: string;
  session: string;
  name: string;
  avatar: Avatar;
  score: number;
  connected: boolean;
  ready: boolean;
  guessed: boolean;
  socketId: string | null;
  joinedAt: number;
  removeTimer: NodeJS.Timeout | null;
  recentChat: { text: string; ts: number }[];
}

type Emit = <E extends keyof ServerToClient>(socketId: string, event: E, ...args: Parameters<ServerToClient[E]>) => void;

export interface RoomHooks {
  emit: Emit;
  words: WordSource;
  onEmpty?: (room: Room) => void;
  onGameStart?: (room: Room) => void;
  onGameEnd?: (room: Room, completed: boolean) => void;
  onWordChosen?: (w: WordEntry) => void;
  onTurnEnd?: (w: WordEntry, anyoneGuessed: boolean) => void;
  onPlayerRemoved?: (session: string) => void;
}

export const DEFAULT_SETTINGS: RoomSettings = {
  rounds: 3, drawTime: 80, maxPlayers: 8, difficulty: 'mixed', categories: [], customWords: [], customOnly: false, hints: true,
};

const MAX_STROKES = 3000;
const MAX_POINTS_PER_STROKE = 6000;
const COLOR_RE = /^#[0-9A-Fa-f]{6}$/;
const PALETTE_SET = new Set(PALETTE.map((c) => c.toUpperCase()));

export class Room {
  readonly code: string;
  readonly isPublic: boolean;
  settings: RoomSettings;
  players = new Map<string, Player>();
  hostId = '';
  phase: Phase = 'lobby';
  round = 0;
  artistId: string | null = null;
  lastActivity = now();
  destroyed = false;

  private drawQueue: string[] = [];
  private choices: WordEntry[] = [];
  private word: WordEntry | null = null;
  private revealed = new Set<number>();
  private endsAt: number | null = null;
  private phaseStartedAt = 0;
  private phaseTimer: NodeJS.Timeout | null = null;
  private hintTimers: NodeJS.Timeout[] = [];
  private artistGraceTimer: NodeJS.Timeout | null = null;
  private lowPlayersTimer: NodeJS.Timeout | null = null;
  private autoStartTimer: NodeJS.Timeout | null = null;
  private autoStartAt: number | null = null;
  private gains = new Map<string, number>();
  private eligibleGuessers = new Set<string>();
  private lastTurn: TurnSummary | null = null;
  private usedWords = new Set<string>();
  private strokes: Stroke[] = [];
  private redoStack: Stroke[] = [];
  private openStrokeId: number | null = null;
  private history: ChatMessage[] = [];
  private banned = new Set<string>();

  constructor(code: string, isPublic: boolean, settings: RoomSettings, private timing: Timing, private hooks: RoomHooks) {
    this.code = code;
    this.isPublic = isPublic;
    this.settings = settings;
  }

  // ------------------------------------------------------------------ players
  get connectedPlayers() { return [...this.players.values()].filter((p) => p.connected); }
  get size() { return this.players.size; }
  isFull() { return this.players.size >= this.settings.maxPlayers; }
  isBanned(session: string) { return this.banned.has(session); }
  findBySession(session: string) { return [...this.players.values()].find((p) => p.session === session); }

  addPlayer(name: string, avatar: Avatar, socketId: string, session = token()): Player {
    const p: Player = {
      id: shortId(), session, name: this.uniqueName(name), avatar, score: 0, connected: true,
      ready: false, guessed: false, socketId, joinedAt: now(), removeTimer: null, recentChat: [],
    };
    this.players.set(p.id, p);
    if (!this.hostId || !this.players.get(this.hostId)?.connected) this.hostId = p.id;
    if (this.phase !== 'lobby' && this.phase !== 'gameOver') this.drawQueue.push(p.id); // late joiners still get a turn this round
    this.touch();
    this.system('join', 'msg.joined', { name: p.name });
    this.sendFullSync(p);
    this.broadcastState();
    this.checkPlayerCount();
    this.checkAutoStart();
    return p;
  }

  private uniqueName(name: string) {
    const taken = new Set([...this.players.values()].map((p) => answerKey(p.name)));
    if (!taken.has(answerKey(name))) return name;
    for (let i = 2; i < 100; i++) {
      const n = `${name.slice(0, 17)} ${i}`;
      if (!taken.has(answerKey(n))) return n;
    }
    return `${name.slice(0, 14)} ${shortId().slice(0, 4)}`;
  }

  /** A known session reconnects (possibly on a new socket). Returns the old socket id if one was replaced. */
  reconnect(p: Player, socketId: string): string | null {
    const old = p.socketId && p.socketId !== socketId ? p.socketId : null;
    if (p.removeTimer) { clearTimeout(p.removeTimer); p.removeTimer = null; }
    const wasConnected = p.connected;
    p.socketId = socketId;
    p.connected = true;
    if (!this.players.get(this.hostId)?.connected) this.hostId = p.id;
    if (p.id === this.artistId && this.artistGraceTimer) { clearTimeout(this.artistGraceTimer); this.artistGraceTimer = null; }
    this.touch();
    if (!wasConnected) this.system('join', 'msg.reconnected', { name: p.name });
    this.sendFullSync(p);
    this.broadcastState();
    this.checkPlayerCount();
    this.checkAutoStart();
    return old;
  }

  disconnect(playerId: string, socketId: string) {
    const p = this.players.get(playerId);
    if (!p || p.socketId !== socketId) return; // stale socket
    p.connected = false;
    p.socketId = null;
    this.system('leave', 'msg.disconnected', { name: p.name });
    if (this.hostId === p.id) this.migrateHost();
    if (p.id === this.artistId && (this.phase === 'choosing' || this.phase === 'drawing')) {
      this.artistGraceTimer = setTimeout(() => {
        this.artistGraceTimer = null;
        if (!p.connected && p.id === this.artistId) this.endTurn('artistLeft');
      }, this.timing.artistGraceMs);
    }
    p.removeTimer = setTimeout(() => this.removePlayer(p.id, 'timeout'), this.timing.disconnectGraceMs);
    this.broadcastState();
    this.checkPlayerCount();
    this.checkAutoStart();
    this.maybeEndEarly();
  }

  removePlayer(playerId: string, why: 'left' | 'kicked' | 'timeout') {
    const p = this.players.get(playerId);
    if (!p) return;
    if (p.removeTimer) clearTimeout(p.removeTimer);
    this.players.delete(playerId);
    this.drawQueue = this.drawQueue.filter((id) => id !== playerId);
    this.eligibleGuessers.delete(playerId);
    this.hooks.onPlayerRemoved?.(p.session);
    if (why === 'kicked') {
      this.banned.add(p.session);
      if (p.socketId) this.hooks.emit(p.socketId, 'kicked', 'kicked');
    }
    if (why !== 'timeout' || p.connected) this.system('leave', why === 'kicked' ? 'msg.kicked' : 'msg.left', { name: p.name });
    if (this.players.size === 0) { this.destroy(); this.hooks.onEmpty?.(this); return; }
    if (this.hostId === playerId) this.migrateHost();
    if (playerId === this.artistId && (this.phase === 'choosing' || this.phase === 'drawing')) this.endTurn('artistLeft');
    else this.maybeEndEarly();
    this.broadcastState();
    this.checkPlayerCount();
    this.checkAutoStart();
  }

  private migrateHost() {
    const candidates = [...this.players.values()].filter((p) => p.connected).sort((a, b) => a.joinedAt - b.joinedAt);
    const next = candidates[0] ?? [...this.players.values()][0];
    if (next && next.id !== this.hostId) {
      this.hostId = next.id;
      this.system('system', 'msg.newHost', { name: next.name });
    }
  }

  // ------------------------------------------------------------------ lobby
  updateSettings(byId: string, patch: Partial<RoomSettings>): string | null {
    if (byId !== this.hostId) return 'not_host';
    if (this.phase !== 'lobby' && this.phase !== 'gameOver') return 'in_game';
    const next = { ...this.settings, ...patch };
    if (next.maxPlayers < this.players.size) next.maxPlayers = this.players.size;
    this.settings = next;
    this.touch();
    this.broadcastState();
    return null;
  }

  setReady(playerId: string, ready: boolean) {
    const p = this.players.get(playerId);
    if (!p || (this.phase !== 'lobby' && this.phase !== 'gameOver')) return;
    p.ready = ready;
    this.touch();
    this.broadcastState();
  }

  kick(byId: string, targetId: string) {
    if (byId !== this.hostId || byId === targetId || !this.players.has(targetId)) return;
    this.removePlayer(targetId, 'kicked');
  }

  start(byId: string | null): string | null {
    if (byId !== null && byId !== this.hostId) return 'not_host';
    if (this.phase !== 'lobby' && this.phase !== 'gameOver') return 'in_game';
    if (this.connectedPlayers.length < MIN_PLAYERS) return 'not_enough_players';
    const test = this.hooks.words.pick(3, this.settings, new Set());
    if (test.length < 1) return 'no_words';
    this.clearAutoStart();
    for (const p of this.players.values()) { p.score = 0; p.guessed = false; }
    this.round = 1;
    this.usedWords.clear();
    this.lastTurn = null;
    this.history = [];
    this.buildQueue();
    this.hooks.onGameStart?.(this);
    this.system('system', 'msg.gameStarted', {});
    this.nextTurn();
    return null;
  }

  playAgain(byId: string) {
    if (byId !== this.hostId || this.phase !== 'gameOver') return;
    this.toLobby();
  }

  private toLobby() {
    this.clearTimers();
    this.phase = 'lobby';
    this.round = 0;
    this.artistId = null;
    this.word = null;
    this.endsAt = null;
    this.strokes = [];
    this.redoStack = [];
    for (const p of this.players.values()) { p.ready = false; p.guessed = false; }
    this.broadcastDraw('draw:sync', []);
    this.broadcastState();
    this.checkAutoStart();
  }

  private checkAutoStart() {
    if (!this.isPublic || this.phase !== 'lobby') return this.clearAutoStart();
    if (this.connectedPlayers.length >= MIN_PLAYERS) {
      if (!this.autoStartTimer) {
        this.autoStartAt = now() + this.timing.publicAutoStartMs;
        this.autoStartTimer = setTimeout(() => { this.autoStartTimer = null; this.autoStartAt = null; this.start(null); }, this.timing.publicAutoStartMs);
        this.broadcastState();
      }
    } else if (this.autoStartTimer) {
      this.clearAutoStart();
      this.broadcastState();
    }
  }
  private clearAutoStart() {
    if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
    this.autoStartTimer = null;
    this.autoStartAt = null;
  }

  /** If the game is running with fewer than 2 connected players for a while, return to the lobby. */
  private checkPlayerCount() {
    const inGame = this.phase === 'choosing' || this.phase === 'drawing' || this.phase === 'turnEnd';
    if (inGame && this.connectedPlayers.length < MIN_PLAYERS) {
      if (!this.lowPlayersTimer) {
        this.lowPlayersTimer = setTimeout(() => {
          this.lowPlayersTimer = null;
          if (this.connectedPlayers.length < MIN_PLAYERS && this.phase !== 'lobby') {
            this.hooks.onGameEnd?.(this, false);
            this.system('warn', 'msg.notEnoughPlayers', {});
            this.toLobby();
          }
        }, this.timing.notEnoughPlayersMs);
      }
    } else if (this.lowPlayersTimer) {
      clearTimeout(this.lowPlayersTimer);
      this.lowPlayersTimer = null;
    }
  }

  // ------------------------------------------------------------------ turns
  private buildQueue() {
    this.drawQueue = [...this.players.values()].sort((a, b) => a.joinedAt - b.joinedAt).map((p) => p.id);
  }

  private nextTurn() {
    let next: string | undefined;
    while ((next = this.drawQueue.shift())) {
      const p = this.players.get(next);
      if (p?.connected) break;
    }
    if (!next) return this.finishRound();
    this.artistId = next;
    this.word = null;
    this.revealed.clear();
    this.gains.clear();
    this.strokes = [];
    this.redoStack = [];
    this.openStrokeId = null;
    for (const p of this.players.values()) p.guessed = false;
    this.choices = this.hooks.words.pick(3, this.settings, this.usedWords);
    this.setPhase('choosing', this.timing.chooseMs || CHOOSE_SECONDS * 1000, () => this.chooseWord(this.artistId!, Math.floor(Math.random() * this.choices.length)));
    this.broadcastDraw('draw:sync', []);
    this.broadcastState();
  }

  private finishRound() {
    if (this.round >= this.settings.rounds) return this.gameOver();
    this.round++;
    this.buildQueue();
    this.nextTurn();
  }

  chooseWord(playerId: string, index: number) {
    if (this.phase !== 'choosing' || playerId !== this.artistId) return;
    const w = this.choices[index];
    if (!w) return;
    this.word = w;
    this.choices = [];
    this.usedWords.add(w.word);
    this.hooks.onWordChosen?.(w);
    this.eligibleGuessers = new Set(this.connectedPlayers.filter((p) => p.id !== this.artistId).map((p) => p.id));
    const total = this.timing.drawMsOverride ?? this.settings.drawTime * 1000;
    this.setPhase('drawing', total, () => this.endTurn('timeUp'));
    this.scheduleHints(total);
    this.system('system', 'msg.isDrawing', { name: this.players.get(playerId)!.name });
    this.broadcastState();
  }

  private scheduleHints(total: number) {
    if (!this.settings.hints || !this.word) return;
    const letters = [...this.word.word].map((c, i) => ({ c, i })).filter((x) => x.c !== ' ');
    const n = hintCount(letters.length);
    const at = [0.5, 0.75].slice(0, n);
    for (const f of at) {
      this.hintTimers.push(setTimeout(() => {
        const hidden = letters.filter((x) => !this.revealed.has(x.i));
        if (hidden.length <= 1) return;
        this.revealed.add(pick(hidden).i);
        this.broadcastState();
      }, total * f));
    }
  }

  private maybeEndEarly() {
    if (this.phase !== 'drawing') return;
    const remaining = [...this.eligibleGuessers].filter((id) => {
      const p = this.players.get(id);
      return p && p.connected && !p.guessed;
    });
    const guessedAny = [...this.players.values()].some((p) => p.guessed);
    if (remaining.length === 0 && (guessedAny || this.eligibleGuessers.size === 0)) this.endTurn('allGuessed');
  }

  private endTurn(reason: TurnSummary['reason']) {
    if (this.phase !== 'drawing' && this.phase !== 'choosing') return;
    const word = this.word ?? this.choices[0] ?? null;
    const artist = this.artistId ? this.players.get(this.artistId) : undefined;
    const correct = [...this.players.values()].filter((p) => p.guessed).length;
    if (artist && reason !== 'artistLeft' && this.phase === 'drawing') {
      const pts = artistPoints(correct, this.eligibleGuessers.size);
      artist.score += pts;
      this.gains.set(artist.id, pts);
    }
    if (this.word) this.hooks.onTurnEnd?.(this.word, correct > 0);
    const roundEnded = !this.drawQueue.some((id) => this.players.get(id)?.connected);
    this.lastTurn = {
      word: word?.word ?? '', meaning: word?.meaning ?? '', artistId: this.artistId ?? '',
      gains: Object.fromEntries(this.gains), reason: this.phase === 'choosing' && reason !== 'artistLeft' ? 'skipped' : reason, roundEnded,
    };
    this.clearHintTimers();
    if (this.artistGraceTimer) { clearTimeout(this.artistGraceTimer); this.artistGraceTimer = null; }
    this.system('system', 'msg.wordWas', { word: word?.word ?? '' });
    this.setPhase('turnEnd', this.timing.turnEndMs, () => this.nextTurn());
    this.broadcastState();
  }

  private gameOver() {
    this.clearTimers();
    this.phase = 'gameOver';
    this.artistId = null;
    this.endsAt = null;
    for (const p of this.players.values()) p.ready = false;
    this.hooks.onGameEnd?.(this, true);
    this.broadcastState();
  }

  private setPhase(phase: Phase, ms: number, onEnd: () => void) {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    this.phase = phase;
    this.phaseStartedAt = now();
    this.endsAt = now() + ms;
    this.phaseTimer = setTimeout(() => { this.phaseTimer = null; onEnd(); }, ms);
    this.touch();
  }

  private clearHintTimers() { this.hintTimers.forEach(clearTimeout); this.hintTimers = []; }
  private clearTimers() {
    if (this.phaseTimer) clearTimeout(this.phaseTimer);
    if (this.artistGraceTimer) clearTimeout(this.artistGraceTimer);
    if (this.lowPlayersTimer) clearTimeout(this.lowPlayersTimer);
    this.phaseTimer = this.artistGraceTimer = this.lowPlayersTimer = null;
    this.clearHintTimers();
    this.clearAutoStart();
  }

  destroy() {
    this.destroyed = true;
    this.clearTimers();
    for (const p of this.players.values()) if (p.removeTimer) clearTimeout(p.removeTimer);
  }

  // ------------------------------------------------------------------ chat & guesses
  /** Returns an error key or null. */
  chat(playerId: string, text: string): string | null {
    const p = this.players.get(playerId);
    if (!p) return 'not_in_room';
    this.touch();
    const t = now();
    p.recentChat = p.recentChat.filter((m) => t - m.ts < 15_000);
    if (p.recentChat.filter((m) => answerKey(m.text) === answerKey(text)).length >= 3) return 'spam';
    p.recentChat.push({ text, ts: t });

    if (this.phase === 'drawing' && this.word) {
      if (playerId === this.artistId) {
        if (answerKey(text).includes(answerKey(this.word.word))) return 'no_reveal';
        this.publicChat(p, text);
        return null;
      }
      if (p.guessed) {
        // Only visible to players who know the word already.
        const msg = this.msg({ kind: 'guessedChat', playerId: p.id, name: p.name, text });
        for (const q of this.players.values()) if ((q.guessed || q.id === this.artistId) && q.socketId) this.hooks.emit(q.socketId, 'chat:msg', msg);
        return null;
      }
      if (!this.eligibleGuessers.has(p.id)) this.eligibleGuessers.add(p.id); // late joiner may guess
      const result = compareGuess(text, this.word.word);
      if (result === 'correct') { this.correctGuess(p); return null; }
      if (result === 'close') {
        if (p.socketId) {
          this.hooks.emit(p.socketId, 'chat:msg', this.msg({ kind: 'chat', playerId: p.id, name: p.name, text }));
          this.hooks.emit(p.socketId, 'chat:msg', this.msg({ kind: 'close', key: 'msg.close', params: { guess: text } }));
          this.hooks.emit(p.socketId, 'guess:result', { result: 'close' });
        }
        return null;
      }
    }
    this.publicChat(p, text);
    return null;
  }

  private publicChat(p: Player, text: string) {
    const m = this.msg({ kind: 'chat', playerId: p.id, name: p.name, text });
    this.pushHistory(m);
    for (const q of this.players.values()) if (q.socketId) this.hooks.emit(q.socketId, 'chat:msg', m);
  }

  private correctGuess(p: Player) {
    const total = this.timing.drawMsOverride ?? this.settings.drawTime * 1000;
    const remaining = Math.max(0, (this.endsAt ?? now()) - now());
    const pts = guessPoints(remaining, total);
    p.guessed = true;
    p.score += pts;
    this.gains.set(p.id, pts);
    if (p.socketId) this.hooks.emit(p.socketId, 'guess:result', { result: 'correct', points: pts });
    this.system('correct', 'msg.guessed', { name: p.name, points: pts });
    this.broadcastState();
    this.maybeEndEarly();
  }

  reaction(playerId: string, id: ReactionId) {
    if (!this.players.has(playerId)) return;
    for (const q of this.players.values()) if (q.socketId) this.hooks.emit(q.socketId, 'reaction', { playerId, id });
  }

  recentMessagesOf(playerId: string) {
    return this.history.filter((m) => m.playerId === playerId).slice(-10).map((m) => m.text ?? '');
  }

  private msg(m: Omit<ChatMessage, 'id' | 'ts'>): ChatMessage { return { ...m, id: shortId(), ts: now() }; }
  private pushHistory(m: ChatMessage) {
    this.history.push(m);
    if (this.history.length > 60) this.history.shift();
  }
  private system(kind: ChatMessage['kind'], key: string, params: Record<string, string | number>) {
    const m = this.msg({ kind, key, params });
    // The word is only revealed in public history once the turn is over (msg.wordWas is sent in turnEnd).
    this.pushHistory(m);
    for (const q of this.players.values()) if (q.socketId) this.hooks.emit(q.socketId, 'chat:msg', m);
  }

  // ------------------------------------------------------------------ drawing
  /** Applies validated ops from the artist and relays them. Returns false if rejected. */
  draw(playerId: string, ops: DrawOp[]): boolean {
    if (this.phase !== 'drawing' || playerId !== this.artistId) return false;
    const accepted: DrawOp[] = [];
    for (const op of ops) if (this.applyOp(op)) accepted.push(op);
    if (!accepted.length) return false;
    this.touch();
    for (const q of this.players.values()) if (q.id !== playerId && q.socketId) this.hooks.emit(q.socketId, 'draw:ops', accepted);
    return true;
  }

  private inRange(n: number) { return Number.isInteger(n) && n >= 0 && n <= COORD_SCALE; }
  private colorOk(c: string) { return COLOR_RE.test(c) && PALETTE_SET.has(c.toUpperCase()); }

  private applyOp(op: DrawOp): boolean {
    switch (op.t) {
      case 'begin': {
        if (this.strokes.length >= MAX_STROKES) return false;
        if (!this.colorOk(op.c) || !(BRUSH_SIZES as readonly number[]).includes(op.s) || !this.inRange(op.x) || !this.inRange(op.y)) return false;
        if (this.strokes.some((s) => s.id === op.id)) return false;
        this.strokes.push({ kind: 'line', id: op.id, c: op.c, s: op.s, e: op.e ? 1 : 0, p: [op.x, op.y] });
        this.redoStack = [];
        this.openStrokeId = op.id;
        return true;
      }
      case 'pts': {
        const s = this.strokes[this.strokes.length - 1];
        if (!s || s.kind !== 'line' || s.id !== op.id || this.openStrokeId !== op.id) return false;
        if (op.p.length % 2 !== 0 || op.p.length > 400 || !op.p.every((n) => this.inRange(n))) return false;
        if (s.p.length + op.p.length > MAX_POINTS_PER_STROKE) return false;
        s.p.push(...op.p);
        return true;
      }
      case 'fill': {
        if (this.strokes.length >= MAX_STROKES) return false;
        if (!this.colorOk(op.c) || !this.inRange(op.x) || !this.inRange(op.y)) return false;
        this.strokes.push({ kind: 'fill', id: op.id, c: op.c, x: op.x, y: op.y });
        this.redoStack = [];
        this.openStrokeId = null;
        return true;
      }
      case 'undo': {
        const s = this.strokes.pop();
        if (!s) return false;
        this.redoStack.push(s);
        this.openStrokeId = null;
        return true;
      }
      case 'redo': {
        const s = this.redoStack.pop();
        if (!s) return false;
        this.strokes.push(s);
        this.openStrokeId = null;
        return true;
      }
      case 'clear':
        this.strokes = [];
        this.redoStack = [];
        this.openStrokeId = null;
        return true;
      default:
        return false;
    }
  }

  // ------------------------------------------------------------------ views
  private sendFullSync(p: Player) {
    if (!p.socketId) return;
    this.hooks.emit(p.socketId, 'chat:history', this.history.slice(-40));
    this.hooks.emit(p.socketId, 'draw:sync', this.phase === 'drawing' ? this.strokes : this.phase === 'turnEnd' ? this.strokes : []);
  }

  private broadcastDraw(event: 'draw:sync', strokes: Stroke[]) {
    for (const q of this.players.values()) if (q.socketId) this.hooks.emit(q.socketId, event, strokes);
  }

  broadcastState() {
    if (this.destroyed) return;
    for (const p of this.players.values()) if (p.socketId) this.hooks.emit(p.socketId, 'state', this.viewFor(p.id));
  }

  viewFor(playerId: string): RoomView {
    const me = this.players.get(playerId);
    const isArtist = playerId === this.artistId;
    const knowsWord = !!this.word && (isArtist || !!me?.guessed);
    const players: PlayerView[] = [...this.players.values()].map((p) => ({
      id: p.id, name: p.name, avatar: p.avatar, score: p.score, connected: p.connected, ready: p.ready, guessed: p.guessed,
    }));
    let wordMask: string[] | null = null;
    if (this.word && this.phase === 'drawing') {
      wordMask = [...this.word.word].map((c, i) => (c === ' ' ? ' ' : knowsWord || this.revealed.has(i) ? c : '_'));
    }
    return {
      code: this.code,
      isPublic: this.isPublic,
      you: playerId,
      hostId: this.hostId,
      phase: this.phase,
      settings: this.settings,
      players,
      round: this.round,
      artistId: this.artistId,
      endsAt: this.endsAt,
      serverNow: now(),
      wordMask,
      word: this.phase === 'drawing' && knowsWord ? this.word!.word : null,
      meaning: this.phase === 'drawing' && knowsWord ? this.word!.meaning : null,
      category: this.phase === 'drawing' && this.word ? this.word.category : null,
      choices: this.phase === 'choosing' && isArtist ? this.choices.map((c) => ({ word: c.word, meaning: c.meaning, difficulty: c.difficulty })) : null,
      lastTurn: this.phase === 'turnEnd' || this.phase === 'gameOver' ? this.lastTurn : null,
      autoStartAt: this.autoStartAt,
      canDraw: isArtist && this.phase === 'drawing',
    };
  }

  /** Test helper: the secret word (never sent to guessers). */
  get secretWord() { return this.word?.word ?? null; }
  get choiceWords() { return this.choices.map((c) => c.word); }
  get strokeCount() { return this.strokes.length; }

  private touch() { this.lastActivity = now(); }
}
