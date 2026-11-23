import { AnimatePresence, motion } from 'motion/react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useEffect } from 'react';
import { play } from '../lib/sound';
import { IconX } from './Icons';

type Variant = 'teal' | 'sun' | 'coral' | 'navy' | 'ghost' | 'leaf';
const VARIANTS: Record<Variant, { cls: string; edge: string }> = {
  teal: { cls: 'bg-teal text-white', edge: '#149A9A' },
  sun: { cls: 'bg-sun text-navy', edge: '#D49B12' },
  coral: { cls: 'bg-coral text-white', edge: '#D44C42' },
  navy: { cls: 'bg-navy text-white dark:bg-navy-3', edge: '#0A1222' },
  leaf: { cls: 'bg-leaf text-white', edge: '#1D6B33' },
  ghost: { cls: 'surface-2 text-[var(--text)]', edge: 'var(--line)' },
};

export function Button({ variant = 'teal', size = 'md', className = '', children, onClick, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  const v = VARIANTS[variant];
  const sz = size === 'lg' ? 'min-h-14 px-6 text-lg' : size === 'sm' ? 'min-h-10 px-3 text-sm' : 'min-h-12 px-5 text-base';
  return (
    <button
      {...rest}
      onClick={(e) => { play('click'); onClick?.(e); }}
      className={`btn3d inline-flex items-center justify-center gap-2 select-none ${sz} ${v.cls} ${className}`}
      style={{ ['--edge' as string]: v.edge, ...rest.style }}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, children, className = '', active, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition active:scale-95 disabled:opacity-40 ${active ? 'bg-teal text-white shadow-md' : 'surface-2 hover:brightness-95'} ${className}`}
    >
      {children}
    </button>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true"
            className={`card max-h-[92dvh] w-full overflow-hidden rounded-b-none sm:rounded-b-[24px] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} flex flex-col`}
            initial={{ y: 40, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="kilim shrink-0" />
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
              <h2 className="text-xl font-extrabold">{title}</h2>
              <IconButton label="✕" onClick={onClose}><IconX size={20} /></IconButton>
            </div>
            <div className="scroll-thin overflow-y-auto px-5 pb-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, disabled, label }:
  { value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void; disabled?: boolean; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="surface-2 flex flex-wrap gap-1 rounded-2xl p-1">
      {options.map((o) => (
        <button key={String(o.value)} role="radio" aria-checked={value === o.value} disabled={disabled}
          onClick={() => { play('click'); onChange(o.value); }}
          className={`min-h-10 flex-1 rounded-xl px-3 text-sm font-bold transition ${value === o.value ? 'bg-teal text-white shadow' : 'hover:bg-black/5 dark:hover:bg-white/5'} disabled:cursor-default`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2">
      <span>
        <span className="block font-bold">{label}</span>
        {help && <span className="text-muted block text-sm">{help}</span>}
      </span>
      <button role="switch" aria-checked={checked} onClick={() => { play('click'); onChange(!checked); }}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${checked ? 'bg-teal' : 'bg-[var(--line)]'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'start-7' : 'start-1'}`} />
      </button>
    </label>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-muted text-sm font-bold">{label}</div>
      {children}
    </div>
  );
}

export const inputCls = 'w-full min-h-12 rounded-2xl border-2 border-line surface px-4 text-base font-semibold outline-none transition focus:border-teal placeholder:text-[var(--muted)] placeholder:font-normal';
