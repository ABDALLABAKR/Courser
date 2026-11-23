import type { ReactionId } from './constants';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultySetting = Difficulty | 'mixed';
export type Lang = 'ckb' | 'en';

export interface Avatar { skin: number; color: number; eyes: number; mouth: number; acc: number }
export interface Profile { name: string; avatar: Avatar }

export interface RoomSettings {
  rounds: number;
  drawTime: number;
  maxPlayers: number;
  difficulty: DifficultySetting;
  categories: string[]; // empty = all
  customWords: string[];
  customOnly: boolean;
  hints: boolean;
}

export type Phase = 'lobby' | 'choosing' | 'drawing' | 'turnEnd' | 'gameOver';

export interface PlayerView {
  id: string;
  name: string;
  avatar: Avatar;
  score: number;
  connected: boolean;
  ready: boolean;
  guessed: boolean;
}

export interface TurnSummary {
  word: string;
  meaning: string;
  artistId: string;
  /** Points gained this turn per player id. */
  gains: Record<string, number>;
  reason: 'allGuessed' | 'timeUp' | 'artistLeft' | 'skipped';
  roundEnded: boolean;
}

export interface RoomView {
  code: string;
  isPublic: boolean;
  you: string;
  hostId: string;
  phase: Phase;
  settings: RoomSettings;
  players: PlayerView[];
  round: number;
  artistId: string | null;
  /** Server epoch ms the current phase ends, or null. */
  endsAt: number | null;
  serverNow: number;
  /** One entry per character: a letter if revealed, '_' if hidden, ' ' for spaces. */
  wordMask: string[] | null;
  /** The full word — only present for the artist, players who already guessed, or after the turn. */
  word: string | null;
  meaning: string | null;
  category: string | null;
  /** Only present for the artist during the choosing phase. */
  choices: { word: string; meaning: string; difficulty: Difficulty }[] | null;
  lastTurn: TurnSummary | null;
  autoStartAt: number | null;
  canDraw: boolean;
}

export type ChatKind = 'chat' | 'system' | 'correct' | 'close' | 'join' | 'leave' | 'guessedChat' | 'warn';
export interface ChatMessage {
  id: string;
  kind: ChatKind;
  playerId?: string;
  name?: string;
  /** Raw text for player chat. For system messages, `key` + `params` are used for localisation. */
  text?: string;
  key?: string;
  params?: Record<string, string | number>;
  ts: number;
}

// ---- drawing ----
export type DrawOp =
  | { t: 'begin'; id: number; c: string; s: number; e: 0 | 1; x: number; y: number }
  | { t: 'pts'; id: number; p: number[] }
  | { t: 'fill'; id: number; c: string; x: number; y: number }
  | { t: 'clear' }
  | { t: 'undo' }
  | { t: 'redo' };

export type Stroke =
  | { kind: 'line'; id: number; c: string; s: number; e: 0 | 1; p: number[] }
  | { kind: 'fill'; id: number; c: string; x: number; y: number };

// ---- socket contract ----
export type Ack<T = {}> = (res: ({ ok: true } & T) | { ok: false; error: string }) => void;
export interface JoinResult { code: string; session: string; playerId: string }

export interface ClientToServer {
  'room:create': (p: { profile: Profile; settings?: Partial<RoomSettings>; session?: string }, ack: Ack<JoinResult>) => void;
  'room:join': (p: { code: string; profile: Profile; session?: string }, ack: Ack<JoinResult>) => void;
  'room:quickplay': (p: { profile: Profile; session?: string }, ack: Ack<JoinResult>) => void;
  'room:leave': () => void;
  'room:settings': (p: Partial<RoomSettings>, ack?: Ack) => void;
  'room:ready': (ready: boolean) => void;
  'room:start': (ack?: Ack) => void;
  'room:kick': (playerId: string) => void;
  'room:playAgain': () => void;
  'word:choose': (index: number) => void;
  'draw:ops': (ops: DrawOp[]) => void;
  'chat:send': (text: string, ack?: Ack) => void;
  'reaction:send': (id: ReactionId) => void;
  'report': (p: { playerId: string; reason: string }, ack?: Ack) => void;
}

export interface ServerToClient {
  'state': (view: RoomView) => void;
  'chat:msg': (msg: ChatMessage) => void;
  'chat:history': (msgs: ChatMessage[]) => void;
  'draw:ops': (ops: DrawOp[]) => void;
  'draw:sync': (strokes: Stroke[]) => void;
  'reaction': (p: { playerId: string; id: ReactionId }) => void;
  'guess:result': (p: { result: 'correct' | 'close'; points?: number }) => void;
  'kicked': (reason: 'kicked' | 'replaced' | 'expired') => void;
  'online': (count: number) => void;
}
