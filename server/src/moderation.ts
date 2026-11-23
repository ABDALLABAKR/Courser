import { answerKey, normalizeKurdish, NAME_MAX, CHAT_MAX } from '@wene/shared';

/**
 * A deliberately small built-in English list. Kurdish terms are NOT invented here:
 * administrators add them through Admin → Moderation (stored in the database).
 */
const BUILTIN_BLOCKED = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'nigga', 'faggot', 'whore', 'slut', 'nazi', 'hitler', 'admin', 'moderator'];

const CONTROL = /[\u0000-\u001F\u007F-\u009F‪-‮⁦-⁩]/g;

export class Moderation {
  private terms: string[] = [];
  constructor(private loadTerms: () => string[]) { this.reload(); }
  reload() { this.terms = [...BUILTIN_BLOCKED, ...this.loadTerms()].map(answerKey).filter(Boolean); }

  containsBlocked(text: string) {
    const k = answerKey(text).replace(/[0@]/g, 'o').replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/\$/g, 's');
    return this.terms.some((t) => k.includes(t));
  }

  /** Returns a clean nickname or null when unacceptable. */
  cleanName(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const s = normalizeKurdish(raw.replace(CONTROL, '')).slice(0, NAME_MAX).trim();
    if (s.length < 2 || !/[\p{L}\p{N}]/u.test(s)) return null;
    if (this.containsBlocked(s)) return null;
    return s;
  }

  /** Clean chat text. Rendering is done as text nodes on the client, so no HTML escaping is needed here, but we strip control chars & limit length. */
  cleanChat(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const s = raw.replace(CONTROL, '').replace(/\s+/g, ' ').trim();
    if (!s || s.length > CHAT_MAX) return null;
    return s;
  }

  /** Mask blocked terms in chat by replacing message with asterisks. */
  maskChat(text: string) { return this.containsBlocked(text) ? '✱✱✱' : text; }
}
