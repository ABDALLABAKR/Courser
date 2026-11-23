/**
 * Kurdish Sorani text utilities.
 *
 * Design rules
 * ------------
 * 1. Letters are counted as Unicode grapheme clusters, never `string.length`.
 * 2. Only characters that are *visually confusable encodings of the same
 *    Sorani letter* are merged (e.g. Arabic ي → Sorani ی, Arabic ك → ک).
 * 3. Letters that represent DIFFERENT Kurdish sounds are never merged:
 *      ر ≠ ڕ   ل ≠ ڵ   و ≠ ۆ   ی ≠ ێ   ه ≠ ە   ک ≠ گ   ف ≠ ڤ
 * 4. Invisible formatting characters (ZWNJ, tatweel, bidi controls) and
 *    Arabic diacritics (harakat) are removed, since Sorani writes all vowels
 *    as full letters and the diacritics never distinguish Sorani words.
 */

/** The 33 letters of the Sorani alphabet (ئ included as the vowel carrier). */
export const SORANI_LETTERS = [
  'ئ', 'ا', 'ب', 'پ', 'ت', 'ج', 'چ', 'ح', 'خ', 'د', 'ر', 'ڕ', 'ز', 'ژ', 'س', 'ش', 'ع',
  'غ', 'ف', 'ڤ', 'ق', 'ک', 'گ', 'ل', 'ڵ', 'م', 'ن', 'ه', 'ە', 'و', 'ۆ', 'ی', 'ێ',
] as const;

export type SoraniLetter = (typeof SORANI_LETTERS)[number];

const LETTER_SET: ReadonlySet<string> = new Set(SORANI_LETTERS);

export function isSoraniLetter(ch: string): ch is SoraniLetter {
  return LETTER_SET.has(ch);
}

/**
 * One-to-one character substitutions. Every entry maps an alternative
 * *encoding* of a Sorani letter to the canonical code point used by the
 * standard Central Kurdish keyboard.
 */
const CHAR_MAP: Record<string, string> = {
  'ي': 'ی', // ARABIC LETTER YEH              → FARSI YEH (Sorani ی)
  'ى': 'ی', // ARABIC LETTER ALEF MAKSURA     → ی
  'ې': 'ێ', // ARABIC LETTER E (Pashto/Uyghur ې) is sometimes used for ێ
  'ك': 'ک', // ARABIC LETTER KAF              → KEHEH (Sorani ک)
  'ڪ': 'ک', // ARABIC LETTER SWASH KAF        → ک
  'ھ': 'ه', // HEH DOACHASHMEE (ھ) is a common encoding of Sorani h
  'ہ': 'ه', // HEH GOAL (ہ, Urdu)              → ه
  'ة': 'ە', // TEH MARBUTA (ة) was historically used for the vowel ە
  'ۀ': 'ە', // HEH WITH YEH ABOVE (ۀ, Persian ezafe) → ە
  'أ': 'ا', // ALEF WITH HAMZA ABOVE (أ)      → ا
  'إ': 'ا', // ALEF WITH HAMZA BELOW (إ)      → ا
  'آ': 'ا', // ALEF WITH MADDA (آ)            → ا
  'ٱ': 'ا', // ALEF WASLA (ٱ)                 → ا
  'ئ': 'ئ', // YEH WITH HAMZA ABOVE is already ئ; listed for clarity
  'ۇ': 'ۆ', // U (ۇ) — Uyghur/Kazakh, visually confusable with ۆ
  'ڕ': 'ڕ', // canonical already
  'ڵ': 'ڵ', // canonical already
};

/**
 * Decomposed sequences (base letter + combining mark) that some fonts and
 * old input methods produce for the Sorani-specific letters.
 */
const SEQUENCE_MAP: Array<[RegExp, string]> = [
  [/رٚ/g, 'ڕ'], // ر + small V below
  [/ر̆/g, 'ڕ'], // ر + combining breve
  [/لٚ/g, 'ڵ'], // ل + small V above
  [/ل̆/g, 'ڵ'],
  [/وٚ/g, 'ۆ'], // و + small V
  [/یٚ/g, 'ێ'], // ی + small V
  [/يٚ/g, 'ێ'],
  [/فۛ/g, 'ڤ'], // ف + three dots above
];

/**
 * Invisible or decorative code points: ZWNJ/ZWJ, tatweel, bidi controls,
 * BOM, Arabic harakat (U+064B–U+065F, minus the Sorani-relevant U+065A that
 * has already been composed above), superscript alef.
 */
const STRIP_RE =
  /[​-‏‪-‮⁦-⁩؜﻿ـً-ٰٟۖ-ۭ]/g;

/** Normalize arbitrary user / dictionary text into canonical Sorani. */
export function normalizeKurdish(input: string): string {
  // NFKC folds Arabic presentation forms (ﻻ, ﺏ, …) into base letters.
  let s = input.normalize('NFKC');
  for (const [re, rep] of SEQUENCE_MAP) s = s.replace(re, rep);
  s = s.replace(STRIP_RE, '');
  let out = '';
  for (const ch of s) out += CHAR_MAP[ch] ?? ch;
  return out.normalize('NFC').trim();
}

const segmenter: Intl.Segmenter | null =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter('ckb', { granularity: 'grapheme' })
    : null;

/** Split a string into user-perceived characters (grapheme clusters). */
export function graphemes(input: string): string[] {
  if (segmenter) return Array.from(segmenter.segment(input), (s) => s.segment);
  return Array.from(input);
}

/** Number of user-perceived letters — use this instead of `.length`. */
export function letterCount(input: string): number {
  return graphemes(input).length;
}

/**
 * Normalize pasted / typed text and keep only Sorani letters.
 * Returns the list of letters in logical (reading) order.
 */
export function extractLetters(input: string): SoraniLetter[] {
  return graphemes(normalizeKurdish(input)).filter(isSoraniLetter);
}

/**
 * Physical-keyboard fallback for players without a Kurdish layout installed.
 * It mirrors the positions of the standard "Central Kurdish" Windows / macOS
 * keyboard, so muscle memory carries over.
 */
export const LATIN_TO_SORANI: Record<string, SoraniLetter> = {
  q: 'ق', w: 'و', e: 'ە', r: 'ر', t: 'ت', y: 'ی', u: 'ئ', i: 'ح', o: 'ۆ', p: 'پ',
  a: 'ا', s: 'س', d: 'د', f: 'ف', g: 'گ', h: 'ه', j: 'ژ', k: 'ک', l: 'ل',
  z: 'ز', x: 'خ', c: 'ج', v: 'ڤ', b: 'ب', n: 'ن', m: 'م',
  R: 'ڕ', Y: 'ێ', L: 'ڵ', I: 'ع', G: 'غ', C: 'چ', S: 'ش',
};
