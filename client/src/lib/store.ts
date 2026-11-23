import { useSyncExternalStore, useRef } from 'react';

export interface Store<T> {
  get(): T;
  set(patch: Partial<T> | ((s: T) => Partial<T>)): void;
  subscribe(fn: () => void): () => void;
}

export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const subs = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      const p = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...p };
      subs.forEach((f) => f());
    },
    subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
  };
}

/** Subscribe to a slice of a store. Selector results are compared shallowly by identity. */
export function useStore<T extends object, S>(store: Store<T>, sel: (s: T) => S): S {
  const last = useRef<{ s: T; v: S } | null>(null);
  return useSyncExternalStore(store.subscribe, () => {
    const s = store.get();
    if (last.current && last.current.s === s) return last.current.v;
    const v = sel(s);
    if (last.current && Object.is(last.current.v, v)) { last.current = { s, v: last.current.v }; return last.current.v; }
    last.current = { s, v };
    return v;
  });
}

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch { return fallback; }
  },
  set(key: string, v: unknown) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ }
  },
  del(key: string) { try { localStorage.removeItem(key); } catch { /* ignore */ } },
};
