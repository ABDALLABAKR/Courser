import express, { type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import type { Db } from '../db';
import type { AppConfig } from '../config';
import type { RoomManager } from '../game/RoomManager';
import type { DbWordSource } from '../game/words';
import type { Moderation } from '../moderation';
import { KeyedLimiter } from '../rateLimit';
import { signAdminToken, verifyAdminToken, verifyPassword } from './auth';
import { parseCsv } from './csv';

const COOKIE = 'wene_admin';

function readCookie(req: Request, name: string) {
  const raw = req.headers.cookie ?? '';
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

const wordSchema = z.object({
  word: z.string().trim().min(1).max(32),
  meaning: z.string().trim().max(120).default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().trim().min(1).max(32),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  notes: z.string().max(300).optional(),
});

export function adminRouter(deps: { db: Db; config: AppConfig; manager: RoomManager; words: DbWordSource; moderation: Moderation }) {
  const { db, config, manager, words, moderation } = deps;
  const r = express.Router();
  r.use(express.json({ limit: '2mb' }));
  const loginLimiter = new KeyedLimiter(5, 1 / 60); // 5 attempts, then 1/minute per IP

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!verifyAdminToken(config.sessionSecret, readCookie(req, COOKIE))) return res.status(401).json({ error: 'unauthorized' });
    // CSRF: state-changing requests must come from our own origin via fetch with a custom header.
    if (req.method !== 'GET' && req.get('x-requested-with') !== 'wene-admin') return res.status(403).json({ error: 'csrf' });
    next();
  };

  r.get('/me', (req, res) => {
    res.json({ authenticated: verifyAdminToken(config.sessionSecret, readCookie(req, COOKIE)), configured: !!config.adminPasswordHash });
  });

  r.post('/login', async (req, res) => {
    if (!config.adminPasswordHash) return res.status(503).json({ error: 'admin_not_configured' });
    if (!loginLimiter.take(req.ip ?? 'x')) return res.status(429).json({ error: 'rate_limited' });
    const pw = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!pw || !(await verifyPassword(pw, config.adminPasswordHash))) return res.status(401).json({ error: 'bad_password' });
    const secure = config.isProduction ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${COOKIE}=${signAdminToken(config.sessionSecret)}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=43200${secure}`);
    res.json({ ok: true });
  });

  r.post('/logout', (_req, res) => {
    res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=0`);
    res.json({ ok: true });
  });

  r.use(requireAdmin);

  r.get('/stats', (_req, res) => res.json({ ...db.stats(), live: manager.stats(), allowUnreviewedWords: config.allowUnreviewedWords }));

  r.get('/words', (req, res) => {
    const q = req.query as Record<string, string | undefined>;
    res.json(db.listWords({ status: q.status || undefined, category: q.category || undefined, q: q.q || undefined,
      limit: Math.min(500, Number(q.limit) || 100), offset: Number(q.offset) || 0 }));
  });

  r.post('/words', (req, res) => {
    const p = wordSchema.safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'invalid' });
    if (!db.categoryExists(p.data.category)) return res.status(400).json({ error: 'unknown_category' });
    const out = db.insertWord({ ...p.data, status: p.data.status ?? 'pending', source: 'admin' });
    words.invalidate();
    if (!out.ok) return res.status(409).json(out);
    res.json(out);
  });

  r.patch('/words/:id', (req, res) => {
    const p = wordSchema.partial().safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'invalid' });
    if (p.data.category && !db.categoryExists(p.data.category)) return res.status(400).json({ error: 'unknown_category' });
    const out = db.updateWord(Number(req.params.id), p.data);
    words.invalidate();
    if (!out.ok) return res.status(out.error === 'not_found' ? 404 : 409).json(out);
    res.json(out);
  });

  r.post('/words/bulk-status', (req, res) => {
    const p = z.object({ ids: z.array(z.number().int()).max(1000), status: z.enum(['pending', 'approved', 'rejected']) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'invalid' });
    for (const id of p.data.ids) db.updateWord(id, { status: p.data.status });
    words.invalidate();
    res.json({ ok: true, count: p.data.ids.length });
  });

  r.delete('/words/:id', (req, res) => {
    const ok = db.deleteWord(Number(req.params.id));
    words.invalidate();
    res.status(ok ? 200 : 404).json({ ok });
  });

  /** CSV columns: word,meaning,difficulty,category[,status]. A header row is optional. */
  r.post('/words/import', express.text({ type: '*/*', limit: '2mb' }), (req, res) => {
    const text = typeof req.body === 'string' ? req.body : '';
    const rows = parseCsv(text);
    let added = 0;
    const errors: { line: number; error: string }[] = [];
    rows.forEach((cols, i) => {
      if (i === 0 && cols[0]?.toLowerCase() === 'word') return;
      if (cols.every((c) => !c.trim())) return;
      const [word, meaning = '', difficulty = 'medium', category = 'objects', status] = cols.map((c) => c.trim());
      const p = wordSchema.safeParse({ word, meaning, difficulty: difficulty.toLowerCase(), category, status: status ? status.toLowerCase() : undefined });
      if (!p.success) return errors.push({ line: i + 1, error: 'invalid' });
      if (!db.categoryExists(p.data.category)) return errors.push({ line: i + 1, error: 'unknown_category' });
      const out = db.insertWord({ ...p.data, status: p.data.status ?? 'pending', source: 'import' });
      if (out.ok) added++; else errors.push({ line: i + 1, error: out.error });
    });
    words.invalidate();
    res.json({ ok: true, added, errors: errors.slice(0, 100), errorCount: errors.length });
  });

  r.get('/words/export', (_req, res) => {
    const { rows } = db.listWords({ limit: 100000 });
    const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
    const csv = ['word,meaning,difficulty,category,status', ...rows.map((w) => [w.word, w.meaning, w.difficulty, w.category, w.status].map(esc).join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="wene-words.csv"');
    res.send('﻿' + csv);
  });

  r.get('/categories', (_req, res) => res.json(db.listCategories()));
  r.put('/categories/:id', (req, res) => {
    const id = String(req.params.id);
    const p = z.object({ name_ckb: z.string().trim().min(1).max(40), name_en: z.string().trim().min(1).max(40) }).safeParse(req.body);
    if (!/^[a-z0-9-]{2,32}$/.test(id) || !p.success) return res.status(400).json({ error: 'invalid' });
    db.upsertCategory({ id, ...p.data });
    res.json({ ok: true });
  });
  r.delete('/categories/:id', (req, res) => {
    const out = db.deleteCategory(String(req.params.id));
    res.status(out.ok ? 200 : 409).json(out);
  });

  r.get('/reports', (req, res) => res.json(db.listReports(typeof req.query.status === 'string' ? req.query.status : undefined)));
  r.patch('/reports/:id', (req, res) => {
    const p = z.object({ status: z.enum(['open', 'resolved', 'dismissed']) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'invalid' });
    res.json({ ok: db.setReportStatus(Number(req.params.id), p.data.status) });
  });

  r.get('/blocked-terms', (_req, res) => res.json(db.listBlockedTerms()));
  r.post('/blocked-terms', (req, res) => {
    const term = typeof req.body?.term === 'string' ? req.body.term.trim() : '';
    if (!term || term.length > 40) return res.status(400).json({ error: 'invalid' });
    db.addBlockedTerm(term);
    moderation.reload();
    res.json({ ok: true });
  });
  r.delete('/blocked-terms/:term', (req, res) => {
    db.removeBlockedTerm(String(req.params.term));
    moderation.reload();
    res.json({ ok: true });
  });

  return r;
}
