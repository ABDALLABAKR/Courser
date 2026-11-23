import type { Avatar, Lang } from '@wene/shared';
import { AVATAR_PARTS } from '@wene/shared';
import { createStore, storage, useStore } from './store';

export type ThemePref = 'light' | 'dark' | 'system';
export type Scene = 'mountains' | 'newroz' | 'village' | 'bazaar' | 'none';
export interface Prefs {
  lang: Lang;
  theme: ThemePref;
  scene: Scene;
  sound: boolean;
  reduceMotion: boolean;
  kurdishKeyboard: boolean;
  name: string;
  avatar: Avatar;
}

export function randomAvatar(): Avatar {
  const r = (n: number) => Math.floor(Math.random() * n);
  return { skin: r(AVATAR_PARTS.skin), color: r(AVATAR_PARTS.color), eyes: r(AVATAR_PARTS.eyes), mouth: r(AVATAR_PARTS.mouth), acc: r(AVATAR_PARTS.acc) };
}

const saved = storage.get<Partial<Prefs>>('wene.prefs', {});
const sysReduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
export const prefs = createStore<Prefs>({
  lang: 'ckb', theme: 'system', scene: 'mountains', sound: true, reduceMotion: sysReduce, kurdishKeyboard: false,
  name: '', avatar: randomAvatar(),
  ...saved,
});
prefs.subscribe(() => storage.set('wene.prefs', prefs.get()));

export const usePrefs = <S,>(sel: (p: Prefs) => S) => useStore(prefs, sel);

/** Apply theme / direction / motion classes to <html>. */
export function applyPrefsToDocument() {
  const apply = () => {
    const p = prefs.get();
    const root = document.documentElement;
    const dark = p.theme === 'dark' || (p.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', dark);
    root.classList.toggle('reduce-motion', p.reduceMotion);
    root.lang = p.lang === 'ckb' ? 'ckb' : 'en';
    root.dir = p.lang === 'ckb' ? 'rtl' : 'ltr';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0F1729' : '#20C5C5');
  };
  apply();
  prefs.subscribe(apply);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', apply);

  // Keep a CSS variable with the *visual* viewport height so the layout shrinks when the mobile keyboard opens.
  const vv = window.visualViewport;
  const setVh = () => document.documentElement.style.setProperty('--vvh', `${vv ? vv.height : window.innerHeight}px`);
  setVh();
  vv?.addEventListener('resize', setVh);
  window.addEventListener('resize', setVh);
}
