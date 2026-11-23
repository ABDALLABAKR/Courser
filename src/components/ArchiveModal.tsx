import { Modal } from './Modal';
import type { GameState } from '../game/engine';
import type { DailyHistoryItem } from '../game/stats';
import { DAILY_EPOCH } from '../data/daily';
import { ckb as t } from '../i18n/ckb';
import { kuNum } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  today: number;
  archiveGames: Record<number, GameState>;
  history: DailyHistoryItem[];
  onPick: (n: number) => void;
}

function dateOf(n: number): string {
  const [y, m, d] = DAILY_EPOCH.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n - 1));
  return dt.toISOString().slice(0, 10);
}

export function ArchiveModal({ open, onClose, today, archiveGames, history, onPick }: Props) {
  const asDaily = new Map(history.map((h) => [h.puzzle, h]));
  const numbers = Array.from({ length: Math.max(0, today - 1) }, (_, i) => today - 1 - i);

  return (
    <Modal open={open} onClose={onClose} title={t.archiveTitle}>
      <p className="pb-3 text-sm text-muted">{t.archiveIntro}</p>
      {numbers.length === 0 ? (
        <p className="pb-4 text-sm text-muted">{t.archiveEmpty}</p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 pb-2 sm:grid-cols-4">
          {numbers.map((n) => {
            const g = archiveGames[n];
            const d = asDaily.get(n);
            const status: 'won' | 'lost' | 'playing' | 'none' = g
              ? g.status === 'playing'
                ? g.guesses.length > 0 ? 'playing' : 'none'
                : g.status
              : 'none';
            const cls =
              status === 'won'
                ? 'border-correct bg-correct text-white'
                : status === 'lost'
                  ? 'border-absent bg-absent text-white'
                  : status === 'playing'
                    ? 'border-present border-dashed'
                    : 'border-line bg-surface';
            const sub =
              status === 'won'
                ? `${kuNum(g!.guesses.length)}/${kuNum(6)}`
                : status === 'lost'
                  ? 'X'
                  : status === 'playing'
                    ? t.archiveInProgress
                    : d
                      ? `${t.archivePlayedAsDaily} ${d.won ? '✓' : '✗'}`
                      : t.archiveNotPlayed;
            return (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => onPick(n)}
                  className={`focus-ring flex w-full flex-col items-center gap-0.5 rounded-2xl border-2 px-1 py-2 transition hover:brightness-105 active:scale-[0.98] ${cls}`}
                >
                  <bdi dir="ltr" className="text-base font-extrabold">#{kuNum(n)}</bdi>
                  <span className="latin text-[0.62rem] opacity-75">{dateOf(n)}</span>
                  <span className="text-[0.68rem] font-bold opacity-90">{sub}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
