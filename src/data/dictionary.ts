import { ANSWER_SOURCE } from './answers';
import { EXTRA_GUESS_SOURCE } from './guesses';
import { DAILY_ORDER } from './daily';
import { buildEntry, type DictionaryEntry } from './schema';
import { normalizeKurdish } from '../game/kurdish';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/**
 * `demo`        — answers may use `unreviewed` words. The UI shows a small
 *                 "demo dictionary" notice so players are not misled.
 * `production`  — only `verified` words can ever be answers.
 */
export type DictionaryMode = 'demo' | 'production';
export const DICTIONARY_MODE: DictionaryMode = 'demo';

const usable = (e: DictionaryEntry) => e.status !== 'rejected' && e.length === WORD_LENGTH;
const answerAllowed = (e: DictionaryEntry) =>
  e.status === 'verified' || (DICTIONARY_MODE === 'demo' && e.status === 'unreviewed');

/** Collection 1: every possible answer (with definitions). */
export const ANSWERS: readonly DictionaryEntry[] = ANSWER_SOURCE.map(buildEntry).filter(
  (e) => usable(e) && answerAllowed(e),
);

/** Collection 2: everything a player may type (answers ∪ extra guesses). */
const GUESS_INDEX = new Map<string, DictionaryEntry>();
for (const e of [...ANSWER_SOURCE, ...EXTRA_GUESS_SOURCE].map(buildEntry)) {
  if (usable(e) && !GUESS_INDEX.has(e.normalized)) GUESS_INDEX.set(e.normalized, e);
}

const ANSWER_INDEX = new Map(ANSWERS.map((e) => [e.normalized, e]));

export function isValidGuess(word: string): boolean {
  return GUESS_INDEX.has(normalizeKurdish(word));
}

export function lookupEntry(word: string): DictionaryEntry | undefined {
  const n = normalizeKurdish(word);
  return ANSWER_INDEX.get(n) ?? GUESS_INDEX.get(n);
}

export const ACCEPTED_GUESS_COUNT = GUESS_INDEX.size;

/** Daily words in order, filtered to those still allowed as answers. */
export const DAILY_ENTRIES: readonly DictionaryEntry[] = DAILY_ORDER.map((w) =>
  ANSWER_INDEX.get(normalizeKurdish(w)),
).filter((e): e is DictionaryEntry => Boolean(e));

/** Letters that occur anywhere in the dictionary (used to dim unused keys). */
export const LETTERS_IN_USE: ReadonlySet<string> = new Set(
  [...GUESS_INDEX.values()].flatMap((e) => e.letters),
);
