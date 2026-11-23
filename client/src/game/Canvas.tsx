import { useEffect, useRef, useState } from 'react';
import { BRUSH_SIZES, COORD_SCALE, PALETTE, type DrawOp } from '@wene/shared';
import { actions, applyOp, canvasModel } from '../lib/net';
import { Renderer } from './render';
import { useT } from '../lib/i18n';
import { IconBrush, IconEraser, IconFill, IconRedo, IconTrash, IconUndo } from '../components/Icons';
import { IconButton } from '../components/ui';

type Tool = 'brush' | 'eraser' | 'fill';
export interface ToolState { tool: Tool; color: string; size: number }

const FLUSH_MS = 40;
const MIN_DIST = 8; // in COORD units (~1px on the 1200px surface)

export function DrawingCanvas({ canDraw, tools }: { canDraw: boolean; tools: ToolState }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const toolsRef = useRef(tools);
  toolsRef.current = tools;

  // Render remote + local model changes
  useEffect(() => {
    const r = new Renderer(ref.current!);
    renderer.current = r;
    r.redraw(canvasModel.strokes);
    const listener = (e: { type: 'ops'; ops: DrawOp[] } | { type: 'sync' }) => {
      if (e.type === 'sync') return r.redraw(canvasModel.strokes);
      renderOps(r, e.ops);
    };
    canvasModel.listeners.add(listener);
    return () => { canvasModel.listeners.delete(listener); };
  }, []);

  // Local drawing for the artist
  useEffect(() => {
    if (!canDraw) return;
    const canvas = ref.current!;
    let queue: DrawOp[] = [];
    let drawing: { id: number; last: [number, number] } | null = null;
    let nextId = Math.floor(Math.random() * 1e6) * 1000;

    const flush = () => {
      if (!queue.length) return;
      // merge consecutive pts ops for the same stroke, respecting the 400-number server limit
      const merged: DrawOp[] = [];
      for (const op of queue) {
        const prev = merged[merged.length - 1];
        if (op.t === 'pts' && prev?.t === 'pts' && prev.id === op.id && prev.p.length + op.p.length <= 400) prev.p.push(...op.p);
        else merged.push(op.t === 'pts' ? { ...op, p: [...op.p] } : op);
      }
      queue = [];
      for (let i = 0; i < merged.length; i += 50) actions.draw(merged.slice(i, i + 50));
    };
    const timer = setInterval(flush, FLUSH_MS);

    const local = (op: DrawOp) => {
      applyOp(op);
      renderOps(renderer.current!, [op]);
      queue.push(op);
    };
    const toCoord = (e: { clientX: number; clientY: number }): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      const c = (v: number) => Math.max(0, Math.min(COORD_SCALE, Math.round(v * COORD_SCALE)));
      return [c((e.clientX - rect.left) / rect.width), c((e.clientY - rect.top) / rect.height)];
    };

    const down = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      const { tool, color, size } = toolsRef.current;
      const [x, y] = toCoord(e);
      if (tool === 'fill') { local({ t: 'fill', id: ++nextId, c: color, x, y }); return; }
      canvas.setPointerCapture(e.pointerId);
      const id = ++nextId;
      drawing = { id, last: [x, y] };
      local({ t: 'begin', id, c: color, s: size, e: tool === 'eraser' ? 1 : 0, x, y });
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      e.preventDefault();
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
      const pts: number[] = [];
      for (const ev of events.length ? events : [e]) {
        const [x, y] = toCoord(ev);
        const [lx, ly] = drawing.last;
        if (Math.hypot(x - lx, y - ly) < MIN_DIST) continue;
        pts.push(x, y);
        drawing.last = [x, y];
      }
      for (let i = 0; i < pts.length; i += 400) local({ t: 'pts', id: drawing.id, p: pts.slice(i, i + 400) });
    };
    const up = () => { drawing = null; flush(); };

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('lostpointercapture', up);
    const exec = (t: 'undo' | 'redo' | 'clear') => { flush(); local({ t } as DrawOp); flush(); };
    const onCmd = (e: Event) => exec((e as CustomEvent).detail);
    window.addEventListener('wene:cmd', onCmd);
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); exec('undo'); }
      else if (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)) { e.preventDefault(); exec('redo'); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      flush();
      clearInterval(timer);
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      canvas.removeEventListener('lostpointercapture', up);
      window.removeEventListener('wene:cmd', onCmd);
      window.removeEventListener('keydown', onKey);
    };
  }, [canDraw]);

  return (
    <canvas ref={ref} aria-label="drawing canvas"
      className={`canvas-paper block h-full w-full rounded-2xl ${canDraw ? (tools.tool === 'fill' ? 'cursor-cell' : 'cursor-crosshair') : 'cursor-default'}`} />
  );
}

