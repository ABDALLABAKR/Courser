import { evaluateGuess, isWin, type LetterState } from './evaluate';
import { extractLetters, graphemes, isSoraniLetter, normalizeKurdish } from './kurdish';
import { isValidGuess, MAX_GUESSES, WORD_LENGTH } from '../data/dictionary';

export type GameMode = 'daily' | 'unlimited' | 'archive';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface ScoredGuess {
  letters: string[];
  states: LetterState[];
}

export interface GameState {
  mode: GameMode;
  /** Daily puzzle number, or a running counter for unlimited rounds. */
  puzzleNumber: number;
  /** Normalized answer. */
  answer: string;
  guesses: ScoredGuess[];
  current: string[];
  status: GameStatus;
  startedAt: number;
  finishedAt?: number;
  /** Hard mode was active for this round (locked in on the first guess). */
  hard?: boolean;
  /** Positions revealed with the hint button (unlimited mode). */
  hints?: number[];
}

export const MAX_HINTS = 2;

export function newGame(mode: GameMode, puzzleNumber: number, answer: string): GameState {
  return {
    mode,
    puzzleNumber,
    answer: normalizeKurdish(answer),
    guesses: [],
    current: [],
    status: 'playing',
    startedAt: Date.now(),
  };
}

export function addLetter(state: GameState, letter: string): GameState {
  if (state.status !== 'playing' || state.current.length >= WORD_LENGTH) return state;
  const [ch] = extractLetters(letter);
  if (!ch || !isSoraniLetter(ch)) return state;
  return { ...state, current: [...state.current, ch] };
}

/** Insert many letters at once (paste). Extra letters are ignored. */
export function addText(state: GameState, text: string): GameState {
  let s = state;
  for (const ch of extractLetters(text)) s = addLetter(s, ch);
  return s;
}

export function removeLetter(state: GameState): GameState {
  if (state.status !== 'playing' || state.current.length === 0) return state;
  return { ...state, current: state.current.slice(0, -1) };
}

export type SubmitError = 'too-short' | 'not-in-list' | 'not-playing' | 'hard-green' | 'hard-present';

export type SubmitResult =
  | { ok: true; state: GameState; guess: ScoredGuess }
  | { ok: false; error: SubmitError; state: GameState; letter?: string; position?: number };

/**
 * Hard-mode rule: every green letter found so far must stay in its place, and
 * every revealed yellow/green letter must be used (as many times as revealed).
 */
export function checkHardMode(
  guesses: readonly ScoredGuess[],
  current: readonly string[],
): { error: 'hard-green' | 'hard-present'; letter: string; position?: number } | null {
  for (const g of guesses) {
    for (let i = 0; i < g.letters.length; i++) {
      if (g.states[i] === 'correct' && current[i] !== g.letters[i]) {
        return { error: 'hard-green', letter: g.letters[i], position: i };
      }
    }
    const need = new Map<string, number>();
    g.letters.forEach((l, i) => {
      if (g.states[i] !== 'absent') need.set(l, (need.get(l) ?? 0) + 1);
    });
    for (const [letter, n] of need) {
      if (current.filter((c) => c === letter).length < n) return { error: 'hard-present', letter };
    }
  }
  return null;
}

export function submitGuess(state: GameState, opts: { hard?: boolean } = {}): SubmitResult {
  if (state.status !== 'playing') return { ok: false, error: 'not-playing', state };
  if (state.current.length < WORD_LENGTH) return { ok: false, error: 'too-short', state };
  const word = state.current.join('');
  if (!isValidGuess(word)) return { ok: false, error: 'not-in-list', state };
  // Hard mode can be switched on only before the first guess, off any time.
  const hard = state.guesses.length === 0 ? !!opts.hard : !!state.hard && !!opts.hard;
  if (hard) {
    const v = checkHardMode(state.guesses, state.current);
    if (v) return { ok: false, state, ...v };
  }

  const states = evaluateGuess(state.current, graphemes(state.answer));
  const guess: ScoredGuess = { letters: state.current, states };
  const guesses = [...state.guesses, guess];
  const won = isWin(states);
  const lost = !won && guesses.length >= MAX_GUESSES;
  return {
    ok: true,
    guess,
    state: {
      ...state,
      hard,
      guesses,
      current: [],
      status: won ? 'won' : lost ? 'lost' : 'playing',
      finishedAt: won || lost ? Date.now() : undefined,
    },
  };
}

/** Positions not yet known: never green in a guess and not already hinted. */
export function hintablePositions(state: GameState): number[] {
  const known = new Set(state.hints ?? []);
  for (const g of state.guesses) g.states.forEach((st, i) => st === 'correct' && known.add(i));
  return Array.from({ length: WORD_LENGTH }, (_, i) => i).filter((i) => !known.has(i));
}

/** Reveal one unknown letter. Returns the same state when no hint is possible. */
export function revealHint(state: GameState, rand: () => number = Math.random): GameState {
  if (state.status !== 'playing' || (state.hints?.length ?? 0) >= MAX_HINTS) return state;
  const open = hintablePositions(state);
  if (open.length <= 1) return state; // never give away the whole word
  const pos = open[Math.floor(rand() * open.length)];
  return { ...state, hints: [...(state.hints ?? []), pos] };
}

export function isFinished(state: GameState): boolean {
  return state.status !== 'playing';
}

/** Defensive check for data loaded from localStorage. */
export function isValidSavedGame(x: unknown): x is GameState {
  if (!x || typeof x !== 'object') return false;
  const g = x as GameState;
  return (
    (g.mode === 'daily' || g.mode === 'unlimited' || g.mode === 'archive') &&
    typeof g.puzzleNumber === 'number' &&
    typeof g.answer === 'string' &&
    graphemes(g.answer).length === WORD_LENGTH &&
    Array.isArray(g.guesses) &&
    g.guesses.length <= MAX_GUESSES &&
    g.guesses.every((r) => Array.isArray(r.letters) && Array.isArray(r.states)) &&
    Array.isArray(g.current) &&
    ['playing', 'won', 'lost'].includes(g.status)
  );
}
