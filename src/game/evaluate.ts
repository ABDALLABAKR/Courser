export type LetterState = 'correct' | 'present' | 'absent';

/**
 * Score a guess against the answer using the standard two-pass algorithm,
 * which handles repeated letters correctly:
 *
 *  Pass 1 — mark exact matches green and remove them from the pool.
 *  Pass 2 — for every remaining guess letter, mark yellow only while an
 *           unmatched copy of that letter is still in the pool; otherwise gray.
 *
 * Both arguments are arrays of graphemes in logical (reading) order.
 */
export function evaluateGuess(guess: readonly string[], answer: readonly string[]): LetterState[] {
  if (guess.length !== answer.length) {
    throw new Error(`Guess length ${guess.length} ≠ answer length ${answer.length}`);
  }
  const result: LetterState[] = new Array(guess.length).fill('absent');
  const pool = new Map<string, number>();

  for (let i = 0; i < answer.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
    } else {
      pool.set(answer[i], (pool.get(answer[i]) ?? 0) + 1);
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const left = pool.get(guess[i]) ?? 0;
    if (left > 0) {
      result[i] = 'present';
      pool.set(guess[i], left - 1);
    }
  }
  return result;
}

const RANK: Record<LetterState, number> = { absent: 1, present: 2, correct: 3 };

/** Keyboard colouring: green beats yellow, yellow beats gray. */
export function mergeKeyStates(
  rows: ReadonlyArray<{ letters: readonly string[]; states: readonly LetterState[] }>,
): Record<string, LetterState> {
  const keys: Record<string, LetterState> = {};
  for (const { letters, states } of rows) {
    letters.forEach((l, i) => {
      const s = states[i];
      const prev = keys[l];
      if (!prev || RANK[s] > RANK[prev]) keys[l] = s;
    });
  }
  return keys;
}

export function isWin(states: readonly LetterState[]): boolean {
  return states.length > 0 && states.every((s) => s === 'correct');
}
