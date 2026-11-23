import { Modal } from './Modal';
import { SharePanel } from './SharePanel';
import { Countdown } from './Feedback';
import { Tile } from './Board';
import { ArchiveIcon, FlagWordIcon, RefreshIcon, StatsIcon } from './Icons';
import { lookupEntry } from '../data/dictionary';
import { CATEGORY_LABELS } from '../data/schema';
import { graphemes } from '../game/kurdish';
import type { GameState } from '../game/engine';
import type { Achievement } from '../game/achievements';
import { ckb as t } from '../i18n/ckb';
import { kuNum } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  game: GameState;
  highContrast: boolean;
  notify: (text: string, tone?: 'info' | 'error' | 'success') => void;
  achievements: Achievement[];
  onNewRound: () => void;
  onShowStats: () => void;
  onTryUnlimited: () => void;
  onReport: () => void;
  onArchive: () => void;
}

export function ResultModal({ open, onClose, game, highContrast, notify, achievements, onNewRound, onShowStats, onTryUnlimited, onReport, onArchive }: Props) {
  const won = game.status === 'won';
  const entry = lookupEntry(game.answer);
  const letters = graphemes(game.answer);
  const title = won ? t.winTitles[Math.min(game.guesses.length, 6) - 1] : t.loseTitle;

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-5 pt-1">
        <p className="text-[0.95rem] text-muted">
          {won ? t.winBody(kuNum(game.guesses.length)) : t.loseBody}
        </p>

        <section aria-label={t.theWordWas} className="rounded-2xl bg-surface-2 p-4">
          {!won && <p className="mb-2 text-sm font-bold text-muted">{t.theWordWas}:</p>}
          <div className="mx-auto grid max-w-[260px] grid-cols-5 gap-1.5 tile-grid [container-type:inline-size]" dir="rtl">
            {letters.map((l, i) => (
              <Tile key={i} letter={l} state={won ? 'correct' : 'absent'} anim="flip" index={i} />
            ))}
          </div>
          {entry?.definition && (
            <dl className="mt-4 space-y-1 text-[0.95rem]">
              <div className="flex gap-2">
                <dt className="shrink-0 font-bold text-brand">{t.meaning}:</dt>
                <dd>{entry.definition}</dd>
              </div>
              {entry.category && (
                <div className="flex gap-2 text-sm text-muted">
                  <dt className="shrink-0">{t.category}:</dt>
                  <dd>{CATEGORY_LABELS[entry.category]}</dd>
                </div>
              )}
            </dl>
          )}
        </section>

        {achievements.length > 0 && (
          <section aria-label={t.achievementUnlocked} className="flex flex-col gap-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-3 py-2">
                <span className="text-2xl" aria-hidden>{a.icon}</span>
                <span className="flex flex-col">
                  <span className="text-xs font-bold text-brand">{t.achievementUnlocked}</span>
                  <span className="text-sm font-extrabold">{a.title}</span>
                </span>
              </div>
            ))}
          </section>
        )}

        <SharePanel game={game} highContrast={highContrast} notify={notify} />

        {game.mode === 'daily' && (
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-line p-4 text-center">
            <span className="text-sm font-bold text-muted">{t.nextDaily}</span>
            <Countdown />
            <button type="button" onClick={onTryUnlimited} className="focus-ring mt-2 rounded-full px-3 py-1.5 text-sm font-bold text-brand hover:bg-surface-2">
              {t.tryUnlimited} ←
            </button>
          </div>
        )}
        {game.mode === 'unlimited' && (
          <button
            type="button"
            onClick={onNewRound}
            className="focus-ring flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-brand text-base font-extrabold text-brand transition hover:bg-brand hover:text-white"
          >
            <RefreshIcon />
            {t.playAgain}
          </button>
        )}
        {game.mode === 'archive' && (
          <button
            type="button"
            onClick={onArchive}
            className="focus-ring flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-brand text-base font-extrabold text-brand transition hover:bg-brand hover:text-white"
          >
            <ArchiveIcon />
            {t.archiveTitle}
          </button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-1">
          <button type="button" onClick={onShowStats} className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-surface-2 hover:text-fg">
            <StatsIcon width={18} height={18} />
            {t.stats}
          </button>
          <button type="button" onClick={onReport} className="focus-ring flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-muted hover:bg-surface-2 hover:text-fg">
            <FlagWordIcon width={17} height={17} />
            {t.reportThisWord}
          </button>
        </div>
      </div>
    </Modal>
  );
}
