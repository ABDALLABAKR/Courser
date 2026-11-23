import { MAX_ARTIST_POINTS, MAX_GUESS_POINTS, MIN_GUESS_POINTS } from '@wene/shared';

/** Points for a correct guess: linear from MAX (instant) down to MIN (last moment), rounded to 5. */
export function guessPoints(remainingMs: number, totalMs: number): number {
  const f = Math.max(0, Math.min(1, totalMs > 0 ? remainingMs / totalMs : 0));
  const p = MIN_GUESS_POINTS + (MAX_GUESS_POINTS - MIN_GUESS_POINTS) * f;
  return Math.round(p / 5) * 5;
}

/** Artist bonus: proportional to the share of eligible guessers who got it. */
export function artistPoints(correct: number, eligible: number): number {
  if (eligible <= 0 || correct <= 0) return 0;
  return Math.round((MAX_ARTIST_POINTS * Math.min(correct, eligible)) / eligible / 5) * 5;
}

/** Number of letters to reveal as hints for a word of `letters` letters. */
export function hintCount(letters: number): number {
  if (letters < 4) return 0;
  if (letters < 6) return 1;
  return 2;
}
