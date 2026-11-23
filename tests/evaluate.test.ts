import { describe, expect, it } from 'vitest';
import { evaluateGuess, isWin, mergeKeyStates } from '../src/game/evaluate';
import { graphemes } from '../src/game/kurdish';

const ev = (guess: string, answer: string) => evaluateGuess(graphemes(guess), graphemes(answer));
const C = 'correct', P = 'present', A = 'absent';

describe('evaluateGuess — two-pass algorithm', () => {
  it('all correct', () => {
    expect(ev('باران', 'باران')).toEqual([C, C, C, C, C]);
    expect(isWin(ev('باران', 'باران'))).toBe(true);
  });

  it('marks present vs absent', () => {
    // answer دەریا, guess باران: ب✗  ا→present  ر→correct (same slot)  ا✗ (only one ا)  ن✗
    expect(ev('باران', 'دەریا')).toEqual([A, P, C, A, A]);
  });

  it('repeated letter in guess, answer has it twice in the same spots', () => {
    // answer باران has ا at 1 and 3; guess ئاسان also at 1 and 3.
    expect(ev('ئاسان', 'باران')).toEqual([A, C, A, C, C]);
  });

  it('extra copies beyond the answer count become gray', () => {
    // answer باران has two ا. Guess has three ا: one green, one yellow, one gray.
    expect(evaluateGuess(['ا', 'ا', 'ا', 'ب', 'ب'], graphemes('باران'))).toEqual([P, C, A, P, A]);
  });

  it('a green later in the word takes precedence over an earlier yellow', () => {
    // answer هەتاو has one ە at index 1. Guess ەەەەە → only index 1 is marked.
    expect(evaluateGuess(['ە', 'ە', 'ە', 'ە', 'ە'], graphemes('هەتاو'))).toEqual([A, C, A, A, A]);
    // Guess with ە at 0 and 1: the green at 1 consumes the only ە → index 0 gray.
    expect(evaluateGuess(['ە', 'ە', 'ب', 'ب', 'ب'], graphemes('هەتاو'))).toEqual([A, C, A, A, A]);
  });

  it('double وو in the answer', () => {
    // answer خانوو (… و و). Guess with one و in the wrong place → present.
    expect(evaluateGuess(['و', 'ب', 'ب', 'ب', 'ب'], graphemes('خانوو'))).toEqual([P, A, A, A, A]);
    // Guess with three و → two matched (one green, one yellow), one gray.
    expect(evaluateGuess(['و', 'و', 'ب', 'و', 'ب'], graphemes('خانوو'))).toEqual([P, A, A, C, A]);
  });

  it('distinguishes ر/ڕ, ل/ڵ, ی/ێ, و/ۆ, ه/ە', () => {
    expect(ev('بازار', 'بازاڕ')).toEqual([C, C, C, C, A]);
    expect(evaluateGuess(['ه', 'ب', 'ب', 'ب', 'ب'], graphemes('ەەەەە'))).toEqual([A, A, A, A, A]);
  });

  it('rejects mismatched lengths', () => {
    expect(() => evaluateGuess(['ب'], graphemes('باران'))).toThrow();
  });
});

describe('mergeKeyStates — keyboard priority green > yellow > gray', () => {
  it('upgrades but never downgrades', () => {
    const keys = mergeKeyStates([
      { letters: ['ا', 'ب'], states: [A, P] },
      { letters: ['ا', 'ب'], states: [P, C] },
      { letters: ['ا', 'ب'], states: [A, A] },
    ]);
    expect(keys['ا']).toBe(P);
    expect(keys['ب']).toBe(C);
  });

  it('a letter both gray and green in the same row is green', () => {
    const keys = mergeKeyStates([{ letters: ['ە', 'ە'], states: [A, C] }]);
    expect(keys['ە']).toBe(C);
  });
});
