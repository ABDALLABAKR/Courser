import { describe, expect, it } from 'vitest';
import { answerKey, compareGuess, normalizeKurdish } from '@wene/shared';

describe('Kurdish normalisation', () => {
  it('maps Arabic yeh/alef maksura/kaf to Kurdish forms', () => {
    expect(normalizeKurdish('كتيب')).toBe('کتیب');
    expect(normalizeKurdish('ماسى')).toBe('ماسی');
  });
  it('maps heh doachashmee to heh, and legacy heh+ZWNJ / teh marbuta to ae', () => {
    expect(normalizeKurdish('ھەور')).toBe('هەور');
    expect(normalizeKurdish('ه‌ور')).toBe('ەور');
    expect(normalizeKurdish('پەنجەرة')).toBe('پەنجەرە');
  });
  it('composes combining-mark spellings of ێ ۆ ڵ ڕ', () => {
    expect(normalizeKurdish('یٚو')).toBe('ێو');
    expect(normalizeKurdish('خوٚر')).toBe('خۆر');
    expect(normalizeKurdish('گولٚ')).toBe('گوڵ');
  });
  it('removes tatweel, harakat, zero-width and bidi marks; collapses spaces', () => {
    expect(normalizeKurdish('  سـێـو‏  ')).toBe('سێو');
    expect(normalizeKurdish('تۆپی    پێ')).toBe('تۆپی پێ');
    expect(normalizeKurdish('مَار')).toBe('مار');
  });
  it('never merges distinct Kurdish letters', () => {
    const pairs = [['ە', 'ه'], ['ێ', 'ی'], ['ۆ', 'و'], ['ڕ', 'ر'], ['ڵ', 'ل'], ['ڤ', 'ف'], ['ژ', 'ز'], ['گ', 'ک'], ['ح', 'ه'], ['ع', 'ئ']];
    for (const [a, b] of pairs) expect(normalizeKurdish(a)).not.toBe(normalizeKurdish(b));
    expect(compareGuess('گول', 'گوڵ')).not.toBe('correct');
    expect(compareGuess('مار', 'مەڕ')).not.toBe('correct');
  });
  it('compares guesses ignoring spacing and punctuation', () => {
    expect(compareGuess('تۆپیپێ', 'تۆپی پێ')).toBe('correct');
    expect(compareGuess('سێو!', 'سێو')).toBe('correct');
    expect(answerKey('  ')).toBe('');
    expect(compareGuess('', 'سێو')).toBe('wrong');
  });
  it('flags near misses as close without accepting them', () => {
    expect(compareGuess('پشیله', 'پشیلە')).toBe('close'); // ه typed instead of ە
    expect(compareGuess('ئەستێره', 'ئەستێرە')).toBe('close');
    expect(compareGuess('ماسی', 'سەگ')).toBe('wrong');
    expect(compareGuess('چ', 'چا')).toBe('wrong'); // too short to be "close"
  });
});

describe('nickname normalisation', () => {
  it('keeps the case of Latin nicknames', () => {
    expect(normalizeKurdish('Bawan', { foldCase: false })).toBe('Bawan');
  });
});
