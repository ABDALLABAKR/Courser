import type { Difficulty, RoomSettings } from '@wene/shared';
import type { Db } from '../db';
import { shuffle } from '../util';

export interface WordEntry {
  id: number | null; // null for custom words
  word: string;
  meaning: string;
  difficulty: Difficulty;
  category: string;
}

export interface WordSource {
  pick(count: number, settings: RoomSettings, exclude: Set<string>): WordEntry[];
}

/** Picks words from the database, honouring difficulty/category settings and the review policy. */
export class DbWordSource implements WordSource {
  private cache: { at: number; rows: WordEntry[] } | null = null;
  constructor(private db: Db, private includeUnreviewed: boolean) {}
  invalidate() { this.cache = null; }

  private all(): WordEntry[] {
    if (!this.cache || Date.now() - this.cache.at > 30_000) {
      this.cache = { at: Date.now(), rows: this.db.playableWords({ includeUnreviewed: this.includeUnreviewed }) };
    }
    return this.cache.rows;
  }

  pick(count: number, settings: RoomSettings, exclude: Set<string>): WordEntry[] {
    return pickWords(this.all(), count, settings, exclude);
  }
}

export function pickWords(dbWords: WordEntry[], count: number, settings: RoomSettings, exclude: Set<string>): WordEntry[] {
  const custom: WordEntry[] = settings.customWords.map((w) => ({ id: null, word: w, meaning: '', difficulty: 'medium', category: 'custom' }));
  let pool: WordEntry[] = settings.customOnly && custom.length >= count ? [] : dbWords.filter((w) =>
    (settings.categories.length === 0 || settings.categories.includes(w.category)));
  const byDiff = settings.difficulty === 'mixed' ? pool : pool.filter((w) => w.difficulty === settings.difficulty);
  if (byDiff.length >= count) pool = byDiff;
  pool = [...pool, ...custom];

  const fresh = pool.filter((w) => !exclude.has(w.word));
  const source = fresh.length >= count ? fresh : pool;
  const out: WordEntry[] = [];
  const seen = new Set<string>();
  // For mixed difficulty, try to offer one of each difficulty.
  if (settings.difficulty === 'mixed' && !settings.customOnly) {
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const c = shuffle(source.filter((w) => w.difficulty === d && !seen.has(w.word)))[0];
      if (c && out.length < count) { out.push(c); seen.add(c.word); }
    }
  }
  for (const w of shuffle(source)) {
    if (out.length >= count) break;
    if (!seen.has(w.word)) { out.push(w); seen.add(w.word); }
  }
  return out;
}
