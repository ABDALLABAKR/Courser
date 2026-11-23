import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addLetter, addText, isValidSavedGame, newGame, removeLetter, revealHint, submitGuess,
  type GameMode, type GameState, type SubmitError,
} from '../game/engine';
import { dailyEntry, dailyNumber, kurdistanDateKey } from '../game/daily';
import { ANSWERS } from '../data/dictionary';
import { mergeKeyStates, type LetterState } from '../game/evaluate';
import { emptyStats, hydrateStats, recordDaily, recordUnlimited, type Stats } from '../game/stats';
import { newlyUnlocked, type Achievement } from '../game/achievements';
import { load, save } from '../lib/storage';

const RECENT_LIMIT = 40;

function todaysDaily(): GameState {
  const n = Math.max(1, dailyNumber());
  return newGame('daily', n, dailyEntry(n).normalized);
}

function restoreDaily(): GameState {
  const saved = load<unknown>('daily', null);
  const today = Math.max(1, dailyNumber());
  if (isValidSavedGame(saved) && saved.mode === 'daily' && saved.puzzleNumber === today) {
    // A finished game is always kept (no replaying the daily challenge).
    // An unfinished one is kept unless the word list changed under it.
    if (saved.status !== 'playing' || saved.answer === dailyEntry(today).normalized) return saved;
  }
  return todaysDaily();
}

function pickUnlimitedAnswer(exclude: readonly string[]): string {
  const blocked = new Set(exclude);
  const pool = ANSWERS.filter((e) => !blocked.has(e.normalized));
  const list = pool.length > 0 ? pool : ANSWERS;
  return list[Math.floor(Math.random() * list.length)].normalized;
}

function restoreUnlimited(dailyAnswer: string): GameState {
  const saved = load<unknown>('unlimited', null);
  if (isValidSavedGame(saved) && saved.mode === 'unlimited') return saved;
  const recent = load<string[]>('recent', []);
  return newGame('unlimited', 1, pickUnlimitedAnswer([...recent, dailyAnswer]));
}

/** Archive games keyed by puzzle number. They never affect statistics. */
type ArchiveGames = Record<number, GameState>;

function restoreArchive(): ArchiveGames {
  const raw = load<Record<string, unknown>>('archive', {});
  const out: ArchiveGames = {};
  for (const [k, g] of Object.entries(raw ?? {})) {
    const n = Number(k);
    if (isValidSavedGame(g) && g.mode === 'archive' && g.answer === dailyEntry(n).normalized) out[n] = g;
  }
  return out;
}

export interface RevealInfo {
  mode: GameMode;
  row: number;
}

export interface SubmitOutcome {
  error?: SubmitError;
  letter?: string;
  position?: number;
  finished?: boolean;
  unlocked?: Achievement[];
}

