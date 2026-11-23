import { useCallback, useEffect, useRef, useState } from 'react';
import { Header, ModeBar } from './components/Header';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { Confetti, Toasts, useToasts } from './components/Feedback';
import { HelpModal } from './components/HelpModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { ResultModal } from './components/ResultModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ArchiveModal } from './components/ArchiveModal';
import { ReportModal } from './components/ReportModal';
import type { ReportType } from './lib/report';
import { useSettings } from './hooks/useSettings';
import { useGameStore } from './hooks/useGameStore';
import { dailyNumber } from './game/daily';
import { LATIN_TO_SORANI, extractLetters } from './game/kurdish';
import { MAX_HINTS, type GameMode } from './game/engine';
import { graphemes } from './game/kurdish';
import type { Achievement } from './game/achievements';
import { play } from './lib/sound';
import { clearAll, load, save } from './lib/storage';
import { ckb as t } from './i18n/ckb';
import { kuNum } from './i18n';

type ModalId = 'help' | 'stats' | 'settings' | 'result' | 'confirm-new' | 'confirm-reset' | 'archive' | 'report' | null;

const FLIP_STAGGER = 260;
const FLIP_DURATION = 520;
const REVEAL_MS = FLIP_STAGGER * 4 + FLIP_DURATION + 60;

