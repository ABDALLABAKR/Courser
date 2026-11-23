import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

/** Format: scrypt$<salt b64url>$<hash b64url> */
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 32, PARAMS);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, saltB64, hashB64] = stored.split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = await scrypt(pw, Buffer.from(saltB64, 'base64url'), expected.length, PARAMS);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const TTL_MS = 12 * 60 * 60 * 1000;

/** Stateless signed admin session token: <expiry>.<nonce>.<hmac>. */
export function signAdminToken(secret: string, ttl = TTL_MS): string {
  const body = `${Date.now() + ttl}.${randomBytes(9).toString('base64url')}`;
  const mac = createHmac('sha256', secret).update(`admin:${body}`).digest('base64url');
  return `${body}.${mac}`;
}

export function verifyAdminToken(secret: string, tokenStr: string | undefined): boolean {
  if (!tokenStr) return false;
  const parts = tokenStr.split('.');
  if (parts.length !== 3) return false;
  const [exp, nonce, mac] = parts;
  const expected = createHmac('sha256', secret).update(`admin:${exp}.${nonce}`).digest();
  const given = Buffer.from(mac, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  return Number(exp) > Date.now();
}
