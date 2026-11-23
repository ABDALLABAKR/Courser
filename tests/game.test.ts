import { describe, expect, it } from 'vitest';
import { addLetter, addText, hintablePositions, isValidSavedGame, newGame, removeLetter, revealHint, submitGuess, type GameState } from '../src/game/engine';
import { dailyEntry, dailyNumber, formatCountdown, kurdistanDateKey, msUntilNextDaily } from '../src/game/daily';
import { DAILY_ORDER_V1, DAILY_ORDER_V2 } from '../src/data/daily';
import { effectiveDailyStreak, emptyStats, hydrateStats, recordDaily, recordUnlimited, winRate } from '../src/game/stats';
import { buildShareText, emojiRow } from '../src/game/share';
import { newlyUnlocked } from '../src/game/achievements';

const type = (g: GameState, word: string) => addText(g, word);
const guess = (g: GameState, word: string) => {
  const r = submitGuess(type(g, word));
  if (!r.ok) throw new Error(`${word}: ${r.error}`);
  return r.state;
};

describe('game rules', () => {
  const fresh = () => newGame('daily', 1, 'باران');

  it('accepts at most five letters and ignores non-Kurdish input', () => {
    let g = type(fresh(), 'abc باران زیاتر');
    expect(g.current.join('')).toBe('باران');
    g = addLetter(g, 'ک');
    expect(g.current).toHaveLength(5);
  });

  it('backspace removes the last typed (left-most in RTL) letter', () => {
    const g = removeLetter(type(fresh(), 'بار'));
    expect(g.current).toEqual(['ب', 'ا']);
  });

  it('rejects short words and unknown words without using a turn', () => {
    const short = submitGuess(type(fresh(), 'بار'));
    expect(short.ok).toBe(false);
    expect(!short.ok && short.error).toBe('too-short');
    const unknown = submitGuess(type(fresh(), 'ببببب'));
    expect(!unknown.ok && unknown.error).toBe('not-in-list');
    expect(unknown.state.guesses).toHaveLength(0);
  });

  it('wins on the correct word', () => {
    const g = guess(fresh(), 'باران');
    expect(g.status).toBe('won');
    expect(g.finishedAt).toBeDefined();
  });

  it('loses after six wrong guesses and blocks further input', () => {
    let g = fresh();
    for (const w of ['هاوین', 'پاییز', 'زستان', 'بەهار', 'هەتاو', 'دەریا']) g = guess(g, w);
    expect(g.status).toBe('lost');
    expect(g.guesses).toHaveLength(6);
    expect(addLetter(g, 'ب')).toBe(g);
    expect(submitGuess(g).ok).toBe(false);
  });

  it('accepts Arabic-keyboard input for a valid word', () => {
    const g = guess(newGame('unlimited', 1, 'کوردی'), 'كوردي');
    expect(g.status).toBe('won');
  });

  it('validates saved games', () => {
    expect(isValidSavedGame(fresh())).toBe(true);
    expect(isValidSavedGame({ mode: 'daily' })).toBe(false);
    expect(isValidSavedGame(null)).toBe(false);
  });
});

