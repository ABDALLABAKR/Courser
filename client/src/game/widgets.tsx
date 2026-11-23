import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChatMessage, PlayerView, RoomView } from '@wene/shared';
import { REACTIONS } from '@wene/shared';
import { actions, game, notify, serverNow, useGame } from '../lib/net';
import { useT } from '../lib/i18n';
import { usePrefs, prefs } from '../lib/prefs';
import { play } from '../lib/sound';
import { Avatar } from '../components/Avatar';
import { IconBrush, IconCheck, IconCrown, IconFlag, IconKeyboard, IconMute, IconSend, IconVolume, IconX } from '../components/Icons';
import { Button, IconButton, Modal, inputCls } from '../components/ui';
import { KurdishKeyboard } from '../components/KurdishKeyboard';

// ------------------------------------------------------------------ countdown
export function useCountdown(endsAt: number | null, tickSound = false) {
  const [left, setLeft] = useState(() => (endsAt ? Math.max(0, endsAt - serverNow()) : 0));
  const lastSec = useRef(-1);
  useEffect(() => {
    if (!endsAt) { setLeft(0); return; }
    const tick = () => {
      const l = Math.max(0, endsAt - serverNow());
      setLeft(l);
      const s = Math.ceil(l / 1000);
      if (tickSound && s <= 10 && s > 0 && s !== lastSec.current) play('tick');
      lastSec.current = s;
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt, tickSound]);
  return left;
}

export function TimerRing({ endsAt, total, tick }: { endsAt: number | null; total: number; tick?: boolean }) {
  const t = useT();
  const left = useCountdown(endsAt, tick);
  const secs = Math.ceil(left / 1000);
  const f = total > 0 ? Math.min(1, left / total) : 0;
  const danger = secs <= 10 && endsAt;
  const C = 2 * Math.PI * 22;
  return (
    <div className={`relative h-14 w-14 shrink-0 ${danger ? 'anim-wiggle' : ''}`} role="timer" aria-live="off" aria-label={`${secs}`}>
      <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
        <circle cx="26" cy="26" r="22" fill="var(--surface)" stroke="var(--line)" strokeWidth="5" />
        <circle cx="26" cy="26" r="22" fill="none" stroke={danger ? '#FF746A' : '#20C5C5'} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - f)} style={{ transition: 'stroke-dashoffset .25s linear' }} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-lg font-black ${danger ? 'text-coral' : ''}`}>{t.n(secs)}</span>
    </div>
  );
}

// ------------------------------------------------------------------ word display
export function WordDisplay({ view }: { view: RoomView }) {
  const t = useT();
  if (view.phase === 'choosing') {
    const artist = view.players.find((p) => p.id === view.artistId);
    return <div className="text-muted truncate text-center font-bold">{view.artistId === view.you ? t('chooseWord') : t('isChoosing', { name: artist?.name ?? '' })}</div>;
  }
  if (view.phase !== 'drawing' || !view.wordMask) return null;
  const isArtist = view.artistId === view.you;
  if (view.word) {
    return (
      <div className="flex min-w-0 flex-col items-center">
        <div className="text-muted text-xs font-bold">{isArtist ? t('drawThis') : t('guessed')} ✓</div>
        <div className="truncate text-2xl font-black text-teal-dark dark:text-teal" dir="rtl">{view.word}</div>
      </div>
    );
  }
  const letters = view.wordMask.filter((c) => c !== ' ').length;
  return (
    <div className="flex min-w-0 flex-col items-center">
      <div className="text-muted text-xs font-bold">{t('guessTheWord')} · {t('letters', { n: letters })}</div>
      <div className="flex flex-wrap justify-center gap-1" dir="rtl" aria-label={t('letters', { n: letters })}>
        {view.wordMask.map((c, i) => c === ' '
          ? <span key={i} className="w-3" />
          : <motion.span key={i} initial={false} animate={c !== '_' ? { scale: [1.4, 1] } : {}}
              className={`flex h-8 w-7 items-end justify-center border-b-4 text-xl font-black leading-none ${c !== '_' ? 'border-sun text-navy dark:text-white' : 'border-[var(--text)]/60'}`}>
              {c !== '_' ? c : ''}
            </motion.span>)}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ player list
export function PlayerList({ view, compact }: { view: RoomView; compact?: boolean }) {
  const t = useT();
  const [menu, setMenu] = useState<PlayerView | null>(null);
  const muted = useGame((g) => g.muted);
  const sorted = useMemo(() => {
    const arr = [...view.players];
    if (view.phase !== 'lobby') arr.sort((a, b) => b.score - a.score);
    return arr;
  }, [view.players, view.phase]);
  const rank = (p: PlayerView) => sorted.filter((q) => q.score > p.score).length + 1;
  return (
    <>
      <ul className="scroll-thin flex flex-col gap-1.5 overflow-y-auto">
        <AnimatePresence initial={false}>
          {sorted.map((p) => {
            const artist = p.id === view.artistId && (view.phase === 'drawing' || view.phase === 'choosing');
            return (
              <motion.li key={p.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: p.connected ? 1 : 0.45, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                className={`flex items-center gap-2 rounded-2xl p-1.5 pe-2 ${p.guessed ? 'bg-leaf/15 ring-2 ring-leaf/50' : artist ? 'bg-sun/25 ring-2 ring-sun' : 'surface-2'}`}>
                <button className="relative shrink-0" onClick={() => p.id !== view.you && setMenu(p)} aria-label={p.name}>
                  <Avatar a={p.avatar} size={compact ? 36 : 44} />
                  {p.id === view.hostId && <span className="absolute -top-1.5 -start-1 text-sun drop-shadow" title={t('host')}><IconCrown size={18} /></span>}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 truncate text-sm font-extrabold">
                    {view.phase !== 'lobby' && <span className="text-muted text-xs">#{t.n(rank(p))}</span>}
                    <span className="truncate">{p.name}</span>
                    {p.id === view.you && <span className="text-muted text-xs">({t('you')})</span>}
                    {muted[p.id] && <IconMute size={14} className="text-muted" />}
                  </div>
                  {view.phase === 'lobby'
                    ? <div className={`text-xs font-bold ${p.ready ? 'text-leaf' : 'text-muted'}`}>{p.ready ? `✓ ${t('ready')}` : t('notReady')}</div>
                    : <div className="text-xs font-bold text-teal-dark dark:text-teal">{t('pts', { n: p.score })}</div>}
                </div>
                {artist && <span className="text-navy dark:text-sun" title={t('artist')}><IconBrush size={20} /></span>}
                {p.guessed && <span className="text-leaf" title={t('guessed')}><IconCheck size={20} /></span>}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <PlayerMenu view={view} player={menu} onClose={() => setMenu(null)} />
    </>
  );
}

function PlayerMenu({ view, player, onClose }: { view: RoomView; player: PlayerView | null; onClose: () => void }) {
  const t = useT();
  const muted = useGame((g) => g.muted);
  const [reason, setReason] = useState('');
  if (!player) return <Modal open={false} onClose={onClose} title="">{null}</Modal>;
  const isHost = view.hostId === view.you;
  return (
    <Modal open={!!player} onClose={onClose} title={player.name}>
      <div className="flex flex-col items-center gap-4">
        <Avatar a={player.avatar} size={96} />
        <Button variant="ghost" className="w-full" onClick={() => { actions.toggleMute(player.id); onClose(); }}>
          {muted[player.id] ? <><IconVolume /> {t('unmute')}</> : <><IconMute /> {t('mute')}</>}
        </Button>
        <div className="w-full space-y-2">
          <input className={inputCls} value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder={t('reportReason')} />
          <Button variant="sun" className="w-full" onClick={async () => {
            const r = await actions.report(player.id, reason);
            notify(r.ok ? 'reportSent' : `err_${r.error}`);
            setReason('');
            onClose();
          }}><IconFlag /> {t('report')}</Button>
        </div>
        {isHost && <Button variant="coral" className="w-full" onClick={() => { actions.kick(player.id); onClose(); }}><IconX /> {t('kick')}</Button>}
      </div>
    </Modal>
  );
}

// ------------------------------------------------------------------ chat
function MessageRow({ m, view }: { m: ChatMessage; view: RoomView | null }) {
  const t = useT();
  if (m.kind === 'chat' || m.kind === 'guessedChat') {
    const mine = m.playerId === view?.you;
    return (
      <div className={`rounded-xl px-2.5 py-1 text-sm leading-relaxed ${m.kind === 'guessedChat' ? 'bg-leaf/15' : mine ? 'bg-teal/10' : ''}`}>
        <bdi className="font-extrabold">{m.name}</bdi>: <bdi className="break-words">{m.text}</bdi>
      </div>
    );
  }
  const text = m.key ? t(m.key, m.params) : m.text;
  const cls = {
    correct: 'bg-leaf text-white font-extrabold',
    close: 'bg-sun/40 font-bold',
    join: 'text-teal-dark dark:text-teal font-bold',
    leave: 'text-coral font-bold',
    warn: 'bg-coral/15 text-coral font-bold',
    system: 'text-muted font-bold',
  }[m.kind as string] ?? 'text-muted';
  return <div className={`rounded-xl px-2.5 py-1 text-sm ${cls}`}><bdi>{text}</bdi></div>;
}

export function Chat({ view, className = '' }: { view: RoomView; className?: string }) {
  const t = useT();
  const chat = useGame((g) => g.chat);
  const muted = useGame((g) => g.muted);
  const kbd = usePrefs((p) => p.kurdishKeyboard);
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const me = view.players.find((p) => p.id === view.you);
  const isArtist = view.artistId === view.you;
  const guessing = view.phase === 'drawing' && !isArtist && !me?.guessed;
  const visible = chat.filter((m) => !(m.playerId && muted[m.playerId]));

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [visible.length]);

  const send = async () => {
    const v = text.trim();
    if (!v) return;
    setText('');
    const r = await actions.chat(v);
    if (!r.ok) notify(`err_${r.error}`);
  };

  const placeholder = guessing ? t('guessHere') : view.phase === 'drawing' && me?.guessed ? t('guessedChatHere') : t('chatHere');
  return (
    <div className={`card flex min-h-0 flex-col overflow-hidden ${className}`}>
      <div ref={listRef} className="scroll-thin min-h-0 flex-1 space-y-0.5 overflow-y-auto p-2" aria-live="polite">
        {visible.map((m) => <MessageRow key={m.id} m={m} view={view} />)}
      </div>
      <form className="flex items-center gap-1.5 border-t border-line p-1.5" onSubmit={(e) => { e.preventDefault(); void send(); }}>
        <IconButton type="button" label={t('kurdishKeyboard')} active={kbd} onClick={() => prefs.set({ kurdishKeyboard: !kbd })}><IconKeyboard /></IconButton>
        <input ref={inputRef} dir="auto" value={text} maxLength={100} onChange={(e) => setText(e.target.value)} placeholder={placeholder}
          enterKeyHint="send" autoComplete="off" autoCorrect="off" spellCheck={false} inputMode={kbd ? 'none' : 'text'}
          className={`min-h-11 min-w-0 flex-1 rounded-xl border-2 px-3 text-base font-semibold outline-none surface ${guessing ? 'border-teal' : 'border-line'} focus:border-teal`} />
        <IconButton type="submit" label={t('send')} className="!bg-teal text-white"><IconSend size={20} /></IconButton>
      </form>
      {kbd && (
        <div className="px-1.5 pb-1.5">
          <KurdishKeyboard onKey={(c) => setText((s) => (s + c).slice(0, 100))} onBackspace={() => setText((s) => [...s].slice(0, -1).join(''))} onEnter={() => void send()} />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ reactions
export function ReactionBar() {
  const t = useT();
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label={t('reactions')}>
      {REACTIONS.map((r) => (
        <button key={r.id} onClick={() => actions.react(r.id)} title={t.lang === 'ckb' ? r.ckb : r.en}
          className="surface-2 flex h-10 shrink-0 items-center gap-1 rounded-full px-2.5 text-sm font-bold transition hover:scale-105 active:scale-95">
          <span className="text-lg">{r.emoji}</span><span className="hidden sm:inline">{t.lang === 'ckb' ? r.ckb : r.en}</span>
        </button>
      ))}
    </div>
  );
}

export function FloatingReactions({ view }: { view: RoomView }) {
  const t = useT();
  const reactions = useGame((g) => g.reactions);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {reactions.map((r) => {
        const def = REACTIONS.find((x) => x.id === r.id);
        const p = view.players.find((x) => x.id === r.playerId);
        if (!def) return null;
        const left = 10 + ((r.key * 37) % 80);
        return (
          <div key={r.key} className="absolute bottom-2 flex flex-col items-center" style={{ left: `${left}%`, animation: 'floatUp 2.5s ease-out forwards' }}>
            <span className="text-4xl drop-shadow">{def.emoji}</span>
            <span className="rounded-full bg-navy/80 px-2 text-xs font-bold text-white">{p?.name}: {t.lang === 'ckb' ? def.ckb : def.en}</span>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ confetti
export function Confetti({ count = 60, duration = 2.6 }: { count?: number; duration?: number }) {
  const reduce = usePrefs((p) => p.reduceMotion);
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100, d: Math.random() * 0.6, r: Math.random() * 720 - 360, s: 6 + Math.random() * 8,
    c: ['#20C5C5', '#FFCA45', '#FF746A', '#2B9348', '#9B5DE5', '#FFFFFF'][i % 6], drift: Math.random() * 30 - 15, round: Math.random() > 0.5,
  })), [count]);
  if (reduce) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {parts.map((p, i) => (
        <motion.span key={i} className="absolute top-0 block" style={{ left: `${p.x}%`, width: p.s, height: p.round ? p.s : p.s * 0.5, background: p.c, borderRadius: p.round ? '50%' : 2 }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }} animate={{ y: '105vh', x: `${p.drift}vw`, rotate: p.r, opacity: [1, 1, 0.8] }}
          transition={{ duration: duration + Math.random(), delay: p.d, ease: 'easeIn' }} />
      ))}
    </div>
  );
}

/** Banner + confetti when *you* guess right; a small nudge for close guesses. */
export function GuessCelebration() {
  const t = useT();
  const c = useGame((g) => g.celebrate);
  const [show, setShow] = useState<typeof c>(null);
  useEffect(() => {
    if (!c) return;
    setShow(c);
    const id = setTimeout(() => { setShow(null); game.set({ celebrate: null }); }, c.kind === 'correct' ? 2600 : 1400);
    return () => clearTimeout(id);
  }, [c]);
  return (
    <>
      {show?.kind === 'correct' && <Confetti key={show.ts} />}
      <AnimatePresence>
        {show && (
          <motion.div key={show.ts} className="pointer-events-none fixed inset-x-0 top-24 z-40 flex justify-center px-4"
            initial={{ y: -30, opacity: 0, scale: 0.7 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
            <div className={`rounded-3xl px-6 py-3 text-center shadow-2xl ${show.kind === 'correct' ? 'bg-leaf text-white' : 'bg-sun text-navy'}`}>
              <div className="text-2xl font-black" dir="rtl">{show.kind === 'correct' ? t('correctBanner') : t('closeBanner')}</div>
              {show.points ? <div className="text-lg font-extrabold">+{t.n(show.points)} {t('points')}</div> : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
