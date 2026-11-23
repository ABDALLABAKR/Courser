import { evaluateGuess, isWin, type LetterState } from './evaluate';
import { extractLetters, graphemes, isSoraniLetter, normalizeKurdish } from './kurdish';
import { isValidGuess, MAX_GUESSES, WORD_LENGTH } from '../data/dictionary';

export type GameMode = 'daily' | 'unlimited';
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
}

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

export type SubmitError = 'too-short' | 'not-in-list' | 'not-playing';

export type SubmitResult =
  | { ok: true; state: GameState; guess: ScoredGuess }
  | { ok: false; error: SubmitError; state: GameState };

export function submitGuess(state: GameState): SubmitResult {
  if (state.status !== 'playing') return { ok: false, error: 'not-playing', state };
  if (state.current.length < WORD_LENGTH) return { ok: false, error: 'too-short', state };
  const word = state.current.join('');
  if (!isValidGuess(word)) return { ok: false, error: 'not-in-list', state };

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
      guesses,
      current: [],
      status: won ? 'won' : lost ? 'lost' : 'playing',
      finishedAt: won || lost ? Date.now() : undefined,
    },
  };
}

export function isFinished(state: GameState): boolean {
  return state.status !== 'playing';
}

/** Defensive check for data loaded from localStorage. */
export function isValidSavedGame(x: unknown): x is GameState {
  if (!x || typeof x !== 'object') return false;
  const g = x as GameState;
  return (
    (g.mode === 'daily' || g.mode === 'unlimited') &&
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
