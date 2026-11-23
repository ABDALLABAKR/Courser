import { useId } from 'react';
import { Modal } from './Modal';
import type { Settings, ThemePref } from '../hooks/useSettings';
import { LANGUAGES, kuNum } from '../i18n';
import { ACCEPTED_GUESS_COUNT, ANSWERS, DICTIONARY_MODE } from '../data/dictionary';
import { ckb as t } from '../i18n/ckb';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  reducedMotion: boolean;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onHelp: () => void;
  onReset: () => void;
}

function Toggle({ label, hint, checked, onChange, disabled }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label htmlFor={id} className="flex flex-col">
        <span className="font-bold">{label}</span>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`focus-ring relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-brand' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-[inset-inline-start] ${checked ? 'start-6' : 'start-1'}`}
        />
      </button>
    </div>
  );
}

export function SettingsModal({ open, onClose, settings, reducedMotion, update, onHelp, onReset }: Props) {
  const themes: Array<[ThemePref, string]> = [
    ['system', t.themeSystem],
    ['light', t.themeLight],
    ['dark', t.themeDark],
  ];
  return (
    <Modal open={open} onClose={onClose} title={t.settings}>
      <div className="flex flex-col pt-1">
        <fieldset className="pb-3">
          <legend className="mb-2 font-bold">{t.theme}</legend>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1">
            {themes.map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={settings.theme === v}
                onClick={() => update('theme', v)}
                className={`focus-ring h-9 rounded-xl text-sm font-bold transition ${settings.theme === v ? 'bg-surface text-fg shadow' : 'text-muted hover:text-fg'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="divide-y divide-line border-y border-line">
          <Toggle label={t.sound} hint={t.soundHint} checked={settings.sound} onChange={(v) => update('sound', v)} />
          <Toggle
            label={t.animations}
            hint={reducedMotion ? t.reducedMotionActive : t.animationsHint}
            checked={settings.animations && !reducedMotion}
            disabled={reducedMotion}
            onChange={(v) => update('animations', v)}
          />
          <Toggle label={t.highContrast} hint={t.highContrastHint} checked={settings.highContrast} onChange={(v) => update('highContrast', v)} />
          <Toggle label={t.latinKeys} hint={t.latinKeysHint} checked={settings.latinKeys} onChange={(v) => update('latinKeys', v)} />
          <div className="flex items-center justify-between gap-4 py-3">
            <label htmlFor="lang" className="flex flex-col">
              <span className="font-bold">{t.language}</span>
              <span className="text-xs text-muted">{t.languageSoon}</span>
            </label>
            <select
              id="lang"
              value={settings.language}
              onChange={(e) => update('language', e.target.value as Settings['language'])}
              className="focus-ring rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm font-bold"
            >
              {Object.entries(LANGUAGES).map(([code, l]) => (
                <option key={code} value={code}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button type="button" onClick={onHelp} className="focus-ring mt-4 h-11 rounded-2xl bg-surface-2 font-bold hover:brightness-95">
          {t.howToPlay}
        </button>

        {DICTIONARY_MODE === 'demo' && (
          <p className="mt-4 rounded-2xl border border-present/40 bg-present/10 p-3 text-xs leading-relaxed">
            <strong className="block text-sm">{t.demoDict}</strong>
            {t.demoDictHint}
            <span className="mt-1 block text-muted">
              {kuNum(ANSWERS.length)} وەڵام · {kuNum(ACCEPTED_GUESS_COUNT)} وشەی پەسەندکراو
            </span>
          </p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-muted">🔒 {t.privacy}</p>

        <button type="button" onClick={onReset} className="focus-ring mt-3 self-start rounded-full px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-500/10 dark:text-red-400">
          {t.resetData}
        </button>
        <p className="latin mt-2 text-center text-[0.7rem] text-muted">WUSHA v{__APP_VERSION__}</p>
      </div>
    </Modal>
  );
}