export function useGameStore(revealMs: number, hardMode: boolean) {
  const [mode, setModeState] = useState<GameMode>(() => {
    const m = load<GameMode>('mode', 'daily');
    return m === 'archive' && load<number | null>('archiveCurrent', null) === null ? 'daily' : m;
  });
  const [daily, setDaily] = useState<GameState>(restoreDaily);
  const [unlimited, setUnlimited] = useState<GameState>(() => restoreUnlimited(daily.answer));
  const [archiveGames, setArchiveGames] = useState<ArchiveGames>(restoreArchive);
  const [archiveCurrent, setArchiveCurrent] = useState<number | null>(() => {
    const n = load<number | null>('archiveCurrent', null);
    return n !== null && n >= 1 && n < Math.max(1, dailyNumber()) ? n : null;
  });
  const [stats, setStats] = useState<Stats>(() => hydrateStats(load('stats', emptyStats())));
  const [unlocked, setUnlocked] = useState<string[]>(() => load<string[]>('achievements', []));
  const [reveal, setReveal] = useState<RevealInfo | null>(null);
  const revealTimer = useRef<number | undefined>(undefined);

  const effectiveMode: GameMode = mode === 'archive' && archiveCurrent === null ? 'daily' : mode;
  const archive: GameState | null =
    archiveCurrent === null
      ? null
      : archiveGames[archiveCurrent] ?? newGame('archive', archiveCurrent, dailyEntry(archiveCurrent).normalized);

  const game = effectiveMode === 'daily' ? daily : effectiveMode === 'unlimited' ? unlimited : archive!;

  const setGame = useCallback(
    (update: (g: GameState) => GameState) => {
      if (effectiveMode === 'daily') setDaily(update);
      else if (effectiveMode === 'unlimited') setUnlimited(update);
      else if (archiveCurrent !== null) {
        const n = archiveCurrent;
        setArchiveGames((all) => {
          const current = all[n] ?? newGame('archive', n, dailyEntry(n).normalized);
          const next = update(current);
          return next === current ? all : { ...all, [n]: next };
        });
      }
    },
    [effectiveMode, archiveCurrent],
  );

  // Persistence
  useEffect(() => save('daily', daily), [daily]);
  useEffect(() => save('unlimited', unlimited), [unlimited]);
  useEffect(() => save('archive', archiveGames), [archiveGames]);
  useEffect(() => save('archiveCurrent', archiveCurrent), [archiveCurrent]);
  useEffect(() => save('stats', stats), [stats]);
  useEffect(() => save('achievements', unlocked), [unlocked]);
  useEffect(() => save('mode', effectiveMode), [effectiveMode]);

  // Daily rollover at midnight Asia/Baghdad (also when the tab wakes up).
  useEffect(() => {
    const check = () => {
      const today = Math.max(1, dailyNumber());
      setDaily((d) => (d.puzzleNumber !== today ? todaysDaily() : d));
    };
    const id = window.setInterval(check, 15_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  useEffect(() => () => window.clearTimeout(revealTimer.current), []);

  const revealing = reveal !== null;

  // State updates are functional so bursts of keystrokes that arrive before
  // React re-renders are never lost. The boolean return value is only a hint
  // for sound effects.
  const type = useCallback(
    (letter: string): boolean => {
      if (revealing) return false;
      setGame((g) => addLetter(g, letter));
      return addLetter(game, letter) !== game;
    },
    [revealing, game, setGame],
  );

  const paste = useCallback(
    (text: string) => {
      if (!revealing) setGame((g) => addText(g, text));
    },
    [revealing, setGame],
  );

  const backspace = useCallback((): boolean => {
    if (revealing) return false;
    setGame((g) => removeLetter(g));
    return game.current.length > 0 && game.status === 'playing';
  }, [revealing, game, setGame]);

  const submit = useCallback((): SubmitOutcome => {
    if (revealing) return {};
    const res = submitGuess(game, { hard: hardMode });
    if (!res.ok) return { error: res.error, letter: res.letter, position: res.position };

    const next = res.state;
    setGame(() => next);
    setReveal({ mode: effectiveMode, row: next.guesses.length - 1 });
    window.clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => setReveal(null), revealMs);

    if (next.status === 'playing') return {};
    if (effectiveMode === 'archive') return { finished: true, unlocked: [] };

    const won = next.status === 'won';
    const newStats =
      effectiveMode === 'daily'
        ? recordDaily(stats, next.puzzleNumber, kurdistanDateKey(), won, next.guesses.length)
        : recordUnlimited(stats, won, next.guesses.length);
    setStats(newStats);
    if (effectiveMode === 'unlimited') {
      const recent = load<string[]>('recent', []);
      save('recent', [next.answer, ...recent.filter((w) => w !== next.answer)].slice(0, RECENT_LIMIT));
    }
    const fresh = newlyUnlocked(newStats, next, unlocked);
    if (fresh.length) setUnlocked((u) => [...u, ...fresh.map((a) => a.id)]);
    return { finished: true, unlocked: fresh };
  }, [revealing, game, hardMode, setGame, effectiveMode, revealMs, stats, unlocked]);

  /** Unlimited mode only: reveal one letter. Returns the revealed position. */
  const hint = useCallback((): number | null => {
    if (effectiveMode !== 'unlimited' || revealing) return null;
    const next = revealHint(unlimited);
    if (next === unlimited) return null;
    setUnlimited(next);
    return next.hints![next.hints!.length - 1];
  }, [effectiveMode, revealing, unlimited]);

  /** Start another unlimited round. Abandoning a round counts as a loss. */
  const newUnlimitedRound = useCallback(() => {
    const u = unlimited;
    if (u.status === 'playing' && u.guesses.length > 0) {
      setStats((st) => recordUnlimited(st, false, u.guesses.length));
    }
    const recent = load<string[]>('recent', []);
    setUnlimited(
      newGame('unlimited', u.puzzleNumber + 1, pickUnlimitedAnswer([...recent, u.answer, daily.answer])),
    );
    window.clearTimeout(revealTimer.current);
    setReveal(null);
  }, [unlimited, daily.answer]);

  const setMode = useCallback((m: GameMode) => {
    window.clearTimeout(revealTimer.current);
    setReveal(null);
    setModeState(m);
  }, []);

  /** Open a past daily puzzle in archive mode. */
  const openArchive = useCallback((n: number) => {
    if (n < 1 || n >= Math.max(1, dailyNumber())) return;
    window.clearTimeout(revealTimer.current);
    setReveal(null);
    setArchiveCurrent(n);
    setModeState('archive');
  }, []);

  const resetAll = useCallback(() => {
    setStats(emptyStats());
    setUnlocked([]);
    save('recent', []);
    setDaily(todaysDaily());
    setUnlimited(newGame('unlimited', 1, pickUnlimitedAnswer([daily.answer])));
    setArchiveGames({});
    setArchiveCurrent(null);
    setModeState('daily');
  }, [daily.answer]);

  /** Keyboard colours exclude the row whose tiles are still flipping. */
  const keyStates = useMemo<Record<string, LetterState>>(() => {
    const rows = reveal && reveal.mode === effectiveMode ? game.guesses.slice(0, reveal.row) : game.guesses;
    return mergeKeyStates(rows);
  }, [game.guesses, reveal, effectiveMode]);

  return {
    mode: effectiveMode, setMode, game, daily, unlimited, archive, archiveGames, openArchive,
    stats, unlocked,
    reveal: reveal && reveal.mode === effectiveMode ? reveal : null,
    keyStates, type, paste, backspace, submit, hint, newUnlimitedRound, resetAll,
  };
}
