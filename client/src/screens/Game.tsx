import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { RoomView } from '@wene/shared';
import { actions } from '../lib/net';
import { useT } from '../lib/i18n';
import { Avatar } from '../components/Avatar';
import { IconLogout, IconSettings, IconUsers, IconChat } from '../components/Icons';
import { IconButton } from '../components/ui';
import { DrawingCanvas, Toolbar, type ToolState } from '../game/Canvas';
import { Chat, FloatingReactions, GuessCelebration, PlayerList, ReactionBar, TimerRing, WordDisplay, useCountdown } from '../game/widgets';
import { ui } from '../lib/ui';

const mq = typeof matchMedia !== 'undefined' ? matchMedia('(min-width: 1024px)') : null;
const useDesktop = () => useSyncExternalStore((cb) => { mq?.addEventListener('change', cb); return () => mq?.removeEventListener('change', cb); }, () => !!mq?.matches);

export function GameScreen({ view }: { view: RoomView }) {
  const t = useT();
  const desktop = useDesktop();
  const isArtist = view.artistId === view.you;
  const [tools, setTools] = useState<ToolState>({ tool: 'brush', color: '#18243B', size: 10 });
  const [mobileTab, setMobileTab] = useState<'chat' | 'players'>('chat');
  const total = view.phase === 'drawing' ? view.settings.drawTime * 1000 : view.phase === 'choosing' ? 15000 : 7000;

  useEffect(() => { if (view.phase === 'choosing') setTools((s) => ({ ...s, tool: 'brush' })); }, [view.phase]);

  return (
    <div className="app-h mx-auto flex max-w-[1400px] flex-col gap-2 p-2 sm:p-3">
      {/* top bar */}
      <header className="card flex items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3">
        <TimerRing endsAt={view.endsAt} total={total} tick={view.phase === 'drawing'} />
        <div className="hidden shrink-0 flex-col sm:flex">
          <span className="text-muted text-xs font-bold">{t('roundOf', { r: view.round, n: view.settings.rounds })}</span>
          <span className="font-display text-sm font-bold tracking-widest ltr">{view.code}</span>
        </div>
        <div className="min-w-0 flex-1"><WordDisplay view={view} /></div>
        <span className="text-muted text-xs font-bold sm:hidden">{t.n(view.round)}/{t.n(view.settings.rounds)}</span>
        <IconButton label={t('settings')} onClick={() => ui.set({ settingsOpen: true })}><IconSettings /></IconButton>
        <IconButton label={t('leave')} onClick={() => { if (confirm(t('leaveConfirm'))) actions.leave(); }}><IconLogout /></IconButton>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 lg:flex-row">
        {/* players (desktop) */}
        {desktop && (
          <aside className="card flex w-60 shrink-0 flex-col p-2">
            <PlayerList view={view} />
          </aside>
        )}

        {/* canvas column */}
        <main className="flex min-h-0 min-w-0 flex-col items-center gap-2 lg:flex-1">
          <div className="relative w-full lg:max-w-[calc((var(--vvh)-230px)*4/3)]" style={{ aspectRatio: '4 / 3' }}>
            <div className="card absolute inset-0 overflow-hidden p-1">
              <DrawingCanvas canDraw={view.canDraw} tools={tools} />
            </div>
            <FloatingReactions view={view} />
            <AnimatePresence mode="wait">
              {view.phase === 'choosing' && <ChoosingOverlay key="choose" view={view} />}
              {view.phase === 'turnEnd' && view.lastTurn && <TurnEndOverlay key="end" view={view} />}
            </AnimatePresence>
          </div>
          {isArtist && view.phase === 'drawing' ? <Toolbar tools={tools} setTools={setTools} /> : <div className="w-full"><ReactionBar /></div>}
        </main>

        {/* chat (desktop) */}
        {desktop && (
          <aside className="flex w-80 shrink-0 flex-col">
            <Chat view={view} className="flex-1" />
          </aside>
        )}

        {/* mobile: tabs for chat / players */}
        {!desktop && <div className="flex min-h-[220px] flex-1 flex-col gap-1.5">
          <div className="flex gap-1.5">
            <button onClick={() => setMobileTab('chat')} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${mobileTab === 'chat' ? 'bg-teal text-white' : 'surface-2'}`}><IconChat size={18} /> {t('chat')}</button>
            <button onClick={() => setMobileTab('players')} className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-bold ${mobileTab === 'players' ? 'bg-teal text-white' : 'surface-2'}`}><IconUsers size={18} /> {t('players')} ({t.n(view.players.length)})</button>
          </div>
          {mobileTab === 'chat' ? <Chat view={view} className="flex-1" /> : <div className="card flex min-h-0 flex-1 flex-col p-2"><PlayerList view={view} compact /></div>}
        </div>}
      </div>
      <GuessCelebration />
    </div>
  );
}