export default function App() {
  const { settings, update, dark, motion, reducedMotion } = useSettings();
  const revealMs = motion ? REVEAL_MS : 0;
  const store = useGameStore(revealMs, settings.hardMode);
  const { game, mode } = store;
  const { toasts, push } = useToasts();

  const [modal, setModal] = useState<ModalId>(null);
  const [onboarding, setOnboarding] = useState(() => !load('onboarded', false));
  const [statsTab, setStatsTab] = useState<'daily' | 'unlimited'>(mode === 'unlimited' ? 'unlimited' : 'daily');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [report, setReport] = useState<{ word: string; type: ReportType }>({ word: '', type: 'missing' });
  const [shake, setShake] = useState(false);
  const [confetti, setConfetti] = useState(0);
  const [winBounce, setWinBounce] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [freshAchievements, setFreshAchievements] = useState<Achievement[]>([]);
  const timers = useRef<number[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const sfx = useCallback((e: Parameters<typeof play>[0]) => settings.sound && play(e), [settings.sound]);

  // First visit → tutorial. Returning to a finished game → show the result.
  useEffect(() => {
    if (onboarding) setModal('help');
    else if (game.status !== 'playing') later(() => setModal((m) => m ?? 'result'), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notify = useCallback((text: string, tone?: 'info' | 'error' | 'success') => push(text, { tone }), [push]);

  const onLetter = useCallback(
    (l: string) => {
      if (store.type(l)) sfx('key');
    },
    [store, sfx],
  );

  const onBackspace = useCallback(() => {
    if (store.backspace()) sfx('delete');
  }, [store, sfx]);

  const onEnter = useCallback(() => {
    if (game.status !== 'playing') {
      setModal('result');
      return;
    }
    const out = store.submit();
    if (out.error) {
      if (out.error === 'not-playing') return;
      setShake(true);
      later(() => setShake(false), 500);
      sfx('error');
      const msg =
        out.error === 'too-short'
          ? t.errTooShort
          : out.error === 'not-in-list'
            ? t.errNotInList
            : out.error === 'hard-green'
              ? t.errHardGreen(out.letter ?? '', kuNum((out.position ?? 0) + 1))
              : t.errHardPresent(out.letter ?? '');
      push(msg, { tone: 'error' });
      if (out.error === 'not-in-list') {
        const word = game.current.join('');
        setSuggestion(word);
        later(() => setSuggestion((w) => (w === word ? null : w)), 6000);
      }
      return;
    }
    if (settings.sound) for (let i = 0; i < 5; i++) later(() => play('flip'), motion ? i * FLIP_STAGGER + FLIP_DURATION / 2 : 0);

    const row = game.current.join('');
    later(() => setAnnounce(row), revealMs);

    if (!out.finished) return;
    setFreshAchievements(out.unlocked ?? []);
  }, [game, store, sfx, push, later, settings.sound, motion, revealMs]);

  // React to a round finishing: celebration / reveal, then open the result.
  const roundKey = `${mode}-${game.puzzleNumber}`;
  const prevStatus = useRef(game.status);
  const prevRound = useRef(roundKey);
  useEffect(() => {
    const sameRound = prevRound.current === roundKey;
    const justFinished = sameRound && prevStatus.current === 'playing' && game.status !== 'playing';
    prevStatus.current = game.status;
    prevRound.current = roundKey;
    if (!justFinished) return;
    later(() => {
      if (game.status === 'won') {
        sfx('win');
        setWinBounce(true);
        later(() => setWinBounce(false), 1400);
        if (motion) setConfetti((c) => c + 1);
      } else {
        sfx('lose');
        push(`${t.theWordWas}: ${game.answer}`, { ms: 1400 });
      }
      later(() => setModal('result'), game.status === 'won' ? 1300 : 1500);
    }, revealMs);
  }, [game.status, game.answer, roundKey, later, motion, push, revealMs, sfx]);

  // Physical keyboard + paste support.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (modal || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === 'Enter') {
        if (el?.tagName === 'BUTTON') return; // let the focused button activate
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onBackspace();
      } else if (e.key.length <= 2) {
        const [kurdish] = extractLetters(e.key);
        const letter = kurdish ?? (settings.latinKeys ? LATIN_TO_SORANI[e.key] : undefined);
        if (letter) {
          e.preventDefault();
          onLetter(letter);
        }
      }
    };
    const onPaste = (e: ClipboardEvent) => {
      if (modal) return;
      const text = e.clipboardData?.getData('text') ?? '';
      if (text) {
        e.preventDefault();
        store.paste(text);
      }
    };
    // Clicking/tapping a game button must not steal focus, otherwise a later
    // physical Enter would re-activate that button instead of submitting.
    // Keyboard (Tab) focus is unaffected, so on-screen keys stay accessible.
    const onMouseDown = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest('button');
      if (btn && !btn.closest('[role="dialog"]')) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('paste', onPaste);
    window.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('paste', onPaste);
      window.removeEventListener('mousedown', onMouseDown);
    };
  }, [modal, onEnter, onBackspace, onLetter, settings.latinKeys, store]);

  const closeHelp = () => {
    setModal(null);
    if (onboarding) {
      setOnboarding(false);
      save('onboarded', true);
    }
  };

  const requestNewRound = () => {
    if (store.unlimited.status === 'playing' && store.unlimited.guesses.length > 0) setModal('confirm-new');
    else startNewRound();
  };
  const startNewRound = () => {
    setFreshAchievements([]);
    store.newUnlimitedRound();
    setModal(null);
  };

  const switchMode = (m: GameMode) => {
    if (m === mode) return;
    store.setMode(m);
    if (m !== 'archive') setStatsTab(m);
    setFreshAchievements([]);
    setSuggestion(null);
  };

  const openStats = () => {
    setStatsTab(mode === 'unlimited' ? 'unlimited' : 'daily');
    setModal('stats');
  };

  const pickArchive = (n: number) => {
    store.openArchive(n);
    setFreshAchievements([]);
    setSuggestion(null);
    setModal(null);
  };

  const onHint = () => {
    const pos = store.hint();
    if (pos === null) return;
    const letter = graphemes(store.unlimited.answer)[pos];
    push(`💡 ${t.hintRevealed(kuNum(pos + 1), letter)}`, { tone: 'info', ms: 2200 });
  };

  const openReport = (word: string, type: ReportType) => {
    setReport({ word, type });
    setModal('report');
  };

  const hintsLeft = mode === 'unlimited' ? MAX_HINTS - (store.unlimited.hints?.length ?? 0) : 0;

  const todayPuzzle = Math.max(1, dailyNumber());

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div className="pattern-bg" aria-hidden />
      <Header
        dark={dark}
        onHelp={() => setModal('help')}
        onStats={openStats}
        onSettings={() => setModal('settings')}
        onToggleTheme={() => update('theme', dark ? 'light' : 'dark')}
      />

      <main className="relative flex min-h-0 flex-1 flex-col">
        <ModeBar
          mode={mode}
          daily={store.daily}
          unlimited={store.unlimited}
          archive={store.archive}
          onMode={switchMode}
          onArchive={() => setModal('archive')}
          onNewRound={requestNewRound}
          onShowResult={() => setModal('result')}
          onHint={onHint}
          hintsLeft={hintsLeft}
        />
        <h1 className="sr-only-live">
          {t.appName} —{' '}
          {mode === 'daily'
            ? `${t.dailyChallenge} ${t.puzzleNo(kuNum(store.daily.puzzleNumber))}`
            : mode === 'archive'
              ? `${t.archive} ${t.puzzleNo(kuNum(game.puzzleNumber))}`
              : t.unlimitedMode}
        </h1>

        <div className="board-wrap relative flex min-h-0 flex-1 items-center justify-center py-2">
          <Board game={game} revealRow={store.reveal?.row ?? null} shakeRow={shake} winBounce={winBounce} />
          {suggestion && (
            <button
              type="button"
              onClick={() => openReport(suggestion, 'missing')}
              className="focus-ring toast absolute bottom-1 left-1/2 z-10 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-bold whitespace-nowrap text-brand shadow-lg"
            >
              ＋ {t.suggestWord(suggestion)}
            </button>
          )}
        </div>

        <Keyboard keyStates={store.keyStates} onLetter={onLetter} onEnter={onEnter} onBackspace={onBackspace} />
      </main>

      <div className="sr-only-live" aria-live="polite">{announce}</div>
      <Toasts toasts={toasts} />
      <Confetti fire={confetti} />

      <HelpModal open={modal === 'help'} onClose={closeHelp} onboarding={onboarding} />
      <StatsModal
        key={`stats-${statsTab}-${modal === 'stats'}`}
        open={modal === 'stats'}
        onClose={() => setModal(null)}
        stats={store.stats}
        unlocked={store.unlocked}
        todayPuzzle={todayPuzzle}
        initialTab={statsTab}
        daily={store.daily}
      />
      <SettingsModal
        open={modal === 'settings'}
        onClose={() => setModal(null)}
        settings={settings}
        reducedMotion={reducedMotion}
        update={update}
        onHelp={() => setModal('help')}
        onReset={() => setModal('confirm-reset')}
        onReport={() => openReport('', 'missing')}
        hardLocked={game.status === 'playing' && game.guesses.length > 0 && !game.hard}
      />
      {game.status !== 'playing' && (
        <ResultModal
          open={modal === 'result'}
          onClose={() => setModal(null)}
          game={game}
          highContrast={settings.highContrast}
          notify={notify}
          achievements={freshAchievements}
          onNewRound={startNewRound}
          onShowStats={openStats}
          onTryUnlimited={() => {
            switchMode('unlimited');
            setModal(null);
          }}
          onReport={() => openReport(game.answer, 'wrong')}
          onArchive={() => setModal('archive')}
        />
      )}
      <ArchiveModal
        open={modal === 'archive'}
        onClose={() => setModal(null)}
        today={todayPuzzle}
        archiveGames={store.archiveGames}
        history={store.stats.daily.history}
        onPick={pickArchive}
      />
      <ReportModal
        open={modal === 'report'}
        onClose={() => setModal(null)}
        initialWord={report.word}
        initialType={report.type}
        context={`${mode} #${game.puzzleNumber}`}
        onSent={() => {
          setModal(null);
          push(t.reportThanks, { tone: 'success' });
        }}
      />
      <ConfirmDialog
        open={modal === 'confirm-new'}
        title={t.confirmNewTitle}
        body={t.confirmNewBody}
        confirmLabel={t.confirmYes}
        onConfirm={startNewRound}
        onCancel={() => setModal(null)}
      />
      <ConfirmDialog
        open={modal === 'confirm-reset'}
        title={t.resetData}
        body={t.resetDataConfirm}
        confirmLabel={t.confirmDelete}
        danger
        onConfirm={() => {
          clearAll(['settings', 'onboarded']);
          store.resetAll();
          setModal(null);
        }}
        onCancel={() => setModal('settings')}
      />
    </div>
  );
}