function renderOps(r: Renderer, ops: DrawOp[]) {
  const strokes = canvasModel.strokes;
  for (const op of ops) {
    if (op.t === 'begin' || op.t === 'fill') {
      const s = strokes.find((x) => x.id === op.id);
      if (s) r.drawStroke(s, 0);
    } else if (op.t === 'pts') {
      const s = strokes[strokes.length - 1];
      if (s && s.kind === 'line' && s.id === op.id) r.drawStroke(s, s.p.length / 2 - op.p.length / 2);
    } else {
      r.redraw(strokes);
    }
  }
}

export const sendCmd = (t: 'undo' | 'redo' | 'clear') => window.dispatchEvent(new CustomEvent('wene:cmd', { detail: t }));

export function Toolbar({ tools, setTools }: { tools: ToolState; setTools: (t: ToolState) => void }) {
  const t = useT();
  const [confirmClear, setConfirmClear] = useState(false);
  const set = (p: Partial<ToolState>) => setTools({ ...tools, ...p });
  return (
    <div className="card flex flex-wrap items-center gap-2 p-2" dir="ltr">
      <div className="grid grid-cols-9 gap-1" role="radiogroup" aria-label={t('color')}>
        {PALETTE.map((c) => (
          <button key={c} role="radio" aria-checked={tools.color === c} aria-label={c}
            onClick={() => set({ color: c, tool: tools.tool === 'eraser' ? 'brush' : tools.tool })}
            className={`h-7 w-7 rounded-lg border-2 transition sm:h-8 sm:w-8 ${tools.color === c ? 'scale-110 border-navy ring-2 ring-sun dark:border-white' : 'border-black/10'}`}
            style={{ background: c }} />
        ))}
      </div>
      <div className="flex items-center gap-1 rounded-2xl surface-2 p-1" role="radiogroup" aria-label={t('size')}>
        {BRUSH_SIZES.map((s) => (
          <button key={s} role="radio" aria-checked={tools.size === s} aria-label={`${t('size')} ${s}`} onClick={() => set({ size: s })}
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${tools.size === s ? 'bg-teal' : ''}`}>
            <span className="rounded-full" style={{ width: Math.max(4, Math.min(26, s / 2.6)), height: Math.max(4, Math.min(26, s / 2.6)), background: tools.size === s ? '#fff' : 'var(--text)' }} />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <IconButton label={t('tool_brush')} active={tools.tool === 'brush'} onClick={() => set({ tool: 'brush' })}><IconBrush /></IconButton>
        <IconButton label={t('tool_eraser')} active={tools.tool === 'eraser'} onClick={() => set({ tool: 'eraser' })}><IconEraser /></IconButton>
        <IconButton label={t('tool_fill')} active={tools.tool === 'fill'} onClick={() => set({ tool: 'fill' })}><IconFill /></IconButton>
      </div>
      <div className="flex items-center gap-1">
        <IconButton label={t('undo')} onClick={() => sendCmd('undo')}><IconUndo /></IconButton>
        <IconButton label={t('redo')} onClick={() => sendCmd('redo')}><IconRedo /></IconButton>
        <IconButton label={t('clear')} className={confirmClear ? '!bg-coral text-white' : ''}
          onClick={() => {
            if (confirmClear) { sendCmd('clear'); setConfirmClear(false); }
            else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 2500); }
          }}><IconTrash /></IconButton>
      </div>
    </div>
  );
}
