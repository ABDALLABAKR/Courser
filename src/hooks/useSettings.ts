import { useCallback, useEffect, useState } from 'react';
import { load, save } from '../lib/storage';
import type { LanguageCode } from '../i18n';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemePref;
  sound: boolean;
  animations: boolean;
  highContrast: boolean;
  latinKeys: boolean;
  hardMode: boolean;
  language: LanguageCode;
}

const DEFAULTS: Settings = {
  theme: 'system',
  sound: true,
  animations: true,
  highContrast: false,
  latinKeys: true,
  hardMode: false,
  language: 'ckb',
};

function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULTS, ...load('settings', {}) }));
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const dark = settings.theme === 'dark' || (settings.theme === 'system' && systemDark);
  const motion = settings.animations && !reducedMotion;

  useEffect(() => save('settings', settings), [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = motion ? 'on' : 'off';
    root.style.colorScheme = dark ? 'dark' : 'light';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', dark ? '#0F172A' : '#F8FAFC');
  }, [dark, motion, settings.highContrast]);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => ({ ...s, [key]: value }));
  }, []);

  return { settings, update, dark, motion, reducedMotion };
}
