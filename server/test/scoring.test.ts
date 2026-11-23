import { describe, expect, it } from 'vitest';
import { artistPoints, guessPoints, hintCount } from '../src/game/scoring';
import { pickWords, type WordEntry } from '../src/game/words';
import { DEFAULT_SETTINGS } from '../src/game/Room';

describe('scoring', () => {
  it('rewards faster guesses with more points, bounded 100..500', () => {
    expect(guessPoints(80_000, 80_000)).toBe(500);
    expect(guessPoints(0, 80_000)).toBe(100);
    expect(guessPoints(40_000, 80_000)).toBe(300);
    expect(guessPoints(70_000, 80_000)).toBeGreaterThan(guessPoints(10_000, 80_000));
    expect(guessPoints(-5, 80_000)).toBe(100);
  });
  it('gives the artist points proportional to correct guessers', () => {
    expect(artistPoints(0, 3)).toBe(0);
    expect(artistPoints(3, 3)).toBe(400);
    expect(artistPoints(1, 2)).toBe(200);
    expect(artistPoints(5, 3)).toBe(400);
    expect(artistPoints(1, 0)).toBe(0);
  });
  it('reveals hints only for longer words', () => {
    expect(hintCount(3)).toBe(0);
    expect(hintCount(5)).toBe(1);
    expect(hintCount(8)).toBe(2);
  });
});

describe('word selection', () => {
  const words: WordEntry[] = [
    ...['a1', 'a2', 'a3'].map((w, i) => ({ id: i, word: w, meaning: '', difficulty: 'easy' as const, category: 'food' })),
    ...['b1', 'b2', 'b3'].map((w, i) => ({ id: 10 + i, word: w, meaning: '', difficulty: 'medium' as const, category: 'animals' })),
    ...['c1', 'c2', 'c3'].map((w, i) => ({ id: 20 + i, word: w, meaning: '', difficulty: 'hard' as const, category: 'nature' })),
  ];
  it('offers three distinct words, one per difficulty in mixed mode', () => {
    for (let i = 0; i < 20; i++) {
      const out = pickWords(words, 3, DEFAULT_SETTINGS, new Set());
      expect(new Set(out.map((w) => w.word)).size).toBe(3);
      expect(new Set(out.map((w) => w.difficulty))).toEqual(new Set(['easy', 'medium', 'hard']));
    }
  });
  it('respects difficulty and category filters', () => {
    const out = pickWords(words, 3, { ...DEFAULT_SETTINGS, difficulty: 'hard' }, new Set());
    expect(out.every((w) => w.difficulty === 'hard')).toBe(true);
    const cat = pickWords(words, 3, { ...DEFAULT_SETTINGS, categories: ['animals'] }, new Set());
    expect(cat.every((w) => w.category === 'animals')).toBe(true);
  });
  it('avoids recently used words when possible', () => {
    const exclude = new Set(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);
    const out = pickWords(words, 3, DEFAULT_SETTINGS, exclude);
    expect(out.map((w) => w.word).sort()).toEqual(['a3', 'b3', 'c3']);
  });
  it('supports custom-only word packs', () => {
    const out = pickWords(words, 3, { ...DEFAULT_SETTINGS, customWords: ['x', 'y', 'z'], customOnly: true }, new Set());
    expect(out.map((w) => w.word).sort()).toEqual(['x', 'y', 'z']);
  });
});
