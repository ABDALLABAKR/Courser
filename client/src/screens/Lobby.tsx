import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { DRAW_TIME_OPTIONS, MAX_PLAYERS_LIMIT, ROUND_OPTIONS, type RoomSettings, type RoomView } from '@wene/shared';
import { actions, notify } from '../lib/net';
import { useT } from '../lib/i18n';
import { ui } from '../lib/ui';
import { useCategories, type Category } from '../lib/api';
import { Button, Field, IconButton, Segmented, Toggle, inputCls } from '../components/ui';
import { IconCheck, IconCopy, IconLogout, IconPlay, IconSettings, IconShare } from '../components/Icons';
import { Chat, PlayerList, useCountdown } from '../game/widgets';

export function inviteUrl(code: string) {
  const u = new URL(location.origin + location.pathname);
  u.searchParams.set('room', code);
  return u.toString();
}

function RoomCodeCard({ view }: { view: RoomView }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const url = inviteUrl(view.code);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* insecure context */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  const share = async () => {
    const text = t('inviteText', { code: view.code });
    if (navigator.share) {
      try { await navigator.share({ title: 'وێنە بکێشە', text, url }); return; } catch { /* cancelled */ }
    }
    void copy();
  };
  return (
    <div className="card overflow-hidden">
      <div className="kilim" />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <div className="text-muted text-sm font-bold">{view.isPublic ? t('publicRoom') : t('privateRoom')} · {t('roomCode')}</div>
          <div className="font-display text-4xl font-bold tracking-[0.25em] text-navy dark:text-white ltr" data-testid="room-code">{view.code}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={copy}>{copied ? <IconCheck size={18} /> : <IconCopy size={18} />} {copied ? t('copied') : t('copy')}</Button>
          <Button variant="sun" size="sm" onClick={share}><IconShare size={18} /> {t('invite')}</Button>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ view }: { view: RoomView }) {
  const t = useT();
  const isHost = view.hostId === view.you;
  const s = view.settings;
  const cats = useCategories();
  const [custom, setCustom] = useState(s.customWords.join('، '));
  useEffect(() => setCustom(s.customWords.join('، ')), [s.customWords]);

  const update = async (patch: Partial<RoomSettings>) => {
    const r = await actions.settings(patch);
    if (!r.ok) notify(`err_${r.error}`);
  };
  const toggleCat = (c: Category) => {
    const set = new Set(s.categories);
    if (set.has(c.id)) set.delete(c.id); else set.add(c.id);
    void update({ categories: [...set] });
  };
  const saveCustom = () => {
    const words = custom.split(/[,،\n]+/).map((w) => w.trim()).filter(Boolean).slice(0, 150);
    void update({ customWords: words, customOnly: words.length >= 3 ? s.customOnly : false });
  };

  return (
    <div className="card space-y-4 p-4">
      <h2 className="flex items-center gap-2 text-lg font-extrabold"><IconSettings size={20} /> {t('roomSettings')}</h2>
      <fieldset disabled={!isHost} className="space-y-4">
        <Field label={t('rounds')}>
          <Segmented disabled={!isHost} value={s.rounds} onChange={(v) => update({ rounds: v })} options={ROUND_OPTIONS.map((n) => ({ value: n, label: t.n(n) }))} />
        </Field>
        <Field label={t('drawTime')}>
          <Segmented disabled={!isHost} value={s.drawTime} onChange={(v) => update({ drawTime: v })} options={DRAW_TIME_OPTIONS.map((n) => ({ value: n, label: `${t.n(n)}${t.lang === 'en' ? 's' : ''}` }))} />
        </Field>
        <Field label={`${t('maxPlayers')}: ${t.n(s.maxPlayers)}`}>
          <input type="range" min={Math.max(2, view.players.length)} max={MAX_PLAYERS_LIMIT} value={s.maxPlayers} disabled={!isHost}
            onChange={(e) => update({ maxPlayers: Number(e.target.value) })} className="w-full accent-[#20C5C5]" aria-label={t('maxPlayers')} />
        </Field>
        <Field label={t('difficulty')}>
          <Segmented disabled={!isHost} value={s.difficulty} onChange={(v) => update({ difficulty: v })}
            options={(['easy', 'medium', 'hard', 'mixed'] as const).map((d) => ({ value: d, label: t(`diff_${d}`) }))} />
        </Field>
        <Field label={t('categories')}>
          <div className="flex flex-wrap gap-1.5">
            <button disabled={!isHost} onClick={() => update({ categories: [] })}
              className={`rounded-full px-3 py-1.5 text-sm font-bold ${s.categories.length === 0 ? 'bg-teal text-white' : 'surface-2'}`}>{t('allCategories')}</button>
            {cats.map((c) => (
              <button key={c.id} disabled={!isHost} onClick={() => toggleCat(c)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${s.categories.includes(c.id) ? 'bg-teal text-white' : 'surface-2'}`}>
                {t.lang === 'ckb' ? c.name_ckb : c.name_en}
              </button>
            ))}
          </div>
        </Field>
        <Toggle label={t('hints')} checked={s.hints} onChange={(v) => isHost && update({ hints: v })} />
        <Field label={t('customWords')}>
          <textarea className={`${inputCls} min-h-20 py-2`} dir="rtl" value={custom} onChange={(e) => setCustom(e.target.value)}
            placeholder={t('customHelp')} readOnly={!isHost} />
          {isHost && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted text-xs">{t('customHelp')}</span>
              <Button size="sm" variant="navy" onClick={saveCustom}>{t('save')}</Button>
            </div>
          )}
        </Field>
        {s.customWords.length >= 3 && <Toggle label={t('customOnly')} checked={s.customOnly} onChange={(v) => isHost && update({ customOnly: v })} />}
      </fieldset>
    </div>
  );
}

export function Lobby({ view }: { view: RoomView }) {
  const t = useT();
  const me = view.players.find((p) => p.id === view.you)!;
  const isHost = view.hostId === view.you;
  const connected = view.players.filter((p) => p.connected);
  const readyN = connected.filter((p) => p.ready || p.id === view.hostId).length;
  const autoLeft = useCountdown(view.autoStartAt);
  const start = async () => {
    const r = await actions.start();
    if (!r.ok) notify(`err_${r.error}`);
  };

  return (
    <motion.div className="mx-auto flex min-h-[var(--vvh)] max-w-6xl flex-col gap-3 p-3 pb-28 sm:p-4 sm:pb-28" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-black">{t('lobby')}</h1>
        <div className="flex gap-2">
          <IconButton label={t('settings')} onClick={() => ui.set({ settingsOpen: true })}><IconSettings /></IconButton>
          <IconButton label={t('leave')} onClick={() => actions.leave()}><IconLogout /></IconButton>
        </div>
      </header>
      <RoomCodeCard view={view} />
      <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_1fr]">
        <section className="card flex max-h-[60vh] flex-col p-3 lg:max-h-[calc(var(--vvh)-280px)]">
          <h2 className="mb-2 flex items-center justify-between text-lg font-extrabold">
            <span>{t('players')} ({t.n(view.players.length)}/{t.n(view.settings.maxPlayers)})</span>
            <span className="text-muted text-sm">{t('readyCount', { r: readyN, n: connected.length })}</span>
          </h2>
          <PlayerList view={view} />
        </section>
        <SettingsPanel view={view} />
        <Chat view={view} className="h-[360px] lg:h-[calc(var(--vvh)-280px)]" />
      </div>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 p-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="card mx-auto flex max-w-2xl items-center gap-3 p-3">
          {!isHost && (
            <Button className="flex-1" variant={me.ready ? 'leaf' : 'ghost'} onClick={() => actions.ready(!me.ready)}>
              {me.ready ? <><IconCheck /> {t('ready')}</> : t('notReady')}
            </Button>
          )}
          {isHost ? (
            <Button size="lg" className="flex-1" variant="teal" disabled={connected.length < 2} onClick={start} data-testid="start-game">
              <IconPlay /> {connected.length < 2 ? t('needPlayers') : t('startGame')}
            </Button>
          ) : (
            <div className="text-muted flex-[1.3] text-center text-sm font-bold">
              {view.autoStartAt ? t('autoStart', { s: Math.ceil(autoLeft / 1000) }) : t('waitingForHost')}
            </div>
          )}
          {isHost && view.autoStartAt && <div className="text-muted text-sm font-bold">{t('autoStart', { s: Math.ceil(autoLeft / 1000) })}</div>}
        </div>
      </div>
    </motion.div>
  );
}
