import { MAX_GUESSES } from '../data/dictionary';

export interface ModeStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** distribution[i] = wins in i+1 guesses. */
  distribution: number[];
}

export interface DailyHistoryItem {
  puzzle: number;
  date: string;
  won: boolean;
  guesses: number;
}

export interface DailyStats extends ModeStats {
  /** Last daily puzzle number that was completed (won or lost). */
  lastPuzzle: number | null;
  /** Last daily puzzle number that was won. */
  lastWon: number | null;
  history: DailyHistoryItem[];
}

export interface Stats {
  daily: DailyStats;
  unlimited: ModeStats;
}

const emptyMode = (): ModeStats => ({
  played: 0, wins: 0, currentStreak: 0, maxStreak: 0,
  distribution: new Array(MAX_GUESSES).fill(0),
});

export const emptyStats = (): Stats => ({
  daily: { ...emptyMode(), lastPuzzle: null, lastWon: null, history: [] },
  unlimited: emptyMode(),
});

function bump(dist: number[], guesses: number): number[] {
  const d = [...dist];
  d[guesses - 1] = (d[guesses - 1] ?? 0) + 1;
  return d;
}

/**
 * Record a finished daily puzzle. Idempotent: recording the same puzzle
 * twice (e.g. after a reload) changes nothing.
 */
export function recordDaily(
  stats: Stats,
  puzzle: number,
  date: string,
  won: boolean,
  guesses: number,
): Stats {
  const d = stats.daily;
  if (d.history.some((h) => h.puzzle === puzzle)) return stats;
  const currentStreak = won ? (d.lastWon === puzzle - 1 ? d.currentStreak + 1 : 1) : 0;
  return {
    ...stats,
    daily: {
      played: d.played + 1,
      wins: d.wins + (won ? 1 : 0),
      currentStreak,
      maxStreak: Math.max(d.maxStreak, currentStreak),
      distribution: won ? bump(d.distribution, guesses) : d.distribution,
      lastPuzzle: puzzle,
      lastWon: won ? puzzle : d.lastWon,
      history: [{ puzzle, date, won, guesses }, ...d.history].slice(0, 400),
    },
  };
}

export function recordUnlimited(stats: Stats, won: boolean, guesses: number): Stats {
  const u = stats.unlimited;
  const currentStreak = won ? u.currentStreak + 1 : 0;
  return {
    ...stats,
    unlimited: {
      played: u.played + 1,
      wins: u.wins + (won ? 1 : 0),
      currentStreak,
      maxStreak: Math.max(u.maxStreak, currentStreak),
      distribution: won ? bump(u.distribution, guesses) : u.distribution,
    },
  };
}

/**
 * The stored streak only becomes stale when the player skips a day, so the
 * displayed streak must be checked against today's puzzle number.
 */
export function effectiveDailyStreak(d: DailyStats, todayPuzzle: number): number {
  if (d.lastWon === null) return 0;
  return d.lastWon >= todayPuzzle - 1 ? d.currentStreak : 0;
}

export function winRate(s: ModeStats): number {
  return s.played === 0 ? 0 : Math.round((s.wins / s.played) * 100);
}

/** Merge whatever was stored with the current shape (forward compatible). */
export function hydrateStats(raw: unknown): Stats {
  const base = emptyStats();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Stats>;
  const fixDist = (x?: number[]) =>
    Array.from({ length: MAX_GUESSES }, (_, i) => (Array.isArray(x) && Number(x[i])) || 0);
  return {
    daily: {
      ...base.daily,
      ...(r.daily ?? {}),
      distribution: fixDist(r.daily?.distribution),
      history: Array.isArray(r.daily?.history) ? r.daily!.history : [],
    },
    unlimited: {
      ...base.unlimited,
      ...(r.unlimited ?? {}),
      distribution: fixDist(r.unlimited?.distribution),
    },
  };
}
