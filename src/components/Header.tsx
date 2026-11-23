import type { ReactNode } from 'react';
import { Logo } from './Logo';
import { HelpIcon, MoonIcon, SettingsIcon, StatsIcon, SunIcon, CalendarIcon, InfinityIcon, RefreshIcon } from './Icons';
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
  onMode: (m: GameMode) => void;
  onNewRound: () => void;
  onShowResult: () => void;
}

export function ModeBar({ mode, daily, unlimited, onMode, onNewRound, onShowResult }: ModeBarProps) {
  const game = mode === 'daily' ? daily : unlimited;
  const tabs: Array<{ id: GameMode; icon: ReactNode; label: string; sub: string }> = [
    { id: 'daily', icon: <CalendarIcon width={16} height={16} />, label: t.modeDaily, sub: `#${kuNum(daily.puzzleNumber)}` },
    { id: 'unlimited', icon: <InfinityIcon width={16} height={16} />, label: t.modeUnlimited, sub: kuNum(unlimited.puzzleNumber) },
  ];
  return (
    <div className="mx-auto flex w-full max-w-[560px] items-center justify-between gap-2 px-3 pt-4">
      <div role="tablist" aria-label="جۆری یاری" className="flex gap-1 rounded-2xl border border-line bg-surface p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={mode === tab.id}
            onClick={() => onMode(tab.id)}
            className={`focus-ring flex h-8 items-center gap-1.5 rounded-xl px-3 text-[0.85rem] font-bold transition ${
              mode === tab.id ? 'bg-brand text-white shadow' : 'text-muted hover:text-fg'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <bdi dir="ltr" className={`text-[0.75rem] ${mode === tab.id ? 'text-white/80' : 'text-muted'}`}>{tab.sub}</bdi>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        {game.status !== 'playing' && (
          <button type="button" onClick={onShowResult} className="focus-ring h-8 rounded-xl px-3 text-[0.85rem] font-bold text-brand hover:bg-surface-2">
            {t.viewResult}
          </button>
        )}
        {mode === 'unlimited' && (
          <button
            type="button"
            onClick={onNewRound}
            aria-label={t.newGame}
            title={t.newGame}
            className="focus-ring grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-fg"
          >
            <RefreshIcon width={19} height={19} />
          </button>
        )}
      </div>
    </div>
  );
}