const overlay = 'absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 overflow-y-auto rounded-3xl bg-navy/80 p-3 text-white backdrop-blur-[2px]';

function ChoosingOverlay({ view }: { view: RoomView }) {
  const t = useT();
  const left = useCountdown(view.endsAt);
  const artist = view.players.find((p) => p.id === view.artistId);
  const diffColor = { easy: 'bg-leaf', medium: 'bg-sun text-navy', hard: 'bg-coral' } as const;
  return (
    <motion.div className={overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {view.choices ? (
        <>
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <div className="text-2xl font-black sm:text-3xl">{t('youDraw')}</div>
            <div className="font-bold opacity-80">{t('chooseWord')} ({t.n(Math.ceil(left / 1000))})</div>
          </motion.div>
          <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
            {view.choices.map((c, i) => (
              <motion.button key={c.word} onClick={() => actions.choose(i)}
                initial={{ y: 30, opacity: 0, rotate: i === 1 ? 0 : i === 0 ? 3 : -3 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 * i, type: 'spring', stiffness: 300, damping: 18 }}
                whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.96 }}
                className="btn3d flex items-center justify-between gap-2 bg-white px-4 py-3 text-navy sm:flex-col sm:py-5" style={{ ['--edge' as string]: '#B8C6D6' }}>
                <span className="text-2xl font-black sm:text-3xl" dir="rtl">{c.word}</span>
                <span className="flex flex-col items-end gap-1 sm:items-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white ${diffColor[c.difficulty]}`}>{t(`diff_${c.difficulty}`)}</span>
                  {c.meaning && <span className="text-muted text-xs ltr">{c.meaning}</span>}
                </span>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div className="flex flex-col items-center gap-3 text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          {artist && <div className="anim-bob"><Avatar a={artist.avatar} size={96} /></div>}
          <div className="text-xl font-black sm:text-2xl">{t('isChoosing', { name: artist?.name ?? '' })}</div>
          <div className="text-4xl font-black text-sun">{t.n(Math.ceil(left / 1000))}</div>
        </motion.div>
      )}
    </motion.div>
  );
}

function TurnEndOverlay({ view }: { view: RoomView }) {
  const t = useT();
  const lt = view.lastTurn!;
  const artist = view.players.find((p) => p.id === lt.artistId);
  const rows = [...view.players].sort((a, b) => (lt.roundEnded ? b.score - a.score : (lt.gains[b.id] ?? 0) - (lt.gains[a.id] ?? 0)));
  return (
    <motion.div className={overlay} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
      <div className="text-center">
        <div className="font-bold opacity-80">{t(`reason_${lt.reason}`)}</div>
        <div className="text-sm opacity-70">{t('wordWas')}</div>
        <motion.div className="text-4xl font-black text-sun sm:text-5xl" dir="rtl" initial={{ scale: 0.4, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>
          {lt.word}
        </motion.div>
        {lt.meaning && <div className="text-sm opacity-70 ltr">{lt.meaning}</div>}
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-1 text-center text-sm font-extrabold opacity-90">{lt.roundEnded ? t('roundResults', { r: view.round }) : t('turnResults')}</div>
        <ul className="space-y-1">
          {rows.slice(0, 8).map((p, i) => (
            <motion.li key={p.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-2 py-1">
              {lt.roundEnded && <span className="w-5 text-center font-black text-sun">{t.n(i + 1)}</span>}
              <Avatar a={p.avatar} size={28} />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}{p.id === artist?.id ? ' 🖌️' : ''}</span>
              <span className={`text-sm font-black ${(lt.gains[p.id] ?? 0) > 0 ? 'text-[#7CF29C]' : 'opacity-60'}`}>+{t.n(lt.gains[p.id] ?? 0)}</span>
              {lt.roundEnded && <span className="w-14 text-end text-sm font-black">{t.n(p.score)}</span>}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
