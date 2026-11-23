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

  // ── Contributed list (wusha_sorani_5_letter_candidates.txt) ───────────
  // Supplied by the project owner; accepted as guesses only. Not yet
  // reviewed, and includes inflected forms (e.g. ‑ی, ‑ان endings) and some
  // Kurmanji-origin words. Promote to answers.ts with a definition after review.
  u('پیرۆز'), u('سڵاڤی'), u('چناری'), u('وتراو'), u('نیشتن'), u('دۆستی'), u('گیایی'), u('داپیر'),
  u('دڕکان'), u('ژووری'), u('بوونی'), u('پاقژی'), u('داهات'), u('دڵگیر'), u('شۆردن'), u('پیاوی'),
  u('کڕیار'), u('ڕاندن'), u('خنکان'), u('زایشت'), u('لاوان'), u('کچانی'), u('کۆچین'), u('ناجۆر'),
  u('دروست'), u('بڕینی'), u('شیکار'), u('بۆیان'), u('هۆگری'), u('شکاوی'), u('سووری'), u('ئاژنی'),
  u('خوڕین'), u('دڵدار'), u('تۆڕان'), u('مردوو'), u('ڕوونی'), u('باڵین'), u('سووکی'), u('گۆڕان'),
  u('هاتنی'), u('خۆراک'), u('خۆبین'), u('ناوخۆ'), u('کولین'), u('ڕۆیشت'), u('کوتان'), u('تووری'),
  u('کۆمان'), u('ڕانین'), u('بڕدان'), u('کوڕان'), u('موویی'), u('خۆچاک'), u('لاسکی'), u('ڕۆژان'),
  u('ئاوسی'), u('گۆپاڵ'), u('خورتی'), u('درۆزن'), u('تریشی'), u('چڕایی'), u('پڕگوڵ'), u('هۆکار'),
  u('سروشت'), u('تۆقین'), u('ڕادان'), u('کورتی'), u('زیانی'), u('نزیکی'), u('پاشان'), u('داپۆش'),
  u('ئاگری'), u('خۆگیر'), u('ئاژار'), u('پاشکۆ'), u('زیاتر'), u('شیانی'), u('دڵسۆز'), u('بڕوای'),
  u('کڕینی'), u('ڕوویی'), u('کۆڵین'), u('مردنی'), u('سترەن'), u('ڕازاو'), u('ژوورک'), u('باریک'),
  u('بڵاوی'), u('پچڕین'), u('زارۆک'), u('ڕۆژوو'), u('خۆگری'), u('شوانی'), u('دیرۆک'), u('گرانی'),
  u('دانان'), u('بزووت'), u('ساردی'), u('شاردا'), u('بواری'), u('مانگی'), u('کۆتری'), u('گرتنی'),
  u('گوتار'), u('کردار'), u('دارین'), u('زایین'), u('دزراو'), u('دوودڵ'), u('جڤاکی'), u('ناخۆش'),
  u('ڕوودا'), u('توانج'), u('نووکی'), u('خۆکار'), u('ناکۆک'), u('ناوچە'), u('ڕزگار'), u('خۆشتر'),
  u('ڕەنگی'), u('ئاڵۆز'), u('بزاوت'), u('خراپی'), u('پچڕاو'), u('چروکی'), u('چاوان'), u('گڕیان'),
  u('گوڵان'), u('هاتوو'), u('ناوکی'), u('تووشی'), u('ڕیشاڵ'), u('زرینگ'), u('قووڵی'), u('ناوپڕ'),
  u('خۆیان'), u('ڕووتی'), u('زمانی'), u('ماڵان'), u('خواری'), u('گەندم'), u('دانیش'), u('دڵنیا'),
  u('ڕێباز'), u('ڕێگای'), u('خوشکی'), u('باوکی'), u('دایکی'),
];
