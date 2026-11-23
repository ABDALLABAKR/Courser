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
  u('فارسی', 'Persian'), u('تورکی', 'Turkish'),
  u('خۆزگە', 'if only'), u('کەسێک', 'someone'), u('هەموو', 'all'), u('کەنگێ', 'when'),
  u('ئەوان', 'they'), u('خۆمان', 'ourselves'), u('بەڕێز', 'respected'), u('کەمێک', 'a little'),
  u('دووەم', 'second'), u('سێیەم', 'third'), u('ملیۆن', 'million'),
  u('دۆلار', 'dollar'),
  u('بەراز', 'boar'), u('خەڵکی', 'of the people'),
  u('کێشان', 'to draw; pull'), u('لێدان', 'to hit; play'),
  u('تەقین', 'to explode'),
  u('هێشتن', 'to let'),
  u('کوشتن', 'to kill'),
 
  u('ئایین', 'religion'),
 
  u('شەهید', 'martyr'),
  u('کوفتە', 'kofta'),

  // ── Contributed list (wusha_sorani_5_letter_candidates.txt) ───────────
  // Supplied by the project owner; accepted as guesses only. Not yet
  // reviewed, and includes inflected forms (e.g. ‑ی, ‑ان endings) and some
  // Kurmanji-origin words. Promote to answers.ts with a definition after review.
  u('سڵاڤی'), u('چناری'), u('وتراو'), u('نیشتن'), u('دۆستی'), u('گیایی'),
  u('دڕکان'), u('ژووری'), u('بوونی'), u('پاقژی'), u('دڵگیر'), u('پیاوی'),
  u('ڕاندن'), u('زایشت'), u('لاوان'), u('کچانی'), u('کۆچین'),
  u('بڕینی'), u('شیکار'), u('بۆیان'), u('هۆگری'), u('شکاوی'), u('سووری'), u('ئاژنی'),
  u('خوڕین'), u('تۆڕان'), u('مردوو'), u('ڕوونی'), u('باڵین'), u('سووکی'),
  u('هاتنی'), u('خۆبین'), u('کولین'), u('ڕۆیشت'), u('تووری'),
  u('کۆمان'), u('ڕانین'), u('بڕدان'), u('کوڕان'), u('موویی'), u('خۆچاک'), u('لاسکی'), u('ڕۆژان'),
  u('ئاوسی'), u('خورتی'), u('تریشی'), u('چڕایی'), u('پڕگوڵ'),
  u('ڕادان'), u('کورتی'), u('زیانی'), u('نزیکی'), u('داپۆش'),
  u('ئاگری'), u('خۆگیر'), u('ئاژار'), u('شیانی'), u('بڕوای'),
  u('کڕینی'), u('ڕوویی'), u('کۆڵین'), u('مردنی'), u('سترەن'), u('ڕازاو'), u('ژوورک'),
  u('بڵاوی'), u('زارۆک'), u('خۆگری'), u('شوانی'), u('دیرۆک'), u('گرانی'),
  u('دانان'), u('بزووت'), u('شاردا'), u('بواری'), u('مانگی'), u('کۆتری'), u('گرتنی'),
  u('زایین'), u('جڤاکی'),
  u('ڕوودا'), u('نووکی'), u('خۆکار'), u('خۆشتر'),
  u('ڕەنگی'), u('خراپی'), u('چروکی'), u('چاوان'), u('گڕیان'),
  u('هاتوو'), u('ناوکی'), u('تووشی'), u('ناوپڕ'),
  u('خۆیان'), u('ڕووتی'), u('زمانی'), u('ماڵان'), u('خواری'), u('گەندم'), u('دانیش'),
  u('ڕێگای'), u('خوشکی'), u('باوکی'), u('دایکی'),

  // ── Place names and other words (v1.2) ──
  u('ڕانیە', 'Ranya'),
  u('سۆران', 'Soran'),
  u('کەلار', 'Kalar'),
  u('ئاکرێ', 'Akre'),
  u('بۆکان', 'Bukan'),
  u('ئامەد', 'Amed'),
  u('جزیرە', 'Cizre'),
  u('سەفین', 'Mt Safeen'),
  u('ئازمڕ', 'Mt Azmar'),
  u('گۆیژە', 'Mt Goyje'),
  u('دێرسم', 'Dersim'),
  u('تفەنگ', 'rifle'),
  u('شمشێر', 'sword'),
  u('مێدیا', 'media; Medes'),
  u('تووتن', 'tobacco'),
  u('کەللە', 'skull'),
  u('زڕبرا', 'stepbrother'),
  u('گەشان', 'to shine'),
];
