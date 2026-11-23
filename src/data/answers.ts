import type { RawEntry } from './schema';

/**
 * ⚠️  DEMONSTRATION DICTIONARY — PENDING NATIVE-SPEAKER REVIEW
 *
 * These are common, everyday Central Kurdish (Sorani) words written in the
 * standard orthography. They were selected for being basic vocabulary, but
 * NONE of them has yet been signed off by a human reviewer, so every entry is
 * marked `status: 'unreviewed'`.
 *
 * To promote a word to production:
 *   1. A native Sorani speaker checks spelling, the definition and that the
 *      word is suitable as a daily puzzle answer.
 *   2. Change its status to `'verified'`.
 *   3. When enough words are verified (≥ 365 recommended), switch
 *      `DICTIONARY_MODE` in `src/data/dictionary.ts` to `'production'`.
 *
 * Every word here must be exactly 5 Sorani letters (grapheme clusters);
 * `npm run dict:check` enforces this.
 */
export const ANSWER_SOURCE: RawEntry[] = [
  // ── Nature & seasons ──────────────────────────────────────────────
  { word: 'باران', gloss: 'rain', category: 'nature', status: 'unreviewed', definition: 'ئەو ئاوەی لە هەورەوە دەبارێت' },
  { word: 'زستان', gloss: 'winter', category: 'nature', status: 'unreviewed', definition: 'ساردترین وەرزی ساڵ' },
  { word: 'هاوین', gloss: 'summer', category: 'nature', status: 'unreviewed', definition: 'گەرمترین وەرزی ساڵ' },
  { word: 'پاییز', gloss: 'autumn', category: 'nature', status: 'unreviewed', definition: 'وەرزی گەڵاوەرین' },
  { word: 'بەهار', gloss: 'spring', category: 'nature', status: 'unreviewed', definition: 'وەرزی گوڵ و سەوزایی' },
  { word: 'هەتاو', gloss: 'sunshine', category: 'nature', status: 'unreviewed', definition: 'تیشک و گەرمیی خۆر' },
  { word: 'دەریا', gloss: 'sea', category: 'nature', status: 'unreviewed', definition: 'ئاوێکی زۆر و فراوانی سوێر' },
  { word: 'زەریا', gloss: 'ocean', category: 'nature', status: 'unreviewed', definition: 'دەریایەکی زۆر گەورە' },
  { word: 'درەخت', gloss: 'tree', category: 'nature', status: 'unreviewed', definition: 'ڕووەکێکی گەورە کە قەد و لقی هەیە' },
  { word: 'تۆفان', gloss: 'storm', category: 'nature', status: 'unreviewed', definition: 'بایەکی زۆر بەهێز لەگەڵ باران' },
  { word: 'زریان', gloss: 'cold gale', category: 'nature', status: 'unreviewed', definition: 'بای توند و سارد' },
  { word: 'شەماڵ', gloss: 'breeze', category: 'nature', status: 'unreviewed', definition: 'بایەکی فێنک و سووک' },
  { word: 'شەپۆل', gloss: 'wave', category: 'nature', status: 'unreviewed', definition: 'بەرزبوونەوەی ئاو بەسەر دەریادا' },
  { word: 'سێبەر', gloss: 'shade', category: 'nature', status: 'unreviewed', definition: 'شوێنێک کە هەتاوی لێ نادات' },
  { word: 'تەرزە', gloss: 'hail', category: 'nature', status: 'unreviewed', definition: 'دەنکە سەهۆڵی بچووک کە لە ئاسمانەوە دەبارێت' },
  { word: 'سەرما', gloss: 'cold', category: 'nature', status: 'unreviewed', definition: 'ساردیی هەوا' },
  { word: 'گەرما', gloss: 'heat', category: 'nature', status: 'unreviewed', definition: 'گەرمیی هەوا' },
  { word: 'چیمەن', gloss: 'meadow', category: 'nature', status: 'unreviewed', definition: 'زەوییەکی پڕ لە گیای سەوز' },
  { word: 'باخچە', gloss: 'garden', category: 'nature', status: 'unreviewed', definition: 'شوێنی گوڵ و دار لە نزیک ماڵ' },
  { word: 'کێڵگە', gloss: 'farm field', category: 'nature', status: 'unreviewed', definition: 'زەوی بۆ کشتوکاڵ' },
  { word: 'تاڤگە', gloss: 'waterfall', category: 'nature', status: 'unreviewed', definition: 'ئاوێک کە لە بەرزاییەوە دەڕژێتە خوارەوە' },
  { word: 'کەنار', gloss: 'shore', category: 'nature', status: 'unreviewed', definition: 'لێواری دەریا یان ڕووبار' },
  { word: 'جیهان', gloss: 'world', category: 'nature', status: 'unreviewed', definition: 'هەموو زەوی و خەڵکەکەی' },
  { word: 'سەهۆڵ', gloss: 'ice', category: 'nature', status: 'unreviewed', definition: 'ئاوی بەستوو' },

  // ── Time ──────────────────────────────────────────────────────────
  { word: 'هەفتە', gloss: 'week', category: 'time', status: 'unreviewed', definition: 'ماوەی حەوت ڕۆژ' },
  { word: 'ئەمڕۆ', gloss: 'today', category: 'time', status: 'unreviewed', definition: 'ئەم ڕۆژە' },
  { word: 'دوێنێ', gloss: 'yesterday', category: 'time', status: 'unreviewed', definition: 'ڕۆژی پێش ئەمڕۆ' },
  { word: 'ئێستا', gloss: 'now', category: 'time', status: 'unreviewed', definition: 'ئەم کاتە' },
  { word: 'ئازار', gloss: 'March; pain', category: 'time', status: 'unreviewed', definition: 'مانگی سێیەمی ساڵ؛ هەروەها بە واتای ئێش' },
  { word: 'نیسان', gloss: 'April', category: 'time', status: 'unreviewed', definition: 'مانگی چوارەمی ساڵ' },
  { word: 'شوبات', gloss: 'February', category: 'time', status: 'unreviewed', definition: 'مانگی دووەمی ساڵ' },
  { word: 'سەعات', gloss: 'clock; hour', category: 'time', status: 'unreviewed', definition: 'ئامێری پیشاندانی کات' },

  // ── Animals ───────────────────────────────────────────────────────
  { word: 'پشیلە', gloss: 'cat', category: 'animal', status: 'unreviewed', definition: 'ئاژەڵێکی ماڵیی بچووک کە میاو دەکات' },
  { word: 'مریشک', gloss: 'chicken', category: 'animal', status: 'unreviewed', definition: 'باڵندەیەکی ماڵی کە هێلکە دەکات' },
  { word: 'بەران', gloss: 'ram', category: 'animal', status: 'unreviewed', definition: 'نێری مەڕ' },
  { word: 'مێروو', gloss: 'insect', category: 'animal', status: 'unreviewed', definition: 'گیانلەبەرێکی زۆر بچووک' },
  { word: 'مانگا', gloss: 'cow', category: 'animal', status: 'unreviewed', definition: 'ئاژەڵێکی ماڵی کە شیر دەدات' },
  { word: 'گامێش', gloss: 'water buffalo', category: 'animal', status: 'unreviewed', definition: 'ئاژەڵێکی گەورەی شیردەر' },
  { word: 'مراوی', gloss: 'duck', category: 'animal', status: 'unreviewed', definition: 'باڵندەیەکی ئاوی' },
  { word: 'کیسەڵ', gloss: 'turtle', category: 'animal', status: 'unreviewed', definition: 'گیانلەبەرێکی هێواش کە قاوغی هەیە' },
  { word: 'قرژاڵ', gloss: 'crab', category: 'animal', status: 'unreviewed', definition: 'گیانلەبەرێکی ئاوی کە بە لادا دەڕوات' },
  { word: 'ئاژەڵ', gloss: 'animal', category: 'animal', status: 'unreviewed', definition: 'هەر گیانلەبەرێک جگە لە مرۆڤ' },

  // ── Food ──────────────────────────────────────────────────────────
  { word: 'هەنار', gloss: 'pomegranate', category: 'food', status: 'unreviewed', definition: 'میوەیەکی سووری پڕ لە دەنک' },
  { word: 'قەیسی', gloss: 'apricot', category: 'food', status: 'unreviewed', definition: 'میوەیەکی نارنجیی هاوینە' },
  { word: 'گێلاس', gloss: 'cherry', category: 'food', status: 'unreviewed', definition: 'میوەیەکی بچووکی سووری شیرین' },
  { word: 'شووتی', gloss: 'watermelon', category: 'food', status: 'unreviewed', definition: 'میوەیەکی گەورەی سەوز کە ناوەکەی سوورە' },
  { word: 'کاڵەک', gloss: 'melon', category: 'food', status: 'unreviewed', definition: 'میوەیەکی گەورەی شیرینی هاوینە' },
  { word: 'خەیار', gloss: 'cucumber', category: 'food', status: 'unreviewed', definition: 'سەوزەیەکی درێژی سەوز' },
  { word: 'پەنیر', gloss: 'cheese', category: 'food', status: 'unreviewed', definition: 'خواردنێک کە لە شیر دروست دەکرێت' },
  { word: 'هێلکە', gloss: 'egg', category: 'food', status: 'unreviewed', definition: 'ئەوەی مریشک دەیکات' },
  { word: 'دۆشاو', gloss: 'grape molasses', category: 'food', status: 'unreviewed', definition: 'شیرەی کوڵاوی ترێ یان خورما' },
  { word: 'دۆڵمە', gloss: 'dolma', category: 'food', status: 'unreviewed', definition: 'خواردنێکی کوردی لە گەڵا و سەوزەی پڕکراو' },
  { word: 'کەباب', gloss: 'kebab', category: 'food', status: 'unreviewed', definition: 'گۆشتی برژاو لەسەر شیش' },

  // ── Home & objects ────────────────────────────────────────────────
  { word: 'خانوو', gloss: 'house', category: 'home', status: 'unreviewed', definition: 'شوێنی ژیانی مرۆڤ' },
  { word: 'دەرگا', gloss: 'door', category: 'home', status: 'unreviewed', definition: 'ڕێگای چوونە ژوورەوە' },
  { word: 'دیوار', gloss: 'wall', category: 'home', status: 'unreviewed', definition: 'بەربەستێکی ڕاوەستاو لە بەرد یان خشت' },
  { word: 'کورسی', gloss: 'chair', category: 'home', status: 'unreviewed', definition: 'شتێک کە لەسەری دادەنیشیت' },
  { word: 'کەوچک', gloss: 'spoon', category: 'home', status: 'unreviewed', definition: 'ئامرازی خواردنی شلە' },
  { word: 'پێڵاو', gloss: 'shoe', category: 'home', status: 'unreviewed', definition: 'ئەوەی لە پێ دەکرێت' },
  { word: 'پاڵتۆ', gloss: 'coat', category: 'home', status: 'unreviewed', definition: 'جلی ئەستووری زستانە' },
  { word: 'جانتا', gloss: 'bag', category: 'home', status: 'unreviewed', definition: 'شتێک بۆ هەڵگرتنی کەلوپەل' },
  { word: 'سەرین', gloss: 'pillow', category: 'home', status: 'unreviewed', definition: 'ئەوەی لە کاتی خەوتندا سەری لەسەر دادەنێیت' },
  { word: 'خاولی', gloss: 'towel', category: 'home', status: 'unreviewed', definition: 'پارچە قوماشێک بۆ وشککردنەوە' },
  { word: 'دەرزی', gloss: 'needle', category: 'home', status: 'unreviewed', definition: 'ئامرازێکی باریک بۆ دوورین' },
  { word: 'مقەست', gloss: 'scissors', category: 'home', status: 'unreviewed', definition: 'ئامرازی بڕینی کاغەز و قوماش' },
  { word: 'چەکوچ', gloss: 'hammer', category: 'home', status: 'unreviewed', definition: 'ئامرازێک بۆ کوتانی بزمار' },
  { word: 'بزمار', gloss: 'nail', category: 'home', status: 'unreviewed', definition: 'پارچە ئاسنێکی باریک و تیژ' },
  { word: 'قەڵەم', gloss: 'pen', category: 'home', status: 'unreviewed', definition: 'ئامرازی نووسین' },
  { word: 'کاغەز', gloss: 'paper', category: 'home', status: 'unreviewed', definition: 'پەڕەی نووسین' },
  { word: 'تەختە', gloss: 'board', category: 'home', status: 'unreviewed', definition: 'پارچە دارێکی پان' },

  // ── Body ──────────────────────────────────────────────────────────
  { word: 'پەنجە', gloss: 'finger', category: 'body', status: 'unreviewed', definition: 'بەشە باریکەکانی دەست و پێ' },
  { word: 'ئەژنۆ', gloss: 'knee', category: 'body', status: 'unreviewed', definition: 'جومگەی ناوەڕاستی قاچ' },
  { word: 'پاژنە', gloss: 'heel', category: 'body', status: 'unreviewed', definition: 'بەشی دواوەی پێ' },

  // ── People ────────────────────────────────────────────────────────
  { word: 'منداڵ', gloss: 'child', category: 'people', status: 'unreviewed', definition: 'مرۆڤی کەمتەمەن' },
  { word: 'خێزان', gloss: 'family', category: 'people', status: 'unreviewed', definition: 'دایک و باوک و منداڵەکانیان' },
  { word: 'هاوڕێ', gloss: 'friend', category: 'people', status: 'unreviewed', definition: 'یار و دۆست' },
  { word: 'باپیر', gloss: 'grandfather', category: 'people', status: 'unreviewed', definition: 'باوکی باوک یان باوکی دایک' },
  { word: 'میوان', gloss: 'guest', category: 'people', status: 'unreviewed', definition: 'کەسێک کە دێتە ماڵت' },
  { word: 'دکتۆر', gloss: 'doctor', category: 'people', status: 'unreviewed', definition: 'کەسێک کە نەخۆش چارەسەر دەکات' },
  { word: 'سەرۆک', gloss: 'leader; president', category: 'people', status: 'unreviewed', definition: 'کەسی یەکەمی وڵات یان دەستەیەک' },
  { word: 'ڕاوچی', gloss: 'hunter', category: 'people', status: 'unreviewed', definition: 'کەسێک کە ڕاو دەکات' },
  { word: 'شاعیر', gloss: 'poet', category: 'people', status: 'unreviewed', definition: 'کەسێک کە شیعر دەنووسێت' },

  // ── Places ────────────────────────────────────────────────────────
  { word: 'بازاڕ', gloss: 'market', category: 'place', status: 'unreviewed', definition: 'شوێنی کڕین و فرۆشتن' },
  { word: 'شەقام', gloss: 'street', category: 'place', status: 'unreviewed', definition: 'ڕێگای ناو شار' },
  { word: 'کۆڵان', gloss: 'alley', category: 'place', status: 'unreviewed', definition: 'ڕێگای تەسکی نێوان ماڵەکان' },
  { word: 'گەڕەک', gloss: 'neighbourhood', category: 'place', status: 'unreviewed', definition: 'بەشێک لە شار' },
  { word: 'زانکۆ', gloss: 'university', category: 'place', status: 'unreviewed', definition: 'شوێنی خوێندنی باڵا' },
  { word: 'دادگا', gloss: 'court', category: 'place', status: 'unreviewed', definition: 'شوێنی دادوەری' },
  { word: 'سنوور', gloss: 'border', category: 'place', status: 'unreviewed', definition: 'هێڵی نێوان دوو وڵات' },
  { word: 'دوکان', gloss: 'shop', category: 'place', status: 'unreviewed', definition: 'شوێنی فرۆشتنی کاڵا' },
  { word: 'تەلار', gloss: 'building', category: 'place', status: 'unreviewed', definition: 'بینایەکی گەورە' },
  { word: 'منارە', gloss: 'minaret', category: 'place', status: 'unreviewed', definition: 'بەشە بەرزەکەی مزگەوت' },
  { word: 'کەشتی', gloss: 'ship', category: 'place', status: 'unreviewed', definition: 'ئامرازی گواستنەوە لەسەر ئاو' },
  { word: 'فڕۆکە', gloss: 'aeroplane', category: 'place', status: 'unreviewed', definition: 'ئامرازی گواستنەوە بە ئاسماندا' },

  // ── Culture ───────────────────────────────────────────────────────
  { word: 'چیرۆک', gloss: 'story', category: 'culture', status: 'unreviewed', definition: 'ڕووداوێک کە دەگێڕدرێتەوە' },
  { word: 'ڕۆمان', gloss: 'novel', category: 'culture', status: 'unreviewed', definition: 'چیرۆکێکی درێژی نووسراو' },
  { word: 'ئەدەب', gloss: 'literature', category: 'culture', status: 'unreviewed', definition: 'شیعر و چیرۆک و نووسینی هونەری' },
  { word: 'مێژوو', gloss: 'history', category: 'culture', status: 'unreviewed', definition: 'ڕووداوەکانی ڕابردوو' },
  { word: 'زانست', gloss: 'science', category: 'culture', status: 'unreviewed', definition: 'زانیاریی ڕێکخراو دەربارەی جیهان' },
  { word: 'هونەر', gloss: 'art', category: 'culture', status: 'unreviewed', definition: 'داهێنانی جوانی' },
  { word: 'ئاواز', gloss: 'melody', category: 'culture', status: 'unreviewed', definition: 'ئاهەنگی گۆرانی' },
  { word: 'شمشاڵ', gloss: 'shimshal flute', category: 'culture', status: 'unreviewed', definition: 'ئامێرێکی مۆسیقای فووپێکراوی کوردی' },
  { word: 'بلوێر', gloss: 'shepherd flute', category: 'culture', status: 'unreviewed', definition: 'ئامێری فووپێکراوی شوانان' },
  { word: 'دەهۆڵ', gloss: 'drum', category: 'culture', status: 'unreviewed', definition: 'ئامێرێکی مۆسیقای لێدراو' },
  { word: 'زوڕنا', gloss: 'zurna', category: 'culture', status: 'unreviewed', definition: 'ئامێرێکی فووپێکراوی شایی' },
  { word: 'دیاری', gloss: 'gift', category: 'culture', status: 'unreviewed', definition: 'شتێک کە بە خۆشەویستی دەبەخشرێت' },
  { word: 'وەرزش', gloss: 'sport', category: 'culture', status: 'unreviewed', definition: 'یاری و ڕاهێنانی جەستە' },
  { word: 'هەواڵ', gloss: 'news', category: 'culture', status: 'unreviewed', definition: 'زانیاری دەربارەی ڕووداوێکی نوێ' },
  { word: 'گۆڤار', gloss: 'magazine', category: 'culture', status: 'unreviewed', definition: 'بڵاوکراوەیەکی وێنەدار' },
  { word: 'ڕادیۆ', gloss: 'radio', category: 'culture', status: 'unreviewed', definition: 'ئامێری بیستنی دەنگ و هەواڵ' },

  // ── Abstract ──────────────────────────────────────────────────────
  { word: 'ئومێد', gloss: 'hope', category: 'abstract', status: 'unreviewed', definition: 'چاوەڕوانیی شتی باش' },
  { word: 'ئاشتی', gloss: 'peace', category: 'abstract', status: 'unreviewed', definition: 'نەبوونی شەڕ' },
  { word: 'ئاوات', gloss: 'wish', category: 'abstract', status: 'unreviewed', definition: 'ئارەزوو و هیوا' },
  { word: 'خەیاڵ', gloss: 'imagination', category: 'abstract', status: 'unreviewed', definition: 'وێنەی ناو بیر' },
  { word: 'ڕاستی', gloss: 'truth', category: 'abstract', status: 'unreviewed', definition: 'پێچەوانەی درۆ' },
  { word: 'سوپاس', gloss: 'thanks', category: 'abstract', status: 'unreviewed', definition: 'دەربڕینی پێزانین' },
  { word: 'جوانی', gloss: 'beauty', category: 'abstract', status: 'unreviewed', definition: 'جوانبوون' },
  { word: 'خەندە', gloss: 'smile', category: 'abstract', status: 'unreviewed', definition: 'پێکەنینی بێدەنگ' },
  { word: 'وەڵام', gloss: 'answer', category: 'abstract', status: 'unreviewed', definition: 'ئەوەی لە بەرامبەر پرسیاردا دەوترێت' },
  { word: 'ژمارە', gloss: 'number', category: 'number', status: 'unreviewed', definition: 'نیشانەی بژاردن' },
  { word: 'هەزار', gloss: 'thousand', category: 'number', status: 'unreviewed', definition: 'دە جار سەد' },

  // ── Adjectives ────────────────────────────────────────────────────
  { word: 'ئازاد', gloss: 'free', category: 'adjective', status: 'unreviewed', definition: 'سەربەست و بێ بەند' },
  { word: 'گەورە', gloss: 'big', category: 'adjective', status: 'unreviewed', definition: 'پێچەوانەی بچووک' },
  { word: 'بچووک', gloss: 'small', category: 'adjective', status: 'unreviewed', definition: 'پێچەوانەی گەورە' },
  { word: 'شیرین', gloss: 'sweet', category: 'adjective', status: 'unreviewed', definition: 'تامی وەک شەکر' },
  { word: 'تاریک', gloss: 'dark', category: 'adjective', status: 'unreviewed', definition: 'بێ ڕووناکی' },
  { word: 'زیرەک', gloss: 'clever', category: 'adjective', status: 'unreviewed', definition: 'تێگەیشتوو و ژیر' },
  { word: 'چالاک', gloss: 'active', category: 'adjective', status: 'unreviewed', definition: 'بەجموجۆڵ و کارا' },
  { word: 'بەهێز', gloss: 'strong', category: 'adjective', status: 'unreviewed', definition: 'خاوەن هێزی زۆر' },
  { word: 'لاواز', gloss: 'weak', category: 'adjective', status: 'unreviewed', definition: 'بێ هێز' },
  { word: 'هەژار', gloss: 'poor', category: 'adjective', status: 'unreviewed', definition: 'بێ پارە و دارایی' },
  { word: 'ئاسان', gloss: 'easy', category: 'adjective', status: 'unreviewed', definition: 'کارێک کە زەحمەت نییە' },
  { word: 'ئارام', gloss: 'calm', category: 'adjective', status: 'unreviewed', definition: 'هێمن و بێ دەنگەدەنگ' },
  { word: 'بەتاڵ', gloss: 'empty', category: 'adjective', status: 'unreviewed', definition: 'پێچەوانەی پڕ' },
  { word: 'هێواش', gloss: 'slow', category: 'adjective', status: 'unreviewed', definition: 'پێچەوانەی خێرا' },
  { word: 'نەخۆش', gloss: 'ill', category: 'adjective', status: 'unreviewed', definition: 'کەسێک کە تەندروست نییە' },
  { word: 'تینوو', gloss: 'thirsty', category: 'adjective', status: 'unreviewed', definition: 'پێویستی بە ئاو هەیە' },
  { word: 'تووڕە', gloss: 'angry', category: 'adjective', status: 'unreviewed', definition: 'زۆر ناڕازی و بێتاقەت' },
  { word: 'دڵخۆش', gloss: 'happy', category: 'adjective', status: 'unreviewed', definition: 'شاد و خۆشحاڵ' },
  { word: 'وشیار', gloss: 'alert', category: 'adjective', status: 'unreviewed', definition: 'ئاگادار' },
  { word: 'تەمەڵ', gloss: 'lazy', category: 'adjective', status: 'unreviewed', definition: 'کەسێک کە حەزی لە کار نییە' },
  { word: 'بێدار', gloss: 'awake', category: 'adjective', status: 'unreviewed', definition: 'پێچەوانەی خەوتوو' },
  { word: 'یەکەم', gloss: 'first', category: 'number', status: 'unreviewed', definition: 'پێش هەمووان' },

  // ── Verbal nouns (infinitives) ────────────────────────────────────
  { word: 'بینین', gloss: 'to see', category: 'verb', status: 'unreviewed', definition: 'سەیرکردن بە چاو' },
  { word: 'بیستن', gloss: 'to hear', category: 'verb', status: 'unreviewed', definition: 'هەستکردن بە دەنگ' },
  { word: 'زانین', gloss: 'to know', category: 'verb', status: 'unreviewed', definition: 'ئاگاداربوون لە شتێک' },
  { word: 'پرسین', gloss: 'to ask', category: 'verb', status: 'unreviewed', definition: 'پرسیارکردن' },
  { word: 'ناردن', gloss: 'to send', category: 'verb', status: 'unreviewed', definition: 'ڕەوانەکردن' },
  { word: 'دۆزین', gloss: 'to find', category: 'verb', status: 'unreviewed', definition: 'پەیداکردنی شتێکی ون' },
  { word: 'چاندن', gloss: 'to plant', category: 'verb', status: 'unreviewed', definition: 'ناشتنی تۆو لە زەویدا' },
  { word: 'خەوتن', gloss: 'to sleep', category: 'verb', status: 'unreviewed', definition: 'چوونە خەو' },
  { word: 'گریان', gloss: 'to cry', category: 'verb', status: 'unreviewed', definition: 'ڕشتنی فرمێسک' },
  { word: 'گۆڕین', gloss: 'to change', category: 'verb', status: 'unreviewed', definition: 'شتێک کردن بە شتێکی تر' },
  { word: 'هێنان', gloss: 'to bring', category: 'verb', status: 'unreviewed', definition: 'شتێک بۆ لای خۆت گواستنەوە' },
  { word: 'ناسین', gloss: 'to recognise', category: 'verb', status: 'unreviewed', definition: 'زانینی کەسێک یان شتێک' },
  { word: 'گەڕان', gloss: 'to search; to wander', category: 'verb', status: 'unreviewed', definition: 'بەدواداچوون بۆ دۆزینەوە' },
  { word: 'ویستن', gloss: 'to want', category: 'verb', status: 'unreviewed', definition: 'ئارەزووکردن' },
];
