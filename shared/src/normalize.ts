/**
 * Kurdish (Sorani, Arabic-script) text normalisation for comparing guesses.
 *
 * Only *encoding* variants of the same letter are unified. Distinct Kurdish
 * letters are never merged: ە≠ه, ێ≠ی, ۆ≠و, ڕ≠ر, ڵ≠ل, ڤ≠ف, ژ≠ز, گ≠ک, etc.
 *
 * Unified variants:
 *  - Presentation forms (U+FBxx/U+FExx) → base letters via NFKC.
 *  - Arabic Yeh ي (U+064A) and Alef Maksura ى (U+0649) → Kurdish Yeh ی (U+06CC).
 *  - Arabic Kaf ك (U+0643) → Keheh ک (U+06A9).
 *  - Heh Doachashmee ھ (U+06BE) → Heh ه (U+0647)  (keyboards differ on which they emit for "h").
 *  - Legacy ه + ZWNJ (the pre-Unicode way of writing ە) → Ae ە (U+06D5).
 *  - Teh Marbuta ة (U+0629) → ە: ة is not a Kurdish letter; Arabic keyboards emit it where ە is meant.
 *  - Precomposed vs. combining forms (e.g. ی + U+065A/U+065B → ێ, و + U+065A/U+065B → ۆ, ر + U+0695 forms,
 *    ل + U+0634 V-above → ڵ) via NFC plus explicit mapping.
 *  - Tatweel (ـ), Arabic diacritics (harakat), zero-width chars, and bidi marks are removed.
 *  - Case folding for any Latin characters; whitespace collapsed.
 */
const MAP: Record<string, string> = {
  'ي': 'ی', // ي → ی
  'ى': 'ی', // ى → ی
  'ك': 'ک', // ك → ک
  'ھ': 'ه', // ھ → ه
  'ة': 'ە', // ة → ە
};

export function normalizeKurdish(input: string, opts: { foldCase?: boolean } = {}): string {
  let s = input.normalize('NFKC');
  // legacy: heh + ZWNJ = ae
  s = s.replace(/ه‌/g, 'ە');
  // combining v-above / inverted-v marks on yeh / waw / lam / reh
  s = s
    .replace(/[يیى][ٚٛ̆]/g, 'ێ') // ێ
    .replace(/و[ٚٛ̆]/g, 'ۆ') // ۆ
    .replace(/ل[ٚٛ̆]/g, 'ڵ') // ڵ
    .replace(/ر[ٚٛ̆]/g, 'ڕ'); // ڕ
  s = s.replace(/[يىكھة]/g, (c) => MAP[c] ?? c);
  // remove tatweel, harakat & other Arabic marks, zero-width & bidi controls
  s = s.replace(/[ـً-ٰٟۖ-ۭ​-‏‪-‮⁦-⁩﻿]/g, '');
  if (opts.foldCase !== false) s = s.toLowerCase();
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** Normalised form with spaces removed, used for answer comparison. */
export function answerKey(input: string): string {
  return normalizeKurdish(input).replace(/[\s\-‐‑–—_.,!?؟،؛:'"]/g, '');
}

export function levenshtein(a: string, b: string): number {
  const A = [...a];
  const B = [...b];
  if (Math.abs(A.length - B.length) > 3) return 99;
  let prev = Array.from({ length: B.length + 1 }, (_, i) => i);
  for (let i = 1; i <= A.length; i++) {
    const cur = [i];
    for (let j = 1; j <= B.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (A[i - 1] === B[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[B.length];
}

export type GuessMatch = 'correct' | 'close' | 'wrong';

export function compareGuess(guess: string, answer: string): GuessMatch {
  const g = answerKey(guess);
  const a = answerKey(answer);
  if (!g) return 'wrong';
  if (g === a) return 'correct';
  const len = [...a].length;
  if (len < 3) return 'wrong';
  const d = levenshtein(g, a);
  const threshold = len >= 7 ? 2 : 1;
  return d <= threshold ? 'close' : 'wrong';
}
