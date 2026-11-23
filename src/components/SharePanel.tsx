import { useMemo, type ReactNode } from 'react';
import type { GameState } from '../game/engine';
import { buildShareText, copyToClipboard, shareUrl, type ShareTarget } from '../game/share';
import { CopyIcon, FacebookIcon, ShareIcon, TelegramIcon, WhatsAppIcon } from './Icons';
import { ckb as t } from '../i18n/ckb';

export const SITE_URL: string | undefined = import.meta.env.VITE_SITE_URL || undefined;

interface Props {
  game: GameState;
  highContrast: boolean;
  notify: (text: string, tone?: 'info' | 'error' | 'success') => void;
}

export function SharePanel({ game, highContrast, notify }: Props) {
  const text = useMemo(() => buildShareText(game, { highContrast, url: SITE_URL }), [game, highContrast]);
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    const ok = await copyToClipboard(text);
    notify(ok ? t.copied : t.copyFailed, ok ? 'success' : 'error');
  };

  const native = async () => {
    try {
      await navigator.share({ text });
    } catch (e) {
      // AbortError = user closed the sheet; anything else → fall back to copy.
      if ((e as DOMException)?.name !== 'AbortError') await copy();
    }
  };

  const open = (target: ShareTarget) => {
    const href = shareUrl(target, text, SITE_URL);
    if (!href) {
      void copy();
      notify(t.fbNeedsUrl, 'info');
      return;
    }
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const social: Array<{ id: ShareTarget; label: string; icon: ReactNode; cls: string }> = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, cls: 'bg-[#25D366] text-white' },
    { id: 'telegram', label: 'Telegram', icon: <TelegramIcon />, cls: 'bg-[#229ED9] text-white' },
    { id: 'facebook', label: 'Facebook', icon: <FacebookIcon />, cls: 'bg-[#1877F2] text-white' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={canNative ? native : copy}
        className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-extrabold text-white shadow-lg shadow-emerald-900/20 transition hover:brightness-110 active:scale-[0.99]"
        data-autofocus
      >
        <ShareIcon />
        {t.share}
      </button>
      <div className="flex items-center justify-center gap-2" aria-label={t.shareOn}>
        {social.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => open(s.id)}
            className={`focus-ring grid h-11 w-11 place-items-center rounded-full ${s.cls} transition hover:brightness-110 ${
              s.id === 'facebook' && !SITE_URL ? 'opacity-50' : ''
            }`}
            aria-label={`${t.shareOn} ${s.label}`}
            title={s.label}
          >
            {s.icon}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="focus-ring grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-fg transition hover:brightness-95"
          aria-label={t.copy}
          title={t.copy}
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}
