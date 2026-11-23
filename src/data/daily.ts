/**
 * DAILY ANSWER ORDER — versioned, append-only.
 *
 * Puzzle #N (N ≥ 1) on Baghdad-calendar day DAILY_EPOCH + (N − 1) uses
 * DAILY_ORDER[(N − 1) % DAILY_ORDER.length].
 *
 * RULES (so every player always gets the same word on the same day):
 *  • Never reorder or delete existing lines — that would change past and
 *    current puzzles for everyone. To retire a word, replace the line with a
 *    new word only for days that are still in the future, and bump
 *    DAILY_LIST_VERSION.
 *  • Append new words at the END.
 *  • Every word here must exist in ANSWER_SOURCE (enforced by tests).
 *
 * The initial order was produced once with a seeded shuffle and is now
 * frozen as literal data.
 */
export const DAILY_LIST_VERSION = 1;

/** Day #1 of the daily challenge (calendar date in Asia/Baghdad). */
export const DAILY_EPOCH = '2026-01-01';

export const DAILY_TIME_ZONE = 'Asia/Baghdad';

export const DAILY_ORDER: readonly string[] = [
  'ئازار', 'چاندن', 'گەورە', 'ئەژنۆ', 'خەندە', 'ڕۆمان',
  'ویستن', 'سەرما', 'نەخۆش', 'پەنیر', 'گریان', 'هاوڕێ',
  'ڕادیۆ', 'دیوار', 'کێڵگە', 'تۆفان', 'دکتۆر', 'هونەر',
  'هەژار', 'گۆڤار', 'سەرۆک', 'قرژاڵ', 'خەیار', 'کورسی',
  'بلوێر', 'هەواڵ', 'کەباب', 'مێروو', 'باپیر', 'هێلکە',
  'شیرین', 'پشیلە', 'وشیار', 'ئازاد', 'کیسەڵ', 'تەلار',
  'نیسان', 'ناردن', 'تەرزە', 'لاواز', 'تەختە', 'زریان',
  'کەشتی', 'ئاسان', 'تاڤگە', 'پاڵتۆ', 'هەتاو', 'دەریا',
  'دەرزی', 'مریشک', 'باران', 'بێدار', 'بەهار', 'تووڕە',
  'شاعیر', 'قەیسی', 'کەوچک', 'دەرگا', 'گەڕان', 'ئاواز',
  'میوان', 'بینین', 'خێزان', 'باخچە', 'دۆزین', 'هەفتە',
  'بەران', 'گەرما', 'دوکان', 'دۆشاو', 'تاریک', 'چەکوچ',
  'شوبات', 'یەکەم', 'ئێستا', 'مقەست', 'دەهۆڵ', 'مراوی',
  'شەقام', 'بیستن', 'ئاژەڵ', 'ئەمڕۆ', 'شووتی', 'جانتا',
  'گێلاس', 'سەعات', 'بچووک', 'چیرۆک', 'بزمار', 'تەمەڵ',
  'کاغەز', 'زستان', 'پاییز', 'هاوین', 'خەیاڵ', 'ڕاستی',
  'هەنار', 'مێژوو', 'منارە', 'ژمارە', 'درەخت', 'شمشاڵ',
  'سوپاس', 'پەنجە', 'دیاری', 'زانست', 'بازاڕ', 'مانگا',
  'شەماڵ', 'ئاشتی', 'وەرزش', 'زیرەک', 'دۆڵمە', 'ئومێد',
  'گۆڕین', 'خانوو', 'خاولی', 'چیمەن', 'بەهێز', 'ئارام',
  'کەنار', 'سەرین', 'جوانی', 'ناسین', 'بەتاڵ', 'دادگا',
  'هەزار', 'ڕاوچی', 'تینوو', 'هێنان', 'هێواش', 'زانین',
  'فڕۆکە', 'پرسین', 'پێڵاو', 'گەڕەک', 'زانکۆ', 'زوڕنا',
  'ئەدەب', 'جیهان', 'پاژنە', 'وەڵام', 'کۆڵان', 'زەریا',
  'دڵخۆش', 'قەڵەم', 'گامێش', 'چالاک', 'منداڵ', 'دوێنێ',
  'سەهۆڵ', 'کاڵەک', 'شەپۆل', 'خەوتن', 'سنوور', 'ئاوات',
  'سێبەر',
];
