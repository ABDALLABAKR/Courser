import { graphemes, normalizeKurdish } from '../game/kurdish';

/**
 * Validation status of a dictionary entry.
 *
 *  - `verified`   — checked by a native Sorani speaker / against a published
 *                   dictionary (e.g. Hejar's Hanbane Borîne, Kurdistanica,
 *                   Wikiferheng) and approved for use as a daily answer.
 *  - `unreviewed` — believed correct but NOT yet checked by a reviewer.
 *                   Allowed as a guess; allowed as an answer only while the
 *                   dictionary runs in `demo` mode.
 *  - `rejected`   — kept for history so the word is never re-added by mistake.
 *                   Never accepted as a guess or answer.
 */
export type ValidationStatus = 'verified' | 'unreviewed' | 'rejected';

export type WordCategory =
  | 'nature' | 'time' | 'animal' | 'food' | 'home' | 'body' | 'people'
  | 'place' | 'culture' | 'abstract' | 'adjective' | 'verb' | 'number' | 'other';

/** What a contributor writes in the data files. */
export interface RawEntry {
  /** The Kurdish word exactly as it should be displayed. */
  word: string;
  /** Short Kurdish (Sorani) definition, shown after the round. */
  definition?: string;
  category?: WordCategory;
  status: ValidationStatus;
  /** English gloss for maintainers/reviewers — never shown to players. */
  gloss?: string;
}

/** What the game uses at runtime. Derived fields are computed, never typed. */
export interface DictionaryEntry extends RawEntry {
  normalized: string;
  letters: string[];
  length: number;
}

export function buildEntry(raw: RawEntry): DictionaryEntry {
  const normalized = normalizeKurdish(raw.word);
  const letters = graphemes(normalized);
  return { ...raw, normalized, letters, length: letters.length };
}

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  nature: 'سروشت',
  time: 'کات',
  animal: 'گیانلەبەر',
  food: 'خواردن',
  home: 'ماڵ و کەلوپەل',
  body: 'جەستە',
  people: 'مرۆڤ',
  place: 'شوێن',
  culture: 'کولتوور',
  abstract: 'واتایی',
  adjective: 'ئاوەڵناو',
  verb: 'چاوگ',
  number: 'ژمارە',
  other: 'گشتی',
};
