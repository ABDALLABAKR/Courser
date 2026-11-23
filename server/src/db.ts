import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { answerKey, normalizeKurdish } from '@wene/shared';
import type { Difficulty } from '@wene/shared';
import { DEMO_CATEGORIES, DEMO_WORDS } from './data/demo-words';

export type WordStatus = 'pending' | 'approved' | 'rejected';
export type WordSource = 'demo' | 'admin' | 'import' | 'suggested';

export interface WordRow {
  id: number;
  word: string;
  meaning: string;
  difficulty: Difficulty;
  category: string;
  status: WordStatus;
  source: WordSource;
  notes: string;
  created_at: number;
  updated_at: number;
  times_chosen: number;
  times_guessed: number;
  times_played: number;
}

export interface CategoryRow { id: string; name_ckb: string; name_en: string; word_count?: number }

export interface ReportRow {
  id: number;
  room_code: string;
  reporter_name: string;
  reported_name: string;
  reason: string;
  context: string;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: number;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ckb TEXT NOT NULL,
  name_en TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word TEXT NOT NULL,
  word_key TEXT NOT NULL UNIQUE,
  meaning TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  source TEXT NOT NULL DEFAULT 'admin',
  notes TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  times_chosen INTEGER NOT NULL DEFAULT 0,
  times_guessed INTEGER NOT NULL DEFAULT 0,
  times_played INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS words_status ON words(status);
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  reporter_name TEXT NOT NULL,
  reported_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  context TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_code TEXT NOT NULL,
  is_public INTEGER NOT NULL,
  players INTEGER NOT NULL,
  rounds INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  completed INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS blocked_terms (
  term TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL);
`;

export class Db {
  readonly sql: DatabaseSync;
  constructor(path: string) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.sql = new DatabaseSync(path);
    this.sql.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    this.sql.exec(SCHEMA);
    this.seed();
  }

  private seed() {
    const seeded = this.sql.prepare(`SELECT v FROM meta WHERE k = 'demo_seeded'`).get();
    if (seeded) return;
    const insCat = this.sql.prepare(`INSERT OR IGNORE INTO categories (id, name_ckb, name_en) VALUES (?, ?, ?)`);
    for (const c of DEMO_CATEGORIES) insCat.run(c.id, c.ckb, c.en);
    for (const [word, meaning, difficulty, category] of DEMO_WORDS) {
      this.insertWord({ word, meaning, difficulty, category, status: 'pending', source: 'demo',
        notes: 'Demo list — awaiting native-speaker review' });
    }
    this.sql.prepare(`INSERT INTO meta (k, v) VALUES ('demo_seeded', '1')`).run();
  }

  close() { this.sql.close(); }

  // ---------- words ----------
  insertWord(w: { word: string; meaning: string; difficulty: Difficulty; category: string; status?: WordStatus; source?: WordSource; notes?: string }): { ok: true; id: number } | { ok: false; error: string } {
    const word = normalizeKurdish(w.word);
    const key = answerKey(word);
    if (!key) return { ok: false, error: 'empty' };
    const t = Date.now();
    try {
      const r = this.sql.prepare(`INSERT INTO words (word, word_key, meaning, difficulty, category, status, source, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(word, key, w.meaning.trim(), w.difficulty, w.category, w.status ?? 'pending', w.source ?? 'admin', w.notes ?? '', t, t);
      return { ok: true, id: Number(r.lastInsertRowid) };
    } catch (e) {
      if (String(e).includes('UNIQUE')) return { ok: false, error: 'duplicate' };
      throw e;
    }
  }

  updateWord(id: number, patch: Partial<Pick<WordRow, 'word' | 'meaning' | 'difficulty' | 'category' | 'status' | 'notes'>>) {
    const cur = this.getWord(id);
    if (!cur) return { ok: false as const, error: 'not_found' };
    const next = { ...cur, ...patch };
    next.word = normalizeKurdish(next.word);
    try {
      this.sql.prepare(`UPDATE words SET word=?, word_key=?, meaning=?, difficulty=?, category=?, status=?, notes=?, updated_at=? WHERE id=?`)
        .run(next.word, answerKey(next.word), next.meaning, next.difficulty, next.category, next.status, next.notes, Date.now(), id);
    } catch (e) {
      if (String(e).includes('UNIQUE')) return { ok: false as const, error: 'duplicate' };
      throw e;
    }
    return { ok: true as const };
  }

  getWord(id: number) { return this.sql.prepare(`SELECT * FROM words WHERE id = ?`).get(id) as WordRow | undefined; }
  deleteWord(id: number) { return this.sql.prepare(`DELETE FROM words WHERE id = ?`).run(id).changes > 0; }

  listWords(f: { status?: string; category?: string; q?: string; limit?: number; offset?: number } = {}) {
    const where: string[] = [];
    const args: (string | number)[] = [];
    if (f.status) { where.push('status = ?'); args.push(f.status); }
    if (f.category) { where.push('category = ?'); args.push(f.category); }
    if (f.q) { where.push('(word LIKE ? OR meaning LIKE ? OR word_key LIKE ?)'); args.push(`%${f.q}%`, `%${f.q}%`, `%${answerKey(f.q)}%`); }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (this.sql.prepare(`SELECT COUNT(*) AS n FROM words ${w}`).get(...args) as { n: number }).n;
    const rows = this.sql.prepare(`SELECT * FROM words ${w} ORDER BY id DESC LIMIT ? OFFSET ?`)
      .all(...args, f.limit ?? 100, f.offset ?? 0) as unknown as WordRow[];
    return { total, rows };
  }

  /** Words eligible for play. */
  playableWords(opts: { includeUnreviewed: boolean }) {
    const statuses = opts.includeUnreviewed ? `('approved','pending')` : `('approved')`;
    return this.sql.prepare(`SELECT id, word, meaning, difficulty, category FROM words WHERE status IN ${statuses}`).all() as unknown as Pick<WordRow, 'id' | 'word' | 'meaning' | 'difficulty' | 'category'>[];
  }

  recordWordPlayed(id: number, guessed: boolean) {
    this.sql.prepare(`UPDATE words SET times_played = times_played + 1, times_guessed = times_guessed + ? WHERE id = ?`).run(guessed ? 1 : 0, id);
  }
  recordWordChosen(id: number) { this.sql.prepare(`UPDATE words SET times_chosen = times_chosen + 1 WHERE id = ?`).run(id); }

  // ---------- categories ----------
  listCategories() {
    return this.sql.prepare(`SELECT c.id, c.name_ckb, c.name_en, (SELECT COUNT(*) FROM words w WHERE w.category = c.id) AS word_count FROM categories c ORDER BY c.rowid`).all() as unknown as CategoryRow[];
  }
  upsertCategory(c: CategoryRow) {
    this.sql.prepare(`INSERT INTO categories (id, name_ckb, name_en) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET name_ckb = excluded.name_ckb, name_en = excluded.name_en`).run(c.id, c.name_ckb, c.name_en);
  }
  deleteCategory(id: string) {
    const n = (this.sql.prepare(`SELECT COUNT(*) AS n FROM words WHERE category = ?`).get(id) as { n: number }).n;
    if (n > 0) return { ok: false as const, error: 'in_use' };
    this.sql.prepare(`DELETE FROM categories WHERE id = ?`).run(id);
    return { ok: true as const };
  }
  categoryExists(id: string) { return !!this.sql.prepare(`SELECT 1 FROM categories WHERE id = ?`).get(id); }

  // ---------- reports ----------
  addReport(r: Omit<ReportRow, 'id' | 'status' | 'created_at'>) {
    this.sql.prepare(`INSERT INTO reports (room_code, reporter_name, reported_name, reason, context, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(r.room_code, r.reporter_name, r.reported_name, r.reason, r.context, Date.now());
  }
  listReports(status?: string) {
    return (status
      ? this.sql.prepare(`SELECT * FROM reports WHERE status = ? ORDER BY id DESC LIMIT 200`).all(status)
      : this.sql.prepare(`SELECT * FROM reports ORDER BY id DESC LIMIT 200`).all()) as unknown as ReportRow[];
  }
  setReportStatus(id: number, status: ReportRow['status']) {
    return this.sql.prepare(`UPDATE reports SET status = ? WHERE id = ?`).run(status, id).changes > 0;
  }

  // ---------- games ----------
  gameStarted(code: string, isPublic: boolean, players: number, rounds: number) {
    return Number(this.sql.prepare(`INSERT INTO games (room_code, is_public, players, rounds, started_at) VALUES (?, ?, ?, ?, ?)`)
      .run(code, isPublic ? 1 : 0, players, rounds, Date.now()).lastInsertRowid);
  }
  gameEnded(id: number, completed: boolean) {
    this.sql.prepare(`UPDATE games SET ended_at = ?, completed = ? WHERE id = ?`).run(Date.now(), completed ? 1 : 0, id);
  }

  stats() {
    const one = (q: string) => (this.sql.prepare(q).get() as { n: number | null }).n ?? 0;
    const dayAgo = Date.now() - 86_400_000;
    return {
      gamesTotal: one(`SELECT COUNT(*) AS n FROM games`),
      gamesCompleted: one(`SELECT COUNT(*) AS n FROM games WHERE completed = 1`),
      games24h: one(`SELECT COUNT(*) AS n FROM games WHERE started_at > ${dayAgo}`),
      avgPlayers: Math.round(10 * one(`SELECT AVG(players) AS n FROM games`)) / 10,
      wordsTotal: one(`SELECT COUNT(*) AS n FROM words`),
      wordsApproved: one(`SELECT COUNT(*) AS n FROM words WHERE status = 'approved'`),
      wordsPending: one(`SELECT COUNT(*) AS n FROM words WHERE status = 'pending'`),
      wordsRejected: one(`SELECT COUNT(*) AS n FROM words WHERE status = 'rejected'`),
      reportsOpen: one(`SELECT COUNT(*) AS n FROM reports WHERE status = 'open'`),
      turnsPlayed: one(`SELECT SUM(times_played) AS n FROM words`),
      turnsGuessed: one(`SELECT SUM(times_guessed) AS n FROM words`),
      topWords: this.sql.prepare(`SELECT word, meaning, times_played, times_guessed FROM words WHERE times_played > 0 ORDER BY times_played DESC LIMIT 10`).all(),
      hardestWords: this.sql.prepare(`SELECT word, meaning, times_played, times_guessed FROM words WHERE times_played >= 3 ORDER BY (1.0 * times_guessed / times_played) ASC LIMIT 10`).all(),
    };
  }

  // ---------- blocked terms ----------
  listBlockedTerms() { return (this.sql.prepare(`SELECT term FROM blocked_terms ORDER BY term`).all() as { term: string }[]).map((r) => r.term); }
  addBlockedTerm(term: string) { this.sql.prepare(`INSERT OR IGNORE INTO blocked_terms (term, created_at) VALUES (?, ?)`).run(normalizeKurdish(term), Date.now()); }
  removeBlockedTerm(term: string) { this.sql.prepare(`DELETE FROM blocked_terms WHERE term = ?`).run(term); }
}
