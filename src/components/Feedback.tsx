import { useCallback, useEffect, useRef, useState } from 'react';
import { formatCountdown, msUntilNextDaily } from '../game/daily';
import { kuNum } from '../i18n';

/* ── Toasts ────────────────────────────────────────────────────── */

export interface ToastItem {
  id: number;
  text: string;
  tone?: 'info' | 'error' | 'success';
  icon?: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const push = useCallback((text: string, opts: Omit<ToastItem, 'id' | 'text'> & { ms?: number } = {}) => {
    const id = nextId.current++;
    setToasts((ts) => [...ts.slice(-2), { id, text, tone: opts.tone, icon: opts.icon }]);
    window.setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), opts.ms ?? 1800);
  }, []);
  return { toasts, push };
}

export function Toasts({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[72px] z-50 flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="assertive"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast flex items-center gap-2 rounded-2xl px-4 py-2.5 text-[0.95rem] font-bold shadow-xl ${
            t.tone === 'error'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : t.tone === 'success'
                ? 'bg-brand text-white'
                : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          }`}
        >
          {t.icon && <span aria-hidden>{t.icon}</span>}
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ── Countdown to the next daily challenge ─────────────────────── */

export function Countdown({ onZero }: { onZero?: () => void }) {
  const [ms, setMs] = useState(() => msUntilNextDaily());
  useEffect(() => {
    const id = window.setInterval(() => {
      const left = msUntilNextDaily();
      setMs(left);
      if (left <= 1000) onZero?.();
    }, 1000);
    return () => window.clearInterval(id);
  }, [onZero]);
  return (
    <time className="latin text-2xl font-extrabold tabular-nums tracking-wider" dir="ltr">
      {kuNum(formatCountdown(ms))}
    </time>
  );
}

/* ── Confetti (canvas, ~2.5 s, no dependencies) ────────────────── */

export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!fire) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = (canvas.width = window.innerWidth * dpr);
    const H = (canvas.height = window.innerHeight * dpr);
    const colors = ['#22A06B', '#2FBF80', '#F2B929', '#D4A72C', '#E5484D', '#ffffff'];
    const parts = Array.from({ length: 140 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.35,
      vx: (Math.random() - 0.5) * 16 * dpr,
      vy: (-Math.random() * 14 - 6) * dpr,
      s: (Math.random() * 6 + 4) * dpr,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      c: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() < 0.3,
    }));
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 1700) / 900);
      for (const p of parts) {
        p.vy += 0.45 * dpr;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);
        ctx.fillStyle = p.c;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.s / 2, 0, Math.PI * 2);
          ctx.fill();
        } else ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
        ctx.restore();
      }
      if (t < 2600) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fire]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60] h-full w-full" aria-hidden />;
}
