import { useState } from 'react';
import { Modal } from './Modal';
import { Countdown } from './Feedback';
import { ACHIEVEMENTS } from '../game/achievements';
import { effectiveDailyStreak, winRate, type ModeStats, type Stats } from '../game/stats';
import type { GameState } from '../game/engine';
import { ckb as t } from '../i18n/ckb';
import { kuNum } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  stats: Stats;
  unlocked: string[];
  todayPuzzle: number;
  initialTab: 'daily' | 'unlimited';
  daily: GameState;
}

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl bg-surface-2 px-1 py-3 text-center">
      <span className="text-2xl font-extrabold tabular-nums">{value}</span>
      <span className="text-[0.72rem] leading-tight text-muted">{label}</span>
    </div>
  );
}

function Distribution({ s, highlight }: { s: ModeStats; highlight?: number }) {
  const max = Math.max(1, ...s.distribution);
  return (
    <ol className="flex flex-col gap-1.5">
      {s.distribution.map((n, i) => {
        const pct = Math.max(8, Math.round((n / max) * 100));
        const hot = highlight === i + 1;
        return (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span className="w-4 text-center font-bold tabular-nums">{kuNum(i + 1)}</span>
            <div className="flex-1">
              <div
                className={`flex h-6 items-center justify-end rounded-md px-2 text-xs font-extrabold text-white transition-[width] duration-500 ${
                  hot ? 'bg-correct' : 'bg-absent'
                }`}
                style={{ width: `${pct}%` }}
              >
                {kuNum(n)}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function StatsModal({ open, onClose, stats, unlocked, todayPuzzle, initialTab, daily }: Props) {
  const [tab, setTab] = useState<'daily' | 'unlimited'>(initialTab);
  const s: ModeStats = tab === 'daily' ? stats.daily : stats.unlimited;
  const streak = tab === 'daily' ? effectiveDailyStreak(stats.daily, todayPuzzle) : stats.unlimited.currentStreak;
  const dailyHighlight =
    tab === 'daily' && daily.status === 'won' && daily.puzzleNumber === todayPuzzle ? daily.guesses.length : undefined;

  return (
    <Modal open={open} onClose={onClose} title={t.stats}>
      <div className="flex flex-col gap-5 pt-1">
        <div role="tablist" aria-label={t.stats} className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1">
          {(['daily', 'unlimited'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={tab === m}
              onClick={() => setTab(m)}
              className={`focus-ring h-9 rounded-xl text-sm font-bold transition ${
                tab === m ? 'bg-surface text-fg shadow' : 'text-muted hover:text-fg'
              }`}
            >
              {m === 'daily' ? t.dailyChallenge : t.unlimitedMode}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-1.5" role="tabpanel">
          <StatTile value={kuNum(s.played)} label={t.played} />
          <StatTile value={kuNum(s.wins)} label={t.wins} />
          <StatTile value={`${kuNum(winRate(s))}٪`} label={t.winPct} />
          <StatTile value={kuNum(streak)} label={t.currentStreak} />
          <StatTile value={kuNum(s.maxStreak)} label={t.maxStreak} />
        </div>

        <section>
          <h3 className="mb-2 text-sm font-extrabold">{t.distribution}</h3>
          {s.played === 0 ? <p className="text-sm text-muted">{t.noGames}</p> : <Distribution s={s} highlight={dailyHighlight} />}
        </section>

        {tab === 'daily' && (
          <>
            {daily.status !== 'playing' && (
              <div className="flex flex-col items-center gap-1 rounded-2xl border border-line p-3 text-center">
                <span className="text-sm font-bold text-muted">{t.nextDaily}</span>
                <Countdown />
              </div>
            )}
            <section>
              <h3 className="mb-2 text-sm font-extrabold">{t.history}</h3>
              {stats.daily.history.length === 0 ? (
                <p className="text-sm text-muted">{t.noHistory}</p>
              ) : (
                <ul className="flex max-h-44 flex-col divide-y divide-line overflow-y-auto rounded-2xl border border-line text-sm">
                  {stats.daily.history.slice(0, 60).map((h) => (
                    <li key={h.puzzle} className="flex items-center justify-between gap-2 px-3 py-2">
                      <bdi dir="ltr" className="font-bold">#{kuNum(h.puzzle)}</bdi>
                      <span className="latin text-xs text-muted">{h.date}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${h.won ? 'bg-correct' : 'bg-absent'}`}>
                        {h.won ? `${t.won} · ${kuNum(h.guesses)}/${kuNum(6)}` : t.lost}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        <section>
          <h3 className="mb-2 text-sm font-extrabold">
            {t.achievements} <span className="text-muted">({kuNum(unlocked.length)}/{kuNum(ACHIEVEMENTS.length)})</span>
          </h3>
          <ul className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const have = unlocked.includes(a.id);
              return (
                <li
                  key={a.id}
                  className={`flex items-start gap-2 rounded-2xl border p-2.5 ${have ? 'border-brand/40 bg-brand/10' : 'border-line opacity-55 grayscale'}`}
                >
                  <span className="text-xl leading-none" aria-hidden>{a.icon}</span>
                  <span className="flex flex-col">
                    <span className="text-[0.8rem] font-extrabold">{a.title}</span>
                    <span className="text-[0.7rem] leading-snug text-muted">{a.description}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Modal>
  );
}
