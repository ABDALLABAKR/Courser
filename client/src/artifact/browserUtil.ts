/** Browser stand-in for server/src/util.ts (which uses node:crypto). Same exports. */
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from '@wene/shared';

export const now = () => Date.now();
const randomInt = (n: number) => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % n;
};
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const token = (bytes = 24) => b64url(crypto.getRandomValues(new Uint8Array(bytes)));
export const shortId = () => b64url(crypto.getRandomValues(new Uint8Array(6)));

let forcedCode: string | null = null;
/** The peer host needs the room's code to match the shared channel it opened, so it chooses it up front. */
export function setNextRoomCode(code: string) { forcedCode = code; }
export function roomCode(): string {
  if (forcedCode) { const c = forcedCode; forcedCode = null; return c; }
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
