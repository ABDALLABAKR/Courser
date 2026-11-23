import type { RawEntry } from './schema';

/**
 * Extra ACCEPTED GUESSES — valid 5-letter Sorani words that are never chosen
 * as answers (because they are inflected, rarer, sensitive, or duplicates of
 * spelling variants). Every answer is automatically an accepted guess too.
 *
 * Same review rules as `answers.ts`: all entries are `unreviewed` until a
 * native speaker signs them off.
 */
const u = (word: string, gloss?: string): RawEntry => ({ word, gloss, status: 'unreviewed' });

export const EXTRA_GUESS_SOURCE: RawEntry[] = [
  u('کوردی', 'Kurdish'), u('فارسی', 'Persian'), u('تورکی', 'Turkish'),
  u('خۆزگە', 'if only'), u('کەسێک', 'someone'), u('هەموو', 'all'), u('کەنگێ', 'when'),
  u('ئەوان', 'they'), u('خۆمان', 'ourselves'), u('بەڕێز', 'respected'), u('کەمێک', 'a little'),
  u('دووەم', 'second'), u('سێیەم', 'third'), u('ملیۆن', 'million'),
  u('دینار', 'dinar'), u('دۆلار', 'dollar'), u('پۆستە', 'post'), u('مەشکە', 'churn'),
  u('بەراز', 'boar'), u('ئەڤین', 'love'), u('خەڵکی', 'of the people'),
  u('شوشتن', 'to wash'), u('کێشان', 'to draw; pull'), u('لێدان', 'to hit; play'),
  u('نێچیر', 'game, prey'), u('ترسان', 'to fear'), u('تەقین', 'to explode'),
  u('کەوتن', 'to fall'), u('هێشتن', 'to let'), u('بەستن', 'to tie'), u('شاردن', 'to hide'),
  u('کێڵان', 'to plough'), u('کوشتن', 'to kill'), u('سەفەر', 'trip'), u('قەساب', 'butcher'),
  u('بەقاڵ', 'grocer'), u('ئوتێل', 'hotel'), u('دەستە', 'group'), u('کۆمەڵ', 'society'),
  u('ئایین', 'religion'), u('فیزیا', 'physics'), u('کیمیا', 'chemistry'),
  u('خەسوو', 'mother-in-law'), u('ژینگە', 'environment'), u('کانزا', 'mineral'),
  u('وەزیر', 'minister'), u('مووچە', 'salary'), u('شەهید', 'martyr'),
  u('ئایار', 'May'), u('کوفتە', 'kofta'), u('پۆلیس', 'police'),
];
