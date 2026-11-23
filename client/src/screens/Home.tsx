import { motion } from 'motion/react';
import { useState } from 'react';
import { AVATAR_PARTS, ROOM_CODE_REGEX, type Avatar as A } from '@wene/shared';
import { prefs, randomAvatar, usePrefs } from '../lib/prefs';
import { actions, notify, useGame } from '../lib/net';
import { useT } from '../lib/i18n';
import { ui } from '../lib/ui';
import { Logo } from '../components/Logo';
import { Avatar } from '../components/Avatar';
import { Button, IconButton, inputCls } from '../components/ui';
import { IconChevron, IconDice, IconDoor, IconGlobe, IconHelp, IconLock, IconSettings } from '../components/Icons';

const PARTS: (keyof A)[] = ['acc', 'eyes', 'mouth', 'color', 'skin'];

function AvatarEditor() {
  const t = useT();
  const avatar = usePrefs((p) => p.avatar);
  const cycle = (k: keyof A, d: number) => {
    const n = AVATAR_PARTS[k];
    prefs.set({ avatar: { ...avatar, [k]: (avatar[k] + d + n) % n } });
  };
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="relative">
        <motion.div key={JSON.stringify(avatar)} initial={{ scale: 0.85, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }}>
          <Avatar a={avatar} size={120} />
        </motion.div>
        <IconButton label={t('randomize')} className="absolute -bottom-1 -end-1 !bg-sun !text-navy shadow-md" onClick={() => prefs.set({ avatar: randomAvatar() })}><IconDice /></IconButton>
      </div>
      <div className="grid min-w-0 flex-1 gap-1">
        {PARTS.map((k) => (
          <div key={k} className="surface-2 flex items-center justify-between rounded-xl" dir="ltr">
            <button aria-label={`${t(`part_${k}`)} −`} className="flex h-9 w-10 items-center justify-center rounded-xl hover:bg-black/5" onClick={() => cycle(k, -1)}><IconChevron size={18} className="rotate-180" /></button>
            <span className="truncate px-1 text-center text-xs font-bold sm:text-sm" dir="auto">{k === 'acc' ? t(`acc_${avatar.acc}`) : t(`part_${k}`)}</span>
            <button aria-label={`${t(`part_${k}`)} +`} className="flex h-9 w-10 items-center justify-center rounded-xl hover:bg-black/5" onClick={() => cycle(k, 1)}><IconChevron size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  const t = useT();
  const name = usePrefs((p) => p.name);
  const online = useGame((g) => g.online);
  const connected = useGame((g) => g.connected);
  const invited = new URLSearchParams(location.search).get('room')?.toUpperCase() ?? '';
  const [code, setCode] = useState(ROOM_CODE_REGEX.test(invited) ? invited : '');
  const [joinOpen, setJoinOpen] = useState(!!code);
  const [busy, setBusy] = useState(false);
  const [nameError, setNameError] = useState(false);

  const guard = async (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    if (name.trim().length < 2) { setNameError(true); notify('err_bad_name'); return; }
    setBusy(true);
    const r = await fn();
    setBusy(false);
    if (!r.ok) notify(`err_${r.error}`);
  };

  return (
    <div className="mx-auto flex min-h-[var(--vvh)] max-w-lg flex-col px-4 pt-3 pb-6">
      <nav className="flex items-center justify-between">
        <div className="flex gap-2">
          <IconButton label={t('settings')} onClick={() => ui.set({ settingsOpen: true })}><IconSettings /></IconButton>
          <IconButton label={t('howToPlay')} onClick={() => ui.set({ howOpen: true })}><IconHelp /></IconButton>
          <button className="surface-2 h-11 rounded-2xl px-3 text-sm font-extrabold" onClick={() => prefs.set({ lang: t.lang === 'ckb' ? 'en' : 'ckb' })}>
            {t.lang === 'ckb' ? 'EN' : 'کوردی'}
          </button>
        </div>
        <div className="surface-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-leaf' : 'bg-coral'} ${connected ? 'animate-pulse' : ''}`} />
          {connected && online !== null ? t('online', { n: online }) : t('connecting')}
        </div>
      </nav>

      <div className="py-8 sm:py-10"><Logo /></div>
      <p className="-mt-4 mb-6 text-center text-lg font-bold text-coral">{t('tagline')}</p>

      <motion.section className="card space-y-4 p-4 sm:p-5" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
        <AvatarEditor />
        <label className="block space-y-1.5">
          <span className="text-muted text-sm font-bold">{t('nickname')}</span>
          <input className={`${inputCls} ${nameError ? '!border-coral' : ''}`} value={name} maxLength={20} dir="auto" autoComplete="nickname"
            onChange={(e) => { prefs.set({ name: e.target.value }); setNameError(false); }} placeholder={t('nicknamePh')} />
        </label>

        {invited && ROOM_CODE_REGEX.test(invited) && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-sun/25 p-3 text-center font-bold">
            {t('invitedTo', { code: invited })}
            <Button variant="navy" className="w-full" disabled={busy || !connected} onClick={() => guard(() => actions.join(invited))} data-testid="join-invite"><IconDoor /> {t('join')}</Button>
          </div>
        )}

        <div className="grid gap-3 pt-1">
          <Button size="lg" variant="teal" disabled={busy || !connected} onClick={() => guard(actions.quickPlay)}><IconGlobe /> {t('playOnline')}</Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="sun" disabled={busy || !connected} onClick={() => guard(() => actions.create())}><IconLock /> {t('createRoom')}</Button>
            <Button variant="coral" disabled={busy} onClick={() => setJoinOpen((v) => !v)}><IconDoor /> {t('joinRoom')}</Button>
          </div>
          {joinOpen && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); if (!ROOM_CODE_REGEX.test(code)) return notify('err_bad_code'); void guard(() => actions.join(code)); }}>
              <input className={`${inputCls} font-display text-center text-xl tracking-[0.3em] uppercase ltr`} value={code} maxLength={6} autoCapitalize="characters" autoComplete="off" spellCheck={false}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder={t('roomCodePh')} aria-label={t('roomCode')} />
              <Button type="submit" variant="navy" disabled={busy || !connected}>{t('join')}</Button>
            </motion.form>
          )}
        </div>
      </motion.section>

      <footer className="text-muted mt-auto space-y-1 pt-6 text-center text-xs">
        <p>{t('demoNotice')}</p>
        <p><a href="/admin" className="underline">{t('admin')}</a></p>
      </footer>
    </div>
  );
}