describe('daily challenge (Asia/Baghdad)', () => {
  it('day 1 is 2026-01-01 in Kurdistan', () => {
    expect(dailyNumber(new Date('2026-01-01T12:00:00Z'))).toBe(1);
  });

  it('resets at midnight Baghdad time (UTC+3), not UTC', () => {
    expect(dailyNumber(new Date('2026-01-01T20:59:59Z'))).toBe(1);
    expect(dailyNumber(new Date('2026-01-01T21:00:00Z'))).toBe(2);
    expect(kurdistanDateKey(new Date('2026-01-01T21:00:00Z'))).toBe('2026-01-02');
  });

  it('is deterministic and identical for every player', () => {
    const n = dailyNumber(new Date('2026-11-23T08:00:00Z'));
    expect(n).toBe(327);
    expect(dailyEntry(n).word).toBe(dailyEntry(n).word);
    expect(dailyEntry(1).word).toBe(DAILY_ORDER_V1[0]);
    expect(dailyEntry(DAILY_ORDER_V1.length + 1).word).toBe(DAILY_ORDER_V1[0]);
  });

  it('switching to a new word list never changes a puzzle that already started', () => {
    // Today's puzzle (#327, 2026-11-23) still comes from the original list…
    expect(dailyEntry(327).word).toBe(DAILY_ORDER_V1[(327 - 1) % DAILY_ORDER_V1.length]);
    expect(dailyEntry(334).word).toBe(DAILY_ORDER_V1[(334 - 1) % DAILY_ORDER_V1.length]);
    // …and the expanded list starts on 2026-12-01 (#335).
    expect(dailyNumber(new Date('2026-12-01T06:00:00Z'))).toBe(335);
    expect(dailyEntry(335).word).toBe(DAILY_ORDER_V2[0]);
    expect(dailyEntry(335 + DAILY_ORDER_V2.length).word).toBe(DAILY_ORDER_V2[0]);
  });

  it('stays the same through the whole Kurdistan day', () => {
    const morning = dailyNumber(new Date('2026-03-10T21:00:01Z'));
    const night = dailyNumber(new Date('2026-03-11T20:59:59Z'));
    expect(morning).toBe(night);
  });

  it('counts down to the next Baghdad midnight', () => {
    expect(msUntilNextDaily(new Date('2026-01-01T20:00:00Z'))).toBe(3_600_000);
    expect(formatCountdown(3_600_000)).toBe('01:00:00');
  });
});

describe('statistics', () => {
  it('records daily results idempotently with streaks', () => {
    let s = emptyStats();
    s = recordDaily(s, 10, '2026-01-10', true, 3);
    s = recordDaily(s, 10, '2026-01-10', true, 3); // reload → no double count
    s = recordDaily(s, 11, '2026-01-11', true, 4);
    expect(s.daily.played).toBe(2);
    expect(s.daily.currentStreak).toBe(2);
    expect(s.daily.distribution).toEqual([0, 0, 1, 1, 0, 0]);
    s = recordDaily(s, 13, '2026-01-13', true, 2); // skipped day 12
    expect(s.daily.currentStreak).toBe(1);
    expect(s.daily.maxStreak).toBe(2);
    s = recordDaily(s, 14, '2026-01-14', false, 6);
    expect(s.daily.currentStreak).toBe(0);
    expect(winRate(s.daily)).toBe(75);
  });

  it('shows a broken streak once a day is missed', () => {
    const s = recordDaily(emptyStats(), 10, 'x', true, 3);
    expect(effectiveDailyStreak(s.daily, 11)).toBe(1);
    expect(effectiveDailyStreak(s.daily, 12)).toBe(0);
  });

  it('keeps unlimited stats separate', () => {
    let s = recordUnlimited(emptyStats(), true, 2);
    s = recordUnlimited(s, false, 6);
    expect(s.unlimited.played).toBe(2);
    expect(s.daily.played).toBe(0);
  });

  it('hydrates old or corrupt storage safely', () => {
    expect(hydrateStats(null).daily.played).toBe(0);
    expect(hydrateStats({ daily: { played: 3 } }).daily.distribution).toHaveLength(6);
  });

  it('unlocks achievements once', () => {
    const g = guess(newGame('daily', 1, 'باران'), 'باران');
    const s = recordDaily(emptyStats(), 1, 'x', true, 1);
    const first = newlyUnlocked(s, g, []).map((a) => a.id);
    expect(first).toEqual(expect.arrayContaining(['first-win', 'one-shot', 'lightning']));
    expect(newlyUnlocked(s, g, first)).toHaveLength(0);
  });
});

