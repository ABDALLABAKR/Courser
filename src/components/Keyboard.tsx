import { useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { LetterState } from '../game/evaluate';
import { LETTERS_IN_USE } from '../data/dictionary';
import { BackspaceIcon } from './Icons';
import { ckb as t } from '../i18n/ckb';

/**
 * Layout follows the standard Central Kurdish physical keyboard (QWERTY
 * positions: q→ق, w→و, e→ە …) so it feels familiar, with the remaining
 * Sorani letters grouped on the bottom row. Rows are laid out LTR to mirror
 * the physical keyboard; Enter sits on the right, where RTL readers start.
 */
export const KEY_ROWS: string[][] = [
  ['ق', 'و', 'ە', 'ر', 'ت', 'ی', 'ئ', 'ح', 'ۆ', 'پ'],
  ['ا', 'س', 'د', 'ف', 'گ', 'ه', 'ژ', 'ک', 'ل'],
  ['ز', 'خ', 'ج', 'ڤ', 'ب', 'ن', 'م', 'چ', 'ش'],
  ['BACK', 'ڕ', 'ێ', 'ڵ', 'ع', 'غ', 'ENTER'],
];

const STATE_LABEL: Record<LetterState, string> = {
  correct: t.stateCorrect,
  present: t.statePresent,
  absent: t.stateAbsent,
};

interface KeyboardProps {
  keyStates: Record<string, LetterState>;
  onLetter: (l: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export function Keyboard({ keyStates, onLetter, onEnter, onBackspace, disabled }: KeyboardProps) {
  const ref = useRef<HTMLDivElement>(null);

  /** Arrow-key navigation between on-screen keys (roving focus). */
  const onKeyDown = (e: ReactKeyboardEvent) => {
    const dirs: Record<string, [number, number]> = {
      ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0],
    };
    const d = dirs[e.key];
    const target = e.target as HTMLElement;
    if (!d || !target.dataset.row) return;
    e.preventDefault();
    const r = Math.min(KEY_ROWS.length - 1, Math.max(0, Number(target.dataset.row) + d[0]));
    const cRaw = Number(target.dataset.col) + d[1];
    const c = Math.min(KEY_ROWS[r].length - 1, Math.max(0, d[0] !== 0 ? Math.min(cRaw, KEY_ROWS[r].length - 1) : cRaw));
    ref.current?.querySelector<HTMLElement>(`[data-row="${r}"][data-col="${c}"]`)?.focus();
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label={t.keyboard}
      dir="ltr"
      onKeyDown={onKeyDown}
      className="mx-auto flex w-full max-w-[560px] flex-col gap-[6px] px-[6px] pb-[max(8px,env(safe-area-inset-bottom))] select-none sm:gap-2"
    >
      {KEY_ROWS.map((row, r) => (
        <div key={r} className="flex w-full justify-center gap-[5px] sm:gap-[6px]">
          {r === 1 && <div className="flex-[0.5]" aria-hidden />}
          {r === 2 && <div className="flex-[0.5]" aria-hidden />}
          {row.map((k, c) => {
            const common = {
              'data-row': r,
              'data-col': c,
              type: 'button' as const,
              disabled,
            };
            if (k === 'ENTER') {
              return (
                <button key={k} {...common} className="key key-wide key-enter focus-ring" onClick={onEnter} aria-label={t.enter}>
                  {t.enter}
                </button>
              );
            }
            if (k === 'BACK') {
              return (
                <button key={k} {...common} className="key key-wide focus-ring" onClick={onBackspace} aria-label={t.backspace}>
                  <BackspaceIcon />
                </button>
              );
            }
            const state = keyStates[k];
            return (
              <button
                key={k}
                {...common}
                className="key focus-ring"
                data-state={state}
                data-unused={!state && !LETTERS_IN_USE.has(k) ? 'true' : undefined}
                onClick={() => onLetter(k)}
                aria-label={state ? `${k}، ${STATE_LABEL[state]}` : k}
                lang="ckb"
              >
                {k}
              </button>
            );
          })}
          {r === 1 && <div className="flex-[0.5]" aria-hidden />}
          {r === 2 && <div className="flex-[0.5]" aria-hidden />}
        </div>
      ))}
    </div>
  );
}
