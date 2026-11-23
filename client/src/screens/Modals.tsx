import { useState } from 'react';
import { prefs, usePrefs, type Scene, type ThemePref } from '../lib/prefs';
import { useT } from '../lib/i18n';
import { ui, useUi } from '../lib/ui';
import { API_BASE, useCategories } from '../lib/api';
import { notify } from '../lib/net';
import { IS_ARTIFACT } from '../lib/env';
import { Button, Field, Modal, Segmented, Toggle, inputCls } from '../components/ui';
import { IconBrush, IconDoor, IconSmile, IconCrown } from '../components/Icons';

export function SettingsModal() {
  const t = useT();
  const open = useUi((s) => s.settingsOpen);
  const p = usePrefs((x) => x);
  const cats = useCategories();
  const [sugg, setSugg] = useState({ word: '', meaning: '', category: 'objects' });
  const submit = async () => {
    if (!sugg.word.trim()) return;
    const r = await fetch(`${API_BASE}/api/suggest`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sugg) }).catch(() => null);
    notify(r?.ok ? 'suggestThanks' : r?.status === 429 ? 'err_rate_limited' : 'err_generic');
    if (r?.ok) setSugg({ ...sugg, word: '', meaning: '' });
  };
  return (
    <Modal open={open} onClose={() => ui.set({ settingsOpen: false })} title={t('settings')}>
      <div className="space-y-5">
        <Field label={t('language')}>
          <Segmented value={p.lang} onChange={(lang) => prefs.set({ lang })} options={[{ value: 'ckb', label: 'کوردی (سۆرانی)' }, { value: 'en', label: 'English' }]} />
        </Field>
        <Field label={t('theme')}>
          <Segmented<ThemePref> value={p.theme} onChange={(theme) => prefs.set({ theme })}
            options={(['light', 'dark', 'system'] as const).map((v) => ({ value: v, label: t(`theme_${v}`) }))} />
        </Field>
        <Field label={t('scene')}>
          <Segmented<Scene> value={p.scene} onChange={(scene) => prefs.set({ scene })}
            options={(['mountains', 'newroz', 'village', 'bazaar', 'none'] as const).map((v) => ({ value: v, label: t(`scene_${v}`) }))} />
        </Field>
        <div className="divide-y divide-[var(--line)]">
          <Toggle label={t('sound')} checked={p.sound} onChange={(sound) => prefs.set({ sound })} />
          <Toggle label={t('reduceMotion')} checked={p.reduceMotion} onChange={(reduceMotion) => prefs.set({ reduceMotion })} />
          <Toggle label={t('kurdishKeyboard')} help={t('kurdishKeyboardHelp')} checked={p.kurdishKeyboard} onChange={(kurdishKeyboard) => prefs.set({ kurdishKeyboard })} />
        </div>
        {!IS_ARTIFACT && <details className="surface-2 rounded-2xl p-3">
          <summary className="cursor-pointer font-extrabold">{t('suggestWord')}</summary>
          <p className="text-muted my-2 text-sm">{t('suggestHelp')}</p>
          <div className="space-y-2">
            <input className={inputCls} dir="rtl" maxLength={32} placeholder={t('word')} value={sugg.word} onChange={(e) => setSugg({ ...sugg, word: e.target.value })} />
            <input className={inputCls} dir="ltr" maxLength={120} placeholder={t('meaningEn')} value={sugg.meaning} onChange={(e) => setSugg({ ...sugg, meaning: e.target.value })} />
            <select className={inputCls} value={sugg.category} onChange={(e) => setSugg({ ...sugg, category: e.target.value })} aria-label={t('category')}>
              {cats.map((c) => <option key={c.id} value={c.id}>{t.lang === 'ckb' ? c.name_ckb : c.name_en}</option>)}
            </select>
            <Button className="w-full" variant="navy" onClick={submit}>{t('submit')}</Button>
          </div>
        </details>}
      </div>
    </Modal>
  );
}

export function HowToModal() {
  const t = useT();
  const open = useUi((s) => s.howOpen);
  const steps = [
    { icon: <IconDoor />, c: 'bg-teal', title: t('how1t'), body: t('how1') },
    { icon: <IconBrush />, c: 'bg-sun text-navy', title: t('how2t'), body: t('how2') },
    { icon: <IconSmile />, c: 'bg-coral', title: t('how3t'), body: t('how3') },
    { icon: <IconCrown />, c: 'bg-leaf', title: t('how4t'), body: t('how4') },
  ];
  return (
    <Modal open={open} onClose={() => ui.set({ howOpen: false })} title={t('howToPlay')}>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="surface-2 flex gap-3 rounded-2xl p-3">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white ${s.c}`}>{s.icon}</span>
            <div>
              <div className="font-extrabold">{t.n(i + 1)}. {s.title}</div>
              <p className="text-muted text-sm leading-relaxed">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <Button className="mt-4 w-full" onClick={() => ui.set({ howOpen: false })}>{t('letsPlay')}</Button>
    </Modal>
  );
}
