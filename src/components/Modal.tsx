import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CloseIcon } from './Icons';
import { ckb as t } from '../i18n/ckb';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  /** Wider panel for statistics etc. */
  size?: 'sm' | 'md';
  hideClose?: boolean;
}

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Escape to close, focus restore, scroll lock. */
export function Modal({ open, onClose, title, children, size = 'md', hideClose }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = panel.current;
    const first = el?.querySelector<HTMLElement>('[data-autofocus]') ?? el?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !el) return;
      const items = [...el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (items.length === 0) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-40 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`modal-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-3xl ${
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md'
        }`}
      >
        <div className="kilim h-[7px] w-full shrink-0" aria-hidden />
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pt-4 pb-2">
          <h2 id={titleId} className="text-lg font-extrabold">
            {title}
          </h2>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="focus-ring -me-1 grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
            >
              <CloseIcon />
            </button>
          )}
        </header>
        <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
