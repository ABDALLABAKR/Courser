import { randomBytes, randomInt } from 'node:crypto';
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '@wene/shared';

export const now = () => Date.now();
export const token = (bytes = 24) => randomBytes(bytes).toString('base64url');
export const shortId = () => randomBytes(6).toString('base64url');
export function roomCode(): string {
  let s = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) s += ROOM_CODE_ALPHABET[randomInt(ROOM_CODE_ALPHABET.length)];
  return s;
}
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export const pick = <T,>(arr: readonly T[]): T => arr[randomInt(arr.length)];
