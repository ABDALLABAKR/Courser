export interface Timing {
  chooseMs: number;
  turnEndMs: number;
  /** If set, overrides the room's drawTime (used by tests). */
  drawMsOverride?: number;
  disconnectGraceMs: number;
  artistGraceMs: number;
  notEnoughPlayersMs: number;
  publicAutoStartMs: number;
  emptyRoomTtlMs: number;
  idleRoomTtlMs: number;
}

export interface AppConfig {
  port: number;
  host: string;
  isProduction: boolean;
  corsOrigins: string[] | '*';
  dbPath: string;
  adminPasswordHash: string | null;
  sessionSecret: string;
  /** Allow words that have not been approved by an admin (demo list). Never enable for a real launch. */
  allowUnreviewedWords: boolean;
  serveClient: string | null;
  trustProxy: boolean;
  timing: Timing;
}

export const defaultTiming: Timing = {
  chooseMs: 15_000,
  turnEndMs: 7_000,
  disconnectGraceMs: 60_000,
  artistGraceMs: 10_000,
  notEnoughPlayersMs: 15_000,
  publicAutoStartMs: 15_000,
  emptyRoomTtlMs: 2 * 60_000,
  idleRoomTtlMs: 30 * 60_000,
};

function bool(v: string | undefined, dflt: boolean) {
  if (v === undefined || v === '') return dflt;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

export function loadConfig(env = process.env): AppConfig {
  const isProduction = env.NODE_ENV === 'production';
  const secret = env.SESSION_SECRET ?? '';
  if (isProduction && secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 random characters in production.');
  }
  const origins = (env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return {
    port: Number(env.PORT ?? 3001),
    host: env.HOST ?? '0.0.0.0',
    isProduction,
    corsOrigins: origins.length ? origins : isProduction ? [] : '*',
    dbPath: env.DATABASE_PATH ?? './data/wene.sqlite',
    adminPasswordHash: env.ADMIN_PASSWORD_HASH || null,
    sessionSecret: secret || 'dev-only-insecure-secret-change-me-please-0000',
    allowUnreviewedWords: bool(env.ALLOW_UNREVIEWED_WORDS, !isProduction),
    serveClient: env.SERVE_CLIENT === 'false' ? null : env.CLIENT_DIST ?? '../client/dist',
    trustProxy: bool(env.TRUST_PROXY, false),
    timing: defaultTiming,
  };
}
