import express from 'express';
import { createServer, type Server as HttpServer } from 'node:http';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { Server } from 'socket.io';
import { z } from 'zod';
import type { ClientToServer, ServerToClient } from '@wene/shared';
import type { AppConfig } from './config';
import { Db } from './db';
import { RoomManager } from './game/RoomManager';
import { DbWordSource } from './game/words';
import { Moderation } from './moderation';
import { attachSocketHandlers } from './socket';
import { adminRouter } from './admin/router';
import { KeyedLimiter } from './rateLimit';

export interface App {
  http: HttpServer;
  io: Server<ClientToServer, ServerToClient>;
  manager: RoomManager;
  db: Db;
  listen(port?: number): Promise<number>;
  close(): Promise<void>;
}

export function createApp(config: AppConfig): App {
  const db = new Db(config.dbPath);
  const moderation = new Moderation(() => db.listBlockedTerms());
  const words = new DbWordSource(db, config.allowUnreviewedWords);
  const gameIds = new Map<string, number>();

  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none'; base-uri 'self'");
    next();
  });
  if (config.corsOrigins !== '*' && config.corsOrigins.length) {
    const allowed = new Set(config.corsOrigins);
    app.use('/api', (req, res, next) => {
      const o = req.get('origin');
      if (o && allowed.has(o)) {
        res.setHeader('Access-Control-Allow-Origin', o);
        res.setHeader('Vary', 'Origin');
      }
      if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Headers', 'content-type'); return res.sendStatus(204); }
      next();
    });
  }

  const http = createServer(app);
  const io = new Server<ClientToServer, ServerToClient>(http, {
    cors: { origin: config.corsOrigins === '*' ? true : config.corsOrigins, credentials: false },
    maxHttpBufferSize: 64 * 1024,
    pingInterval: 20_000,
    pingTimeout: 20_000,
    connectionStateRecovery: undefined,
  });

  const manager = new RoomManager(config.timing, {
    emit: (socketId, event, ...args) => { io.to(socketId).emit(event, ...(args as any)); },
    words,
    onGameStart: (room) => gameIds.set(room.code, db.gameStarted(room.code, room.isPublic, room.connectedPlayers.length, room.settings.rounds)),
    onGameEnd: (room, completed) => {
      const id = gameIds.get(room.code);
      if (id) db.gameEnded(id, completed);
      gameIds.delete(room.code);
    },
    onWordChosen: (w) => { if (w.id) db.recordWordChosen(w.id); },
    onTurnEnd: (w, guessed) => { if (w.id) db.recordWordPlayed(w.id, guessed); },
  });

  attachSocketHandlers(io as any, { manager, moderation, db, trustProxy: config.trustProxy });

  // ---------- public API ----------
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.get('/api/categories', (_req, res) => res.json(db.listCategories().map(({ id, name_ckb, name_en }) => ({ id, name_ckb, name_en }))));
  app.get('/api/online', (_req, res) => res.json({ online: io.engine.clientsCount, ...manager.stats() }));
  const suggestLimiter = new KeyedLimiter(5, 1 / 120);
  app.post('/api/suggest', express.json({ limit: '4kb' }), (req, res) => {
    if (!suggestLimiter.take(req.ip ?? 'x')) return res.status(429).json({ error: 'rate_limited' });
    const p = z.object({
      word: z.string().trim().min(1).max(32),
      meaning: z.string().trim().max(120).default(''),
      category: z.string().max(32),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    }).safeParse(req.body);
    if (!p.success || !db.categoryExists(p.data.category)) return res.status(400).json({ error: 'invalid' });
    if (moderation.containsBlocked(p.data.word)) return res.status(400).json({ error: 'invalid' });
    const out = db.insertWord({ ...p.data, status: 'pending', source: 'suggested', notes: 'Suggested by a player' });
    res.status(out.ok ? 200 : 409).json(out.ok ? { ok: true } : out);
  });
  app.use('/api/admin', adminRouter({ db, config, manager, words, moderation }));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }));

  // ---------- static client ----------
  if (config.serveClient) {
    const dist = resolve(config.serveClient);
    if (existsSync(join(dist, 'index.html'))) {
      app.use(express.static(dist, { index: false, maxAge: '7d', setHeaders: (res, path) => {
        if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
      } }));
      app.get(/^(?!\/(api|socket\.io)\/).*/, (_req, res) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(join(dist, 'index.html'));
      });
    }
  }

  return {
    http, io, manager, db,
    listen(port = config.port) {
      return new Promise((ok) => http.listen(port, config.host, () => {
        const a = http.address();
        ok(typeof a === 'object' && a ? a.port : port);
      }));
    },
    async close() {
      manager.close();
      await new Promise<void>((ok) => io.close(() => ok()));
      db.close();
    },
  };
}
