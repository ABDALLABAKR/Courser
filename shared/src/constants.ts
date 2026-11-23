export const ROOM_CODE_LENGTH = 6;
/** No 0/O/1/I/L to avoid confusion when codes are read aloud or typed. */
export const ROOM_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const ROOM_CODE_REGEX = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

export const ROUND_OPTIONS = [2, 3, 5, 8] as const;
export const DRAW_TIME_OPTIONS = [60, 80, 100, 120] as const;
export const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'mixed'] as const;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS_LIMIT = 12;

export const NAME_MAX = 20;
export const CHAT_MAX = 100;
export const CUSTOM_WORDS_MAX = 150;
export const CUSTOM_WORD_MAX_LEN = 32;

export const CHOOSE_SECONDS = 15;
export const MAX_GUESS_POINTS = 500;
export const MIN_GUESS_POINTS = 100;
export const MAX_ARTIST_POINTS = 400;

/** Canvas is drawn on a fixed logical surface so every client renders identically. */
export const CANVAS_W = 1200;
export const CANVAS_H = 900;
/** Normalised coordinates are sent as integers in [0, COORD_SCALE]. */
export const COORD_SCALE = 10000;
export const BRUSH_SIZES = [4, 10, 20, 40, 70] as const;
export const PALETTE = [
  '#18243B', '#FFFFFF', '#8A94A6', '#5B3A29', '#FF746A', '#E63946',
  '#FF9F1C', '#FFCA45', '#2EC4B6', '#20C5C5', '#3A86FF', '#1D4E89',
  '#2B9348', '#80B918', '#9B5DE5', '#F15BB5', '#F4D6B0', '#C08552',
] as const;

export const REACTIONS = [
  { id: 'bzhi', emoji: '🙌', ckb: 'بژی!', en: 'Bravo!' },
  { id: 'dastkhosh', emoji: '👏', ckb: 'دەستخۆش', en: 'Well done' },
  { id: 'laugh', emoji: '😂', ckb: 'هاهاها', en: 'Haha' },
  { id: 'fire', emoji: '🔥', ckb: 'ئاگر!', en: 'Fire!' },
  { id: 'flower', emoji: '🌸', ckb: 'گوڵ', en: 'Flower' },
  { id: 'tea', emoji: '🍵', ckb: 'چایەک!', en: 'Tea break' },
  { id: 'think', emoji: '🤔', ckb: 'چییە؟', en: 'What is it?' },
  { id: 'sun', emoji: '☀️', ckb: 'نەورۆز', en: 'Newroz' },
] as const;
export type ReactionId = (typeof REACTIONS)[number]['id'];

export const AVATAR_PARTS = {
  skin: 6,
  color: 10,
  eyes: 6,
  mouth: 6,
  acc: 8,
} as const;

export const CATEGORY_IDS = [
  'food', 'animals', 'nature', 'objects', 'culture', 'sports', 'science', 'geography',
] as const;
