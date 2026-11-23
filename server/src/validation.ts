import { z } from 'zod';
import {
  AVATAR_PARTS, CUSTOM_WORDS_MAX, CUSTOM_WORD_MAX_LEN, DIFFICULTY_OPTIONS, DRAW_TIME_OPTIONS, MAX_PLAYERS_LIMIT,
  MIN_PLAYERS, REACTIONS, ROOM_CODE_REGEX, ROUND_OPTIONS, normalizeKurdish,
} from '@wene/shared';

const part = (max: number) => z.number().int().min(0).max(max - 1);
export const avatarSchema = z.object({
  skin: part(AVATAR_PARTS.skin), color: part(AVATAR_PARTS.color), eyes: part(AVATAR_PARTS.eyes),
  mouth: part(AVATAR_PARTS.mouth), acc: part(AVATAR_PARTS.acc),
});
export const profileSchema = z.object({ name: z.string().max(60), avatar: avatarSchema });
export const sessionSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/).optional();
export const roomCodeSchema = z.string().transform((s) => s.trim().toUpperCase()).pipe(z.string().regex(ROOM_CODE_REGEX));

const customWord = z.string().transform((s) => normalizeKurdish(s)).pipe(z.string().min(1).max(CUSTOM_WORD_MAX_LEN));
export const settingsSchema = z.object({
  rounds: z.number().refine((n) => (ROUND_OPTIONS as readonly number[]).includes(n)),
  drawTime: z.number().refine((n) => (DRAW_TIME_OPTIONS as readonly number[]).includes(n)),
  maxPlayers: z.number().int().min(MIN_PLAYERS).max(MAX_PLAYERS_LIMIT),
  difficulty: z.enum(DIFFICULTY_OPTIONS),
  categories: z.array(z.string().max(32)).max(20),
  customWords: z.array(customWord).max(CUSTOM_WORDS_MAX).transform((a) => [...new Set(a)]),
  customOnly: z.boolean(),
  hints: z.boolean(),
}).partial().strict();

const coord = z.number().int().min(0).max(10000);
const color = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
export const drawOpSchema = z.discriminatedUnion('t', [
  z.object({ t: z.literal('begin'), id: z.number().int().min(0), c: color, s: z.number().int(), e: z.union([z.literal(0), z.literal(1)]), x: coord, y: coord }),
  z.object({ t: z.literal('pts'), id: z.number().int().min(0), p: z.array(coord).max(400) }),
  z.object({ t: z.literal('fill'), id: z.number().int().min(0), c: color, x: coord, y: coord }),
  z.object({ t: z.literal('clear') }),
  z.object({ t: z.literal('undo') }),
  z.object({ t: z.literal('redo') }),
]);
export const drawOpsSchema = z.array(drawOpSchema).min(1).max(60);
export const reactionSchema = z.enum(REACTIONS.map((r) => r.id) as [string, ...string[]]);
export const reportSchema = z.object({ playerId: z.string().max(20), reason: z.string().max(200) });
