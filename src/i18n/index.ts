import { ckb, type Strings } from './ckb';

export type LanguageCode = 'ckb';

export const LANGUAGES: Record<LanguageCode, { name: string; dir: 'rtl' | 'ltr'; strings: Strings }> = {
  ckb: { name: 'کوردی (سۆرانی)', dir: 'rtl', strings: ckb },
};

const KU_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Render a number with Eastern Arabic digits, as used in Sorani writing. */
export function kuNum(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => KU_DIGITS[Number(d)]);
}
