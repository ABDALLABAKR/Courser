import { IconBackspace, IconSend } from './Icons';

/** Sorani alphabet in alphabetical order, for devices without a Kurdish keyboard layout. */
const ROWS = [
  ['ئ', 'ا', 'ب', 'پ', 'ت', 'ج', 'چ', 'ح', 'خ', 'د'],
  ['ر', 'ڕ', 'ز', 'ژ', 'س', 'ش', 'ع', 'غ', 'ف', 'ڤ'],
  ['ق', 'ک', 'گ', 'ل', 'ڵ', 'م', 'ن', 'ه', 'ە', 'و'],
  ['ۆ', 'وو', 'ی', 'ێ'],
];

export function KurdishKeyboard({ onKey, onBackspace, onEnter }: { onKey: (s: string) => void; onBackspace: () => void; onEnter: () => void }) {
  const key = 'surface flex h-10 min-w-0 flex-1 items-center justify-center rounded-lg text-lg font-bold shadow-[0_2px_0_var(--line)] active:translate-y-px active:shadow-none';
  // onPointerDown + preventDefault keeps focus out of the input so the OS keyboard doesn't pop up
  const press = (fn: () => void) => ({ onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); fn(); } });
  return (
    <div dir="rtl" className="surface-2 select-none space-y-1.5 rounded-2xl p-1.5" role="group" aria-label="Kurdish keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((c) => <button key={c} type="button" className={key} {...press(() => onKey(c))}>{c}</button>)}
          {i === 3 && (
            <>
              <button type="button" className={`${key} flex-[3]`} {...press(() => onKey(' '))} aria-label="space">␣</button>
              <button type="button" className={`${key} flex-[1.4]`} {...press(onBackspace)} aria-label="backspace"><IconBackspace size={20} /></button>
              <button type="button" className={`${key} flex-[1.4] !bg-teal text-white`} {...press(onEnter)} aria-label="enter"><IconSend size={18} /></button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