describe('sharing', () => {
  let g = newGame('daily', 25, 'باران');
  for (const w of ['هاوین', 'ئاسان', 'باران']) g = guess(g, w);

  it('matches the requested format and never reveals the answer', () => {
    const text = buildShareText(g);
    expect(text).toContain('وشە | WUSHA');
    expect(text).toContain('#25');
    expect(text).toContain('3/6');
    for (const forbidden of ['باران', 'هاوین', 'ئاسان']) expect(text).not.toContain(forbidden);
  });

  it('mirrors rows for RTL and pins direction with LRM marks', () => {
    const row = emojiRow(['correct', 'absent', 'absent', 'absent', 'present']);
    expect(row.startsWith('‎') && row.endsWith('‎')).toBe(true);
    // First letter (right-most tile) is the LAST emoji when rendered LTR.
    expect([...row.replace(/‎/g, '')]).toEqual(['🟨', '⬛', '⬛', '⬛', '🟩']);
  });

  it('uses X for a loss and appends the site URL when configured', () => {
    let lost = newGame('daily', 2, 'باران');
    for (const w of ['هاوین', 'پاییز', 'زستان', 'بەهار', 'هەتاو', 'دەریا']) lost = guess(lost, w);
    const text = buildShareText(lost, { url: 'https://example.org' });
    expect(text).toContain('X/6');
    expect(text.trim().endsWith('https://example.org')).toBe(true);
  });
});

describe('hard mode', () => {
  const start = () => newGame('daily', 1, 'باران');
  const hardGuess = (g: GameState, w: string, hard = true) => submitGuess(addText(g, w), { hard });

  it('requires green letters to stay in place', () => {
    const first = hardGuess(start(), 'ئاسان'); // ا green at 2 and 4, ن green at 5
    if (!first.ok) throw new Error();
    const bad = hardGuess(first.state, 'هاوین');
    expect(bad.ok).toBe(false);
    expect(!bad.ok && bad.error).toBe('hard-green');
  });

  it('requires revealed yellow letters to be reused', () => {
    // answer دەریا, guess باران → ر green (3rd), ا yellow
    const first = hardGuess(newGame('daily', 1, 'دەریا'), 'باران');
    if (!first.ok) throw new Error();
    const noAlef = hardGuess(first.state, 'کورسی'); // keeps ر but drops ا
    expect(!noAlef.ok && noAlef.error).toBe('hard-present');
    expect(!noAlef.ok && noAlef.letter).toBe('ا');
    expect(hardGuess(first.state, 'زەریا').ok).toBe(true);
  });

  it('reports which green letter moved and where it belongs', () => {
    // answer باران, guess ئاسان → greens at positions 2, 4, 5
    const first = hardGuess(start(), 'ئاسان');
    if (!first.ok) throw new Error();
    const r = hardGuess(first.state, 'هاوین'); // keeps ا at 2 but not at 4
    expect(!r.ok && r.error).toBe('hard-green');
    expect(!r.ok && r.letter).toBe('ا');
    expect(!r.ok && r.position).toBe(3);
  });

  it('cannot be switched on mid-game, but can be switched off', () => {
    const first = hardGuess(start(), 'ئاسان', false);
    if (!first.ok) throw new Error();
    expect(first.state.hard).toBe(false);
    expect(hardGuess(first.state, 'هاوین', true).ok).toBe(true); // still easy
    const hardFirst = hardGuess(start(), 'ئاسان', true);
    if (!hardFirst.ok) throw new Error();
    expect(hardGuess(hardFirst.state, 'هاوین', false).ok).toBe(true); // switched off
  });
});

describe('hints', () => {
  it('reveals unknown positions only, at most twice, never the last letter', () => {
    let g = newGame('unlimited', 1, 'باران');
    g = revealHint(g, () => 0);
    g = revealHint(g, () => 0);
    expect(g.hints).toEqual([0, 1]);
    expect(revealHint(g)).toBe(g); // max reached
    const almost = submitGuess(addText(newGame('unlimited', 1, 'باران'), 'باران'.slice(0, 4) + 'ن'));
    expect(almost.ok).toBe(true);
  });

  it('skips letters that are already green', () => {
    const r = submitGuess(addText(newGame('unlimited', 1, 'باران'), 'ئاسان'));
    if (!r.ok) throw new Error();
    expect(hintablePositions(r.state)).toEqual([0, 2]);
    expect(revealHint(r.state, () => 0.99).hints).toEqual([2]);
  });

  it('marks hard mode and hints in the share text', () => {
    let g = newGame('unlimited', 1, 'باران');
    g = revealHint(g, () => 0);
    const r = submitGuess(addText(g, 'باران'), { hard: true });
    if (!r.ok) throw new Error();
    const text = buildShareText(r.state);
    expect(text).toContain('1/6* 💡1');
  });
});
