import type { LetterState } from './evaluate';
import type { GameState } from './engine';
import { MAX_GUESSES } from '../data/dictionary';

const LRM = '‎';

const EMOJI: Record<LetterState, string> = { correct: '🟩', present: '🟨', absent: '⬛' };
const EMOJI_HC: Record<LetterState, string> = { correct: '🟧', present: '🟦', absent: '⬛' };

/**
 * One emoji row per guess.
 *
 * The board is right-to-left: the FIRST letter sits on the RIGHT. Messaging
 * apps decide line direction on their own, and a line of emoji alone has no
 * direction, so we (1) reverse the row and (2) wrap it in LEFT-TO-RIGHT MARKs.
 * Under the Unicode Bidi Algorithm that forces an LTR run in both LTR and RTL
 * paragraphs, so the shared grid looks exactly like the board on screen.
 */
export function emojiRow(states: readonly LetterState[], highContrast = false): string {
  const map = highContrast ? EMOJI_HC : EMOJI;
  return LRM + [...states].reverse().map((s) => map[s]).join('') + LRM;
}

export interface ShareOptions {
  highContrast?: boolean;
  url?: string;
}

/** Build the share text. Never includes the answer or the guessed letters. */
export function buildShareText(game: GameState, opts: ShareOptions = {}): string {
  const score = game.status === 'won' ? String(game.guesses.length) : 'X';
  const title =
    game.mode === 'daily' ? `وشەی ڕۆژ #${game.puzzleNumber}` : 'وشە — یاریی بێسنوور';
  const lines = [
    'وشە | WUSHA',
    title,
    `${LRM}${score}/${MAX_GUESSES}${LRM}`,
    '',
    ...game.guesses.map((g) => emojiRow(g.states, opts.highContrast)),
  ];
  if (opts.url) lines.push('', opts.url);
  return lines.join('\n');
}

export type ShareTarget = 'whatsapp' | 'telegram' | 'facebook';

export function shareUrl(target: ShareTarget, text: string, url?: string): string | null {
  const t = encodeURIComponent(text);
  switch (target) {
    case 'whatsapp':
      return `https://wa.me/?text=${t}`;
    case 'telegram':
      // Telegram requires a url param; the text already contains the link.
      return `https://t.me/share/url?url=${encodeURIComponent(url ?? ' ')}&text=${t}`;
    case 'facebook':
      // Facebook only shares links (it ignores pre-filled text).
      return url ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` : null;
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
