import { CANVAS_H, CANVAS_W, COORD_SCALE, type Stroke } from '@wene/shared';

/**
 * Every client renders onto the same fixed-size backing bitmap (CANVAS_W × CANVAS_H),
 * scaled with CSS. Coordinates travel normalised to [0, COORD_SCALE], so strokes and
 * flood fills land identically on every screen size and pixel density.
 */
export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  constructor(readonly canvas: HTMLCanvasElement) {
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.clear();
  }

  private X = (v: number) => (v / COORD_SCALE) * CANVAS_W;
  private Y = (v: number) => (v / COORD_SCALE) * CANVAS_H;

  clear() {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  redraw(strokes: Stroke[]) {
    this.clear();
    for (const s of strokes) this.drawStroke(s, 0);
  }

  drawStroke(s: Stroke, fromPoint: number) {
    if (s.kind === 'fill') return this.fill(s.x, s.y, s.c);
    const ctx = this.ctx;
    const color = s.e ? '#FFFFFF' : s.c;
    const pts = s.p;
    const n = pts.length / 2;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = s.s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (n === 1) {
      ctx.beginPath();
      ctx.arc(this.X(pts[0]), this.Y(pts[1]), s.s / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    // Quadratic smoothing through midpoints. Re-drawing an overlapping tail is harmless (opaque colours).
    const start = Math.max(0, fromPoint - 2);
    const px = (i: number) => this.X(pts[i * 2]);
    const py = (i: number) => this.Y(pts[i * 2 + 1]);
    ctx.beginPath();
    if (start === 0) ctx.moveTo(px(0), py(0));
    else ctx.moveTo((px(start - 1) + px(start)) / 2, (py(start - 1) + py(start)) / 2);
    for (let i = Math.max(1, start); i < n - 1; i++) {
      ctx.quadraticCurveTo(px(i), py(i), (px(i) + px(i + 1)) / 2, (py(i) + py(i + 1)) / 2);
    }
    ctx.lineTo(px(n - 1), py(n - 1));
    ctx.stroke();
  }

  /** Scanline flood fill with a small tolerance to swallow anti-aliased edges. */
  fill(nx: number, ny: number, hex: string) {
    const x0 = Math.min(CANVAS_W - 1, Math.max(0, Math.floor(this.X(nx))));
    const y0 = Math.min(CANVAS_H - 1, Math.max(0, Math.floor(this.Y(ny))));
    const img = this.ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const data = new Uint32Array(img.data.buffer);
    const target = data[y0 * CANVAS_W + x0];
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    // ImageData is RGBA in memory; on little-endian platforms the Uint32 is ABGR.
    const fillColor = (255 << 24) | (b << 16) | (g << 8) | r;
    if (target === (fillColor >>> 0) || target === fillColor) return;
    const tr = target & 255, tg = (target >> 8) & 255, tb = (target >> 16) & 255;
    const TOL = 64;
    const match = (c: number) => Math.abs((c & 255) - tr) + Math.abs(((c >> 8) & 255) - tg) + Math.abs(((c >> 16) & 255) - tb) <= TOL;
    const seen = new Uint8Array(CANVAS_W * CANVAS_H);
    const stack = [x0, y0];
    while (stack.length) {
      const y = stack.pop()!;
      let x = stack.pop()!;
      let i = y * CANVAS_W + x;
      while (x > 0 && !seen[i - 1] && match(data[i - 1])) { x--; i--; }
      let up = false, down = false;
      for (; x < CANVAS_W && !seen[i] && match(data[i]); x++, i++) {
        data[i] = fillColor;
        seen[i] = 1;
        if (y > 0) {
          const u = i - CANVAS_W;
          if (!seen[u] && match(data[u])) { if (!up) { stack.push(x, y - 1); up = true; } } else up = false;
        }
        if (y < CANVAS_H - 1) {
          const d = i + CANVAS_W;
          if (!seen[d] && match(data[d])) { if (!down) { stack.push(x, y + 1); down = true; } } else down = false;
        }
      }
    }
    // Grow the fill by one pixel into the anti-aliased border so no white halo remains.
    const out = new Uint32Array(data);
    for (let y = 1; y < CANVAS_H - 1; y++) {
      for (let x = 1; x < CANVAS_W - 1; x++) {
        const i = y * CANVAS_W + x;
        if (seen[i]) continue;
        if (seen[i - 1] || seen[i + 1] || seen[i - CANVAS_W] || seen[i + CANVAS_W]) {
          const c = data[i];
          const lum = (c & 255) + ((c >> 8) & 255) + ((c >> 16) & 255);
          const tl = tr + tg + tb;
          if (Math.abs(lum - tl) < 300) out[i] = fillColor;
        }
      }
    }
    data.set(out);
    this.ctx.putImageData(img, 0, 0);
  }
}
