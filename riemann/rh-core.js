'use strict';
/* =====================================================================
   THE RIEMANN HYPOTHESIS — core: timing, helpers, camera, lines, text, background
   Native 9:16 composition (logical canvas 1080 × 1920). renderFrame(t) is a
   pure function of time; every cue is locked to the narration (u = narration time).
   ===================================================================== */
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const LW = 1080, LH = 1920;
const VO = [{ f: 'vo.mp3', at: 0.8, len: 136.99 }];
const VO0 = VO[0].at;
const DURATION = 145.0; window.__DURATION = DURATION;

const canvas = document.getElementById('c'); const ctx = canvas.getContext('2d');
const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; };
const [fg, C] = mk(); const [bA, bAc] = mk(); const [bB, bBc] = mk();
let W = 0, H = 0, S = 1, FOCAL = 1;

/* ---------- helpers ---------- */
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, k) => a + (b - a) * k;
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
const sm5 = k => { k = clamp(k); return k * k * k * (k * (k * 6 - 15) + 10); };
const ease = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
const win = (t, a, b, fi = 0.8, fo = 0.8) => ss(a, a + fi, t) * (1 - ss(b - fo, b, t));
const frac = x => x - Math.floor(x);
const TAU = Math.PI * 2;
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(R) { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()); }
function chan(keys, t, e = ease) { if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1] = keys[i + 1]; if (t <= t1) { const k = e((t - t0) / (t1 - t0)); return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], k)) : lerp(v0, v1, k); } }
  return keys[keys.length - 1][1]; }
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${clamp(a).toFixed(4)})`;
const mixc = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const hash = n => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);

const COL = {
  white: [255, 250, 240], ice: [215, 235, 255], silver: [215, 222, 245], warm: [255, 236, 210],
  gold: [255, 200, 90], amber: [255, 150, 50], crimson: [235, 45, 70], coral: [255, 120, 95], orange: [255, 125, 40],
  cyan: [110, 225, 255], turq: [50, 225, 210], sapph: [55, 115, 255], emerald: [40, 215, 140],
  violet: [150, 90, 255], uv: [115, 60, 255], cobalt: [60, 105, 255], magenta: [240, 75, 220],
  hgold: [255, 222, 160], pearl: [235, 240, 255], dim: [120, 120, 150], num: [200, 210, 235], rose: [255, 110, 130],
};

/* ---------- sprites ---------- */
let GLOW = {}, NOISE;
function makeGlow(rgb, size, hard) { const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (let k = 0; k <= 16; k++) { const x = k / 16, a = (hard ? Math.exp(-x * x * 14) : Math.exp(-x * x * 5.2)) * (x >= 1 ? 0 : 1), wm = Math.exp(-x * x * (hard ? 60 : 22));
    gr.addColorStop(x, `rgba(${Math.round(lerp(rgb[0], 255, wm))},${Math.round(lerp(rgb[1], 255, wm))},${Math.round(lerp(rgb[2], 255, wm))},${a.toFixed(4)})`); }
  g.fillStyle = gr; g.fillRect(0, 0, size, size); return c; }
function makeNoise() { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const id = g.createImageData(256, 256); const R = rng(77);
  for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); return c; }
// device-pixel sprites
function glowPx(x, y, r, a, key) { if (a <= 0.002 || r <= 0.05) return; C.globalAlpha = Math.min(1, a); C.drawImage(GLOW[key], x - r, y - r, 2 * r, 2 * r); }
function dotPx(x, y, r, a, key) { if (a <= 0.002 || r <= 0.05) return; C.globalAlpha = Math.min(1, a); C.drawImage(GLOW[key + '_h'], x - r, y - r, 2 * r, 2 * r); }
// logical-coordinate sprites
const glowL = (x, y, r, a, key) => glowPx(x * S, y * S, r * S, a, key);
const dotL = (x, y, r, a, key) => dotPx(x * S, y * S, r * S, a, key);

/* ---------- camera ---------- */
const cam = { tx: 0, ty: 0, tz: 0, dist: 5, cy: 1, sy: 0, cp: 1, sp: 0, oy: 0, roll: 0 };
function setCam(tg, dist, yaw, pitch, oy = 0) { cam.tx = tg[0]; cam.ty = tg[1]; cam.tz = tg[2]; cam.dist = dist; cam.cy = Math.cos(yaw); cam.sy = Math.sin(yaw); cam.cp = Math.cos(pitch); cam.sp = Math.sin(pitch); cam.oy = oy; }
let PX = 0, PY = 0, PD = 0;
function project(x, y, z) { const dx = x - cam.tx, dy = y - cam.ty, dz = z - cam.tz; const x1 = dx * cam.cy - dz * cam.sy, z1 = dx * cam.sy + dz * cam.cy;
  const y2 = dy * cam.cp - z1 * cam.sp, z2 = dy * cam.sp + z1 * cam.cp; const d = cam.dist - z2; if (d < 0.05) return false; PD = d; PX = W * 0.5 + FOCAL * x1 / d; PY = H * 0.5 + cam.oy * S - FOCAL * y2 / d; return true; }
class Lines { constructor() { this.b = new Map(); }
  add(x1, y1, x2, y2, a, key) { if (a < 0.004) return; const q2 = Math.min(15, Math.floor(a * 16)); const k = key + '|' + q2; let arr = this.b.get(k); if (!arr) { arr = []; this.b.set(k, arr); } arr.push(x1, y1, x2, y2); }
  addL(x1, y1, x2, y2, a, key) { this.add(x1 * S, y1 * S, x2 * S, y2 * S, a, key); }
  add3(p, r, a, key) { if (a < 0.004) return; if (!project(p[0], p[1], p[2])) return; const x1 = PX, y1 = PY; if (!project(r[0], r[1], r[2])) return; this.add(x1, y1, PX, PY, a, key); }
  poly3(pts, a, key, closed) { let px = 0, py = 0, ok = false; const n = pts.length;
    for (let i = 0; i <= (closed ? n : n - 1); i++) { const p = pts[i % n]; const v = project(p[0], p[1], p[2]); const aa = typeof a === 'function' ? a(i) : a; if (v && ok) this.add(px, py, PX, PY, aa, key); ok = v; px = PX; py = PY; } }
  polyL(pts, a, key, closed) { const n = pts.length; for (let i = 1; i <= (closed ? n : n - 1); i++) { const p = pts[i - 1], q = pts[i % n]; this.add(p[0] * S, p[1] * S, q[0] * S, q[1] * S, typeof a === 'function' ? a(i) : a, key); } }
  flush(passes, mul = 1) { C.lineCap = 'round'; C.lineJoin = 'round'; C.globalAlpha = 1; C.globalCompositeOperation = 'lighter';
    for (const [w, am, tw] of passes) { C.lineWidth = Math.max(0.5, w * S);
      for (const [k, arr] of this.b) { const i = k.indexOf('|'), key = k.slice(0, i), q2 = +k.slice(i + 1); const a = (q2 + 0.5) / 16 * am * mul; if (a < 0.002) continue;
        C.strokeStyle = rgba(mixc(COL[key], [255, 255, 255], tw), a); C.beginPath(); for (let j = 0; j < arr.length; j += 4) { C.moveTo(arr[j], arr[j + 1]); C.lineTo(arr[j + 2], arr[j + 3]); } C.stroke(); } }
    this.b.clear(); } }
const GLW = [[7, 0.06, 0], [2.4, 0.24, 0.15], [0.9, 0.85, 0.55]], FINE = [[2.2, 0.16, 0], [0.8, 0.7, 0.3]], BOLD = [[12, 0.05, 0], [4, 0.2, 0.1], [1.6, 0.9, 0.5]];

/* ---------- text (drawn after bloom on the main canvas) ---------- */
const SANS = 'Inter, "Helvetica Neue", Arial, sans-serif', SYMF = '"EB Garamond", Georgia, serif';
let TXT = []; const CAPS = [];
function textLine(g, s, x, y, size, weight, ls, fam, col, a, blur, align = 'center', italic = false) {
  g.font = `${italic ? 'italic ' : ''}${weight} ${size * S}px ${fam}`; g.letterSpacing = `${(ls * size * S).toFixed(2)}px`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const w = g.measureText(s).width, L = ls * size * S; const x0 = align === 'center' ? x - (w - L) / 2 : align === 'right' ? x - (w - L) : x;
  if (blur > 0.05) g.filter = `blur(${(blur * S).toFixed(2)}px)`; g.fillStyle = rgba(col, a); g.fillText(s, x0, y); g.filter = 'none'; g.letterSpacing = '0px'; return w - L; }
function fitSize(s, size, weight, ls, fam, maxW = 0.88) { const g = ctx; g.font = `${weight} ${size * S}px ${fam}`; g.letterSpacing = `${(ls * size * S).toFixed(2)}px`; const w = g.measureText(s).width; g.letterSpacing = '0px'; return w > W * maxW ? size * W * maxW / w : size; }
// label in logical coordinates (queued for the text pass)
function label(x, y, s, a, col = COL.ice, size = 22, ls = 0.24, weight = 400, align = 'center') { if (a > 0.003) TXT.push(() => { const fs = fitSize(s, size, weight, ls, SANS, 0.92); textLine(ctx, s, x * S, y * S, fs, weight, ls, SANS, col, a, 0, align); }); }
/* formula / symbol layout: tokens are strings (Inter caps) or {s, sup, sub, bar, col} particle symbols (EB Garamond italic) */
function formulaWidth(g, toks, size) { let w = 0; for (const tk of toks) w += tokW(g, tk, size); return w; }
function tokW(g, tk, size) { if (typeof tk === 'string') { g.font = `300 ${size * 0.62 * S}px ${SANS}`; g.letterSpacing = `${(0.12 * size * 0.62 * S).toFixed(2)}px`; const w = g.measureText(tk).width; g.letterSpacing = '0px'; return w; }
  g.font = `italic 400 ${size * S}px ${SYMF}`; let w = g.measureText(tk.s).width; g.font = `400 ${size * 0.5 * S}px ${SANS}`; const ws = Math.max(tk.sup ? g.measureText(tk.sup).width : 0, tk.sub ? g.measureText(tk.sub).width : 0); return w + ws + (ws ? size * 0.04 * S : 0) + size * 0.06 * S; }
function formula(g, toks, x, y, size, col, a, glow = 0) { // x,y device px (center)
  if (a <= 0.003) return; let cx = x - formulaWidth(g, toks, size) / 2; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  if (glow) { g.shadowColor = rgba(col, 0.8 * a); g.shadowBlur = glow * S; }
  for (const tk of toks) {
    if (typeof tk === 'string') { g.font = `300 ${size * 0.62 * S}px ${SANS}`; g.letterSpacing = `${(0.12 * size * 0.62 * S).toFixed(2)}px`; g.fillStyle = rgba(col, a); g.fillText(tk, cx, y + size * 0.21 * S); cx += g.measureText(tk).width; g.letterSpacing = '0px'; continue; }
    const c2 = tk.col || col; g.font = `italic 400 ${size * S}px ${SYMF}`; const w = g.measureText(tk.s).width; g.fillStyle = rgba(c2, a); g.fillText(tk.s, cx, y + size * 0.3 * S);
    if (tk.bar) { g.fillRect(cx + w * 0.12, y - size * 0.44 * S, w * 0.82, Math.max(1, size * 0.045 * S)); }
    g.font = `400 ${size * 0.5 * S}px ${SANS}`; let ws = 0;
    if (tk.sup) { g.fillText(tk.sup, cx + w + size * 0.03 * S, y - size * 0.12 * S); ws = g.measureText(tk.sup).width; }
    if (tk.sub) { g.fillText(tk.sub, cx + w + size * 0.01 * S, y + size * 0.44 * S); ws = Math.max(ws, g.measureText(tk.sub).width); }
    cx += w + ws + (ws ? size * 0.04 * S : 0) + size * 0.06 * S; }
  g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; }
const fml = (x, y, toks, size, col, a, glow = 0) => { if (a > 0.003) TXT.push(() => formula(ctx, toks, x * S, y * S, size, col, a, glow)); };
// captions: large, mobile-readable, inside the central safe area
function caption(t, c) { const a = win(t, c.t0, c.t1, c.fi ?? 0.9, c.fo ?? 0.8); if (a <= 0) return; const g = ctx; const p = sm5((t - c.t0) / 1.4);
  g.globalCompositeOperation = 'source-over'; g.shadowColor = `rgba(0,0,0,${(0.7 * a).toFixed(3)})`; g.shadowBlur = 26 * S;
  const size = c.size ?? 50, wt = c.weight ?? 300, ls = c.ls ?? 0.16; const fs = fitSize(c.s, size, wt, ls, SANS, 0.86);
  textLine(g, c.s, LW / 2 * S, ((c.y ?? 1500) + 8 * (1 - p)) * S, fs, wt, ls + 0.04 * (1 - p), SANS, c.col ?? [255, 255, 255], a * (c.alpha ?? 0.97), 6 * (1 - ss(c.t0, c.t0 + 0.8, t)) + 3 * ss(c.t1 - (c.fo ?? 0.8), c.t1, t));
  g.shadowBlur = 0; g.shadowColor = 'rgba(0,0,0,0)'; }

/* ---------- colour-field background ---------- */
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PAL = {
  night: ['#010208', '#050b24', '#0c1a4a', '#1a2c70', '#8a6a2a'].map(hex),
  sapph: ['#01060e', '#041a36', '#0a3a5a', '#0e6a58', '#c09a40'].map(hex),
  violet: ['#03020c', '#0c0830', '#261660', '#4a2a8a', '#8a6ad0'].map(hex),
  emer: ['#02040c', '#08103a', '#0a3a48', '#10805e', '#d0b050'].map(hex),
  dark: ['#000000', '#020208', '#060614', '#0c0c22', '#1a1a36'].map(hex),
};
const [bgS, bgSc] = mk(), [bgM, bgMc] = mk(); const BW = 135, BH = 240; bgS.width = BW; bgS.height = BH; let bgData = null;
function ramp(pal, v) { const n = pal.length - 1, f = clamp(v) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i, a = pal[i], b = pal[i + 1]; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
function background(t, wts, fade, fx = 0.5, fy = 0.45) {
  if (!bgData) bgData = bgSc.createImageData(BW, BH); const d = bgData.data; const act = []; for (const k in wts) if (wts[k] > 0.002) act.push([wts[k], PAL[k]]);
  if (!act.length || fade <= 0.002) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  for (let y = 0; y < BH; y++) { const v = y / BH * 1.778;
    for (let x = 0; x < BW; x++) { const u = x / BW;
      const q1 = Math.sin(u * 2.1 + t * 0.11) + Math.sin(v * 1.9 - t * 0.09 + u * 1.3), q2 = Math.sin(v * 1.6 + t * 0.07 + q1 * 0.8) + 0.6 * Math.sin(u * 2.7 - t * 0.06);
      const f = 0.5 + 0.5 * Math.sin(u * 1.5 + v * 1.2 + q1 * 0.9 + q2 * 0.8 + t * 0.09);
      const dx = (u - fx), dy = (y / BH - fy) * 1.778, rr = dx * dx + dy * dy; const lum = (0.4 + 0.18 * Math.sin(u * 2.3 - v * 1.6 + q2 + t * 0.13)) * (0.5 + 0.65 * Math.exp(-rr / 0.25)) * (1 - 0.45 * Math.min(1, rr * 0.6));
      let r = 0, g = 0, b = 0; for (const [w, pal] of act) { const c = ramp(pal, f * 0.8 + 0.06); r += w * c[0] * lum; g += w * c[1] * lum; b += w * c[2] * lum; }
      const i = (y * BW + x) * 4; d[i] = r * fade; d[i + 1] = g * fade; d[i + 2] = b * fade; d[i + 3] = 255; } }
  bgSc.putImageData(bgData, 0, 0); bgMc.filter = 'blur(3px)'; bgMc.drawImage(bgS, -8, -8, bgM.width + 16, bgM.height + 16); bgMc.filter = 'none';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bgM, 0, 0, W, H);
}
