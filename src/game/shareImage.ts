import type { GameState } from './engine';
import type { LetterState } from './evaluate';
import { MAX_GUESSES, WORD_LENGTH } from '../data/dictionary';
import { kuNum } from '../i18n';

/**
 * Renders a 1080×1350 result card (good for WhatsApp/Instagram stories).
 * Like the text share, it shows only colours — never the letters or answer.
 */
const W = 1080;
const H = 1350;
const FONT = '"Noto Sans Arabic", system-ui, sans-serif';

const COLORS: Record<LetterState, string> = { correct: '#22A06B', present: '#D4A72C', absent: '#3B4659' };
const COLORS_HC: Record<LetterState, string> = { correct: '#F5793A', present: '#3D8FD6', absent: '#3B4659' };

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, rOut: number, rIn: number, rays: number) {
  ctx.beginPath();
  for (let i = 0; i < rays; i++) {
    const a = (i * 2 * Math.PI) / rays - Math.PI / 2;
    const half = Math.PI / rays / 1.15;
    ctx.moveTo(cx + rOut * Math.cos(a), cy + rOut * Math.sin(a));
    ctx.lineTo(cx + rIn * Math.cos(a - half), cy + rIn * Math.sin(a - half));
    ctx.lineTo(cx + rIn * Math.cos(a + half), cy + rIn * Math.sin(a + half));
    ctx.closePath();
  }
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, rIn + rIn * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawFlag(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const h = (w * 2) / 3;
  ctx.save();
  roundRect(ctx, x, y, w, h, w * 0.08);
  ctx.clip();
  ctx.fillStyle = '#ED2024';
  ctx.fillRect(x, y, w, h / 3);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y + h / 3, w, h / 3);
  ctx.fillStyle = '#278E43';
  ctx.fillRect(x, y + (2 * h) / 3, w, h / 3);
  ctx.fillStyle = '#FEBD11';
  drawSun(ctx, x + w / 2, y + h / 2, h * 0.225, h * 0.12, 21);
  ctx.restore();
}

function drawKilim(ctx: CanvasRenderingContext2D, y: number) {
  const step = 36;
  for (let x = 0; x < W + step; x += step) {
    ctx.strokeStyle = 'rgba(47,191,128,.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + step / 2, y - 9);
    ctx.lineTo(x + step, y);
    ctx.lineTo(x + step / 2, y + 9);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(242,185,41,.8)';
    ctx.beginPath();
    ctx.moveTo(x + step / 2, y - 3.5);
    ctx.lineTo(x + step / 2 + 3.5, y);
    ctx.lineTo(x + step / 2, y + 3.5);
    ctx.lineTo(x + step / 2 - 3.5, y);
    ctx.closePath();
    ctx.fill();
  }
}

export interface ShareImageOptions {
  highContrast?: boolean;
  url?: string;
}

export async function renderShareImage(game: GameState, opts: ShareImageOptions = {}): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load(`800 120px ${FONT}`, 'وشە'),
      document.fonts.load(`700 48px ${FONT}`, 'وشە'),
    ]);
  } catch {
    /* fall back to system fonts */
  }

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0F172A');
  bg.addColorStop(1, '#16233A');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  drawKilim(ctx, 40);
  drawKilim(ctx, H - 40);

  // Logo: tile with sun + wordmark
  const logoX = W / 2 + 40;
  const grad = ctx.createLinearGradient(logoX, 110, logoX + 120, 230);
  grad.addColorStop(0, '#2FBF80');
  grad.addColorStop(1, '#178A5A');
  ctx.fillStyle = grad;
  roundRect(ctx, logoX, 110, 120, 120, 32);
  ctx.fill();
  ctx.fillStyle = '#F2B929';
  drawSun(ctx, logoX + 60, 170, 44, 22, 12);

  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  ctx.fillStyle = '#F1F5F9';
  ctx.font = `800 120px ${FONT}`;
  ctx.fillText('وشە', logoX - 30, 200);
  ctx.direction = 'ltr';
  ctx.textAlign = 'left';
  ctx.font = `700 30px system-ui, sans-serif`;
  ctx.fillStyle = '#94A3B8';
  const latin = 'W U S H A';
  ctx.fillText(latin, logoX - 30 - ctx.measureText(latin).width, 262);

  // Title line
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#CBD5E1';
  ctx.font = `700 46px ${FONT}`;
  const title =
    game.mode === 'unlimited'
      ? 'یاریی بێسنوور'
      : `وشەی ڕۆژ #${kuNum(game.puzzleNumber)}${game.mode === 'archive' ? ' (ئەرشیف)' : ''}`;
  ctx.fillText(title, W / 2, 345);

  // Grid — first letter on the RIGHT, as on screen
  const tile = 104;
  const gap = 14;
  const gridW = WORD_LENGTH * tile + (WORD_LENGTH - 1) * gap;
  const gx = (W - gridW) / 2;
  const gy = 395;
  const palette = opts.highContrast ? COLORS_HC : COLORS;
  for (let r = 0; r < MAX_GUESSES; r++) {
    const guess = game.guesses[r];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const x = gx + (WORD_LENGTH - 1 - c) * (tile + gap);
      const y = gy + r * (tile + gap);
      roundRect(ctx, x, y, tile, tile, 22);
      if (guess) {
        ctx.fillStyle = palette[guess.states[c]];
        ctx.fill();
      } else {
        ctx.strokeStyle = 'rgba(148,163,184,.25)';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  }

  // Score
  const score = game.status === 'won' ? kuNum(game.guesses.length) : 'X';
  ctx.fillStyle = '#F1F5F9';
  ctx.font = `800 64px ${FONT}`;
  ctx.direction = 'ltr';
  ctx.fillText(`${score}/${kuNum(MAX_GUESSES)}${game.hard ? '*' : ''}${game.hints?.length ? ` 💡${kuNum(game.hints.length)}` : ''}`, W / 2, gy + MAX_GUESSES * (tile + gap) + 62);

  // Footer: flag + link
  drawFlag(ctx, W / 2 - 33, H - 158, 66);
  ctx.fillStyle = '#94A3B8';
  ctx.font = `600 34px system-ui, sans-serif`;
  ctx.fillText(opts.url ? opts.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'WUSHA', W / 2, H - 66);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'),
  );
}
