import type { ServerToClient } from '@wene/shared';
import { Room, DEFAULT_SETTINGS } from '../src/game/Room';
import { defaultTiming, type Timing } from '../src/config';
import { pickWords, type WordEntry } from '../src/game/words';

export const TEST_WORDS: WordEntry[] = [
  { id: 1, word: 'پشیلە', meaning: 'cat', difficulty: 'easy', category: 'animals' },
  { id: 2, word: 'ئەستێرە', meaning: 'star', difficulty: 'medium', category: 'nature' },
  { id: 3, word: 'تۆپی پێ', meaning: 'football', difficulty: 'hard', category: 'sports' },
  { id: 4, word: 'سێو', meaning: 'apple', difficulty: 'easy', category: 'food' },
];

export const avatar = { skin: 0, color: 1, eyes: 2, mouth: 3, acc: 4 };

export function makeRoom(opts: { timing?: Partial<Timing>; isPublic?: boolean } = {}) {
  const sent: { to: string; event: keyof ServerToClient; args: unknown[] }[] = [];
  const timing = { ...defaultTiming, ...opts.timing };
  const room = new Room('ABCDEF', !!opts.isPublic, { ...DEFAULT_SETTINGS, rounds: 2 }, timing, {
    emit: (to, event, ...args) => { sent.push({ to, event, args }); },
    words: { pick: (n, s, ex) => pickWords(TEST_WORDS, n, s, ex) },
  });
  const to = (socketId: string, event?: keyof ServerToClient) => sent.filter((m) => m.to === socketId && (!event || m.event === event));
  return { room, sent, to, timing };
}
