import { DAILY_EPOCH, DAILY_TIME_ZONE } from '../data/daily';
import { DAILY_ERA_ENTRIES } from '../data/dictionary';
import type { DictionaryEntry } from '../data/schema';

const DAY_MS = 86_400_000;

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: DAILY_TIME_ZONE,
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  hourCycle: 'h23',
});

/** Wall-clock time in Asia/Baghdad (Kurdistan Region) for an instant. */
export function zonedParts(date: Date): ZonedParts {
  const p: Record<string, number> = {};
  for (const { type, value } of fmt.formatToParts(date)) {
    if (type !== 'literal') p[type] = Number(value);
  }
  return {
    year: p.year, month: p.month, day: p.day,
    hour: p.hour === 24 ? 0 : p.hour, minute: p.minute, second: p.second,
  };
}

/** Kurdistan calendar date as YYYY-MM-DD. */
export function kurdistanDateKey(date: Date = new Date()): string {
  const { year, month, day } = zonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function dayNumberFromKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS);
}

/**
 * Puzzle number for a given instant: 1 on DAILY_EPOCH, 2 the next day, …
 * Returns values < 1 before the epoch (the UI clamps to 1).
 */
export function dailyNumber(date: Date = new Date()): number {
  return dayNumberFromKey(kurdistanDateKey(date)) - dayNumberFromKey(DAILY_EPOCH) + 1;
}

export function dailyEntry(puzzleNumber: number): DictionaryEntry {
  const n = Math.max(1, puzzleNumber);
  const era = [...DAILY_ERA_ENTRIES].reverse().find((e) => e.fromPuzzle <= n);
  if (!era || era.entries.length === 0) throw new Error('Daily answer list is empty');
  return era.entries[(n - era.fromPuzzle) % era.entries.length];
}

/** Milliseconds until the next midnight in Asia/Baghdad. */
export function msUntilNextDaily(date: Date = new Date()): number {
  const { hour, minute, second } = zonedParts(date);
  const elapsed = ((hour * 60 + minute) * 60 + second) * 1000 + date.getMilliseconds();
  return Math.max(0, DAY_MS - elapsed);
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}
