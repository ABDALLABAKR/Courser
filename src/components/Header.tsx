import type { ReactNode } from 'react';
import { Logo } from './Logo';
import {
  HelpIcon, MoonIcon, SettingsIcon, StatsIcon, SunIcon, CalendarIcon, InfinityIcon, RefreshIcon,
  ArchiveIcon, LightbulbIcon, TrophyIcon,
} from './Icons';
import type { GameMode, GameState } from '../game/engine';
import { ckb as t } from '../i18n/ckb';
import { kuNum } from '../i18n';

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="focus-ring grid h-10 w-10 place-items-center rounded-xl text-fg/80 transition hover:bg-surface-2 hover:text-fg active:scale-95"
    >
      {children}
    </button>
  );
}

interface HeaderProps {
  dark: boolean;
  onHelp: () => void;
  onStats: () => void;
  onSettings: () => void;
  onToggleTheme: () => void;
}

export function Header({ dark, onHelp, onStats, onSettings, onToggleTheme }: HeaderProps) {
  return (
    <header className="relative z-10 shrink-0 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-[58px] max-w-[560px] items-center justify-between px-3">
        <Logo />
        <nav className="flex items-center gap-0.5" aria-label="ئامرازەکان">
          <IconButton label={t.help} onClick={onHelp}><HelpIcon /></IconButton>
          <IconButton label={dark ? t.themeToLight : t.themeToDark} onClick={onToggleTheme}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </IconButton>
          <IconButton label={t.stats} onClick={onStats}><StatsIcon /></IconButton>
          <IconButton label={t.settings} onClick={onSettings}><SettingsIcon /></IconButton>
        </nav>
      </div>
      <div className="kilim absolute inset-x-0 -bottom-[7px] h-[7px]" aria-hidden />
    </header>
  );
}

interface ModeBarProps {
  mode: GameMode;
  daily: GameState;
  unlimited: GameState;
  archive: GameState | null;
  onMode: (m: GameMode) => void;
  onArchive: () => void;
  onNewRound: () => void;
  onShowResult: () => void;
  onHint: () => void;
  hintsLeft: number;
}

export function ModeBar({ mode, daily, unlimited, archive, onMode, onArchive, onNewRound, onShowResult, onHint, hintsLeft }: ModeBarProps) {
  const game = mode === 'daily' ? daily : mode === 'unlimited' ? unlimited : archive ?? daily;
  const tabs: Array<{ id: GameMode; icon: ReactNode; label: string; sub?: string }> = [
    { id: 'daily', icon: <CalendarIcon width={16} height={16} />, label: t.modeDaily, sub: `#${kuNum(daily.puzzleNumber)}` },
    { id: 'unlimited', icon: <InfinityIcon width={16} height={16} />, label: t.modeUnlimited, sub: kuNum(unlimited.puzzleNumber) },
    { id: 'archive', icon: <ArchiveIcon width={16} height={16} />, label: t.modeArchive, sub: archive ? `#${kuNum(archive.puzzleNumber)}` : undefined },
  ];
  const iconBtn =
    'focus-ring relative grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg disabled:opacity-40';
  return (
    <div className="mx-auto flex w-full max-w-[560px] items-center justify-between gap-1.5 px-3 pt-4">
      <div role="tablist" aria-label="جۆری یاری" className="flex min-w-0 gap-0.5 rounded-2xl border border-line bg-surface p-1 shadow-sm">
        {tabs.map((tab) => {
          const active = mode === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => (tab.id === 'archive' && (active || !archive) ? onArchive() : onMode(tab.id))}
              className={`focus-ring flex h-8 items-center gap-1 rounded-xl px-2 text-[0.82rem] font-bold whitespace-nowrap transition sm:gap-1.5 sm:px-3 ${
                active ? 'bg-brand text-white shadow' : 'text-muted hover:text-fg'
              }`}
            >
              <span className="hidden min-[400px]:inline">{tab.icon}</span>
              <span>{tab.label}</span>
              {active && tab.sub && (
                <bdi dir="ltr" className="text-[0.72rem] text-white/80">{tab.sub}</bdi>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex items-center">
        {game.status !== 'playing' && (
          <button type="button" onClick={onShowResult} aria-label={t.viewResult} title={t.viewResult} className={`${iconBtn} text-brand`}>
            <TrophyIcon width={19} height={19} />
          </button>
        )}
        {mode === 'unlimited' && game.status === 'playing' && (
          <button
            type="button"
            onClick={onHint}
            disabled={hintsLeft === 0}
            aria-label={hintsLeft ? t.hintLeft(kuNum(hintsLeft)) : t.hintNone}
            title={hintsLeft ? t.hintLeft(kuNum(hintsLeft)) : t.hintNone}
            className={iconBtn}
          >
            <LightbulbIcon width={19} height={19} />
            {hintsLeft > 0 && (
              <span className="absolute -top-0.5 -end-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-present px-1 text-[0.6rem] font-extrabold text-white">
                {kuNum(hintsLeft)}
              </span>
            )}
          </button>
        )}
        {mode === 'unlimited' && (
          <button type="button" onClick={onNewRound} aria-label={t.newGame} title={t.newGame} className={iconBtn}>
            <RefreshIcon width={19} height={19} />
          </button>
        )}
      </div>
    </div>
  );
}
