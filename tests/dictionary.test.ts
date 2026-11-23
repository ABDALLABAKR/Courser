import { describe, expect, it } from 'vitest';
import { ANSWER_SOURCE } from '../src/data/answers';
import { EXTRA_GUESS_SOURCE } from '../src/data/guesses';
import { DAILY_ERAS } from '../src/data/daily';
import {
  ANSWERS, DAILY_ERA_ENTRIES, DICTIONARY_MODE, isValidGuess, lookupEntry, WORD_LENGTH,
} from '../src/data/dictionary';
import { graphemes, isSoraniLetter, normalizeKurdish } from '../src/game/kurdish';
import { KEY_ROWS } from '../src/components/Keyboard';

describe('dictionary integrity', () => {
  const all = [...ANSWER_SOURCE, ...EXTRA_GUESS_SOURCE];

  it('every word is exactly 5 Sorani letters', () => {
    for (const e of all) {
      const letters = graphemes(normalizeKurdish(e.word));
      expect(letters, e.word).toHaveLength(WORD_LENGTH);
      expect(letters.every(isSoraniLetter), e.word).toBe(true);
    }
  });

  it('words are stored in canonical form (already normalized)', () => {
    for (const e of all) expect(normalizeKurdish(e.word), e.word).toBe(e.word);
  });

  it('has no duplicates across answers and guesses', () => {
    const seen = new Set<string>();
    for (const e of all) {
      expect(seen.has(e.word), `duplicate: ${e.word}`).toBe(false);
      seen.add(e.word);
    }
  });

  it('every answer has a definition and category', () => {
    for (const e of ANSWER_SOURCE) {
      expect(e.definition, e.word).toBeTruthy();
      expect(e.category, e.word).toBeTruthy();
    }
  });

  it('answers in production mode are only verified words', () => {
    if (DICTIONARY_MODE === 'production') {
      expect(ANSWERS.every((e) => e.status === 'verified')).toBe(true);
      expect(ANSWERS.length).toBeGreaterThan(0);
    } else {
      expect(ANSWERS.every((e) => e.status !== 'rejected')).toBe(true);
    }
  });

  it('every answer is an accepted guess', () => {
    for (const e of ANSWERS) expect(isValidGuess(e.word), e.word).toBe(true);
  });

  it('accepts guesses typed with Arabic code points', () => {
    expect(isValidGuess('كوردي')).toBe(true);
    expect(lookupEntry('كوردي')?.word).toBe('کوردی');
    expect(isValidGuess('ئئئئئ')).toBe(false);
  });

  it('the on-screen keyboard can type every dictionary word', () => {
    const keys = new Set(KEY_ROWS.flat());
    for (const e of all) for (const l of graphemes(e.word)) expect(keys.has(l), `${l} in ${e.word}`).toBe(true);
  });
});

describe('daily schedule eras', () => {
  it('each era only contains answer words, each once', () => {
    const answers = new Set(ANSWER_SOURCE.map((e) => e.word));
    for (const era of DAILY_ERAS) {
      expect(new Set(era.words).size).toBe(era.words.length);
      for (const w of era.words) expect(answers.has(w), w).toBe(true);
    }
  });

  it('eras are ordered and every word resolves to a usable entry', () => {
    DAILY_ERAS.forEach((era, i) => {
      if (i > 0) expect(era.fromPuzzle).toBeGreaterThan(DAILY_ERAS[i - 1].fromPuzzle);
      expect(DAILY_ERA_ENTRIES[i].entries.length).toBe(era.words.length);
    });
  });

  it('the current era covers at least a full year without repeating', () => {
    expect(DAILY_ERAS[DAILY_ERAS.length - 1].words.length).toBeGreaterThanOrEqual(365);
  });
});
