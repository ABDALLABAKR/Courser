import { describe, expect, it } from 'vitest';
import { extractLetters, graphemes, letterCount, normalizeKurdish, SORANI_LETTERS } from '../src/game/kurdish';

describe('normalizeKurdish — merges only true encoding variants', () => {
  it.each([
    ['Arabic yeh ي → Sorani ی', 'کوردي', 'کوردی'],
    ['alef maksura ى → ی', 'کوردى', 'کوردی'],
    ['Arabic kaf ك → ک', 'كوردی', 'کوردی'],
    ['heh doachashmee ھ → ه', 'ھاوین', 'هاوین'],
    ['teh marbuta ة → ە', 'پشیلة', 'پشیلە'],
    ['Persian ezafe heh ۀ → ە', 'پشیلۀ', 'پشیلە'],
    ['alef with hamza أ → ا', 'بأران', 'باران'],
  ])('%s', (_name, input, expected) => {
    expect(normalizeKurdish(input)).toBe(expected);
  });

  it('removes harakat, tatweel, ZWNJ and bidi controls', () => {
    expect(normalizeKurdish('بـــاران')).toBe('باران');
    expect(normalizeKurdish('بَارانِ')).toBe('باران');
    expect(normalizeKurdish('پشیلە‌')).toBe('پشیلە');
    expect(normalizeKurdish('‏باران‎')).toBe('باران');
    expect(normalizeKurdish('⁧باران⁩')).toBe('باران');
  });

  it('folds Arabic presentation forms (e.g. from PDFs) into base letters', () => {
    // ﺑ ﺎ ﺭ ﺍ ﻥ  (presentation forms B)
    expect(normalizeKurdish('ﺑﺎﺭﺍﻥ')).toBe('باران');
  });

  it('composes decomposed Sorani letters', () => {
    expect(normalizeKurdish('رٚێگا')).toBe('ڕێگا');
    expect(normalizeKurdish('گولٚ')).toBe('گوڵ');
  });

  it('never merges letters that are different Kurdish sounds', () => {
    const pairs: Array<[string, string]> = [
      ['ر', 'ڕ'], ['ل', 'ڵ'], ['و', 'ۆ'], ['ی', 'ێ'], ['ه', 'ە'], ['ک', 'گ'], ['ف', 'ڤ'],
    ];
    for (const [a, b] of pairs) {
      expect(normalizeKurdish(a)).toBe(a);
      expect(normalizeKurdish(b)).toBe(b);
      expect(normalizeKurdish(a)).not.toBe(normalizeKurdish(b));
    }
  });

  it('is idempotent and keeps every Sorani letter intact', () => {
    for (const l of SORANI_LETTERS) expect(normalizeKurdish(l)).toBe(l);
    const once = normalizeKurdish('ھەولێر كوردستان');
    expect(normalizeKurdish(once)).toBe(once);
  });
});

describe('grapheme counting', () => {
  it('counts Kurdish letters, not UTF-16 code units', () => {
    expect(letterCount('باران')).toBe(5);
    expect(letterCount('ڕۆژ')).toBe(3);
    // A combining mark does not create an extra letter.
    expect(graphemes('بَ')).toHaveLength(1);
  });

  it('treats the long vowel وو as two letters (two tiles)', () => {
    expect(letterCount('خانوو')).toBe(5);
    expect(graphemes('خانوو').slice(-2)).toEqual(['و', 'و']);
  });

  it('emoji count as one grapheme each (not two code units)', () => {
    expect('🟩'.length).toBe(2);
    expect(letterCount('🟩🟨')).toBe(2);
  });
});

describe('extractLetters (paste / typing)', () => {
  it('keeps only Sorani letters, normalized, in reading order', () => {
    expect(extractLetters(' باران! 123 abc')).toEqual(['ب', 'ا', 'ر', 'ا', 'ن']);
    expect(extractLetters('كوردي')).toEqual(['ک', 'و', 'ر', 'د', 'ی']);
  });

  it('drops invisible characters that copy-paste often carries', () => {
    expect(extractLetters('‏هەتاو‌')).toEqual(['ه', 'ە', 'ت', 'ا', 'و']);
  });
});
