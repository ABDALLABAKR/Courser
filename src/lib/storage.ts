/**
 * Tiny, failure-proof LocalStorage wrapper. Private browsing, full quotas or
 * disabled storage must never crash the game.
 */
const PREFIX = 'wusha:v1:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function clearAll(keep: string[] = []): void {
  const kept = new Set(keep.map((k) => PREFIX + k));
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && !kept.has(k))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
