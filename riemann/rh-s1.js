'use strict';
/* =====================================================================
   SCENE 1 — THE MYSTERY OF PRIME NUMBERS   (narration 0 – 33.4)
   first primes · divisibility as rectangles · factor tree · the number tower
   (30 integers per turn: every prime above 5 falls in one of only 8 columns)
   ===================================================================== */
const NMAX = 20000;
const ISP = new Uint8Array(NMAX + 1).fill(1); ISP[0] = ISP[1] = 0;
for (let p = 2; p * p <= NMAX; p++) if (ISP[p]) for (let q = p * p; q <= NMAX; q += p) ISP[q] = 0;
const PRIMES = []; for (let n = 2; n <= NMAX; n++) if (ISP[n]) PRIMES.push(n);
const TWIN = new Uint8Array(NMAX + 1); for (let n = 3; n + 2 <= NMAX; n++) if (ISP[n] && ISP[n + 2]) TWIN[n] = 1;

/* ---------- the first numbers, one at a time ---------- */
const PT = { 2: 7.42, 3: 8.25, 5: 9.21, 7: 10.08, 11: 11.02, 13: 12.1, 17: 12.68 };
function sceneFirst(u) {
  const out = 1 - ss(13.5, 14.3, u); if (u < 5.8 || out <= 0) return;
  const c = chan([[6.2, 1], [7.4, 2], [8.25, 3.2], [9.21, 4.6], [10.08, 6.1], [11.02, 8.0], [12.1, 9.6], [13.6, 10.2]], u, sm5);
  for (let n = 1; n <= 17; n++) {
    const y = 900 - (n - c) * 92; if (y < -60 || y > 1980) continue;
    const isP = ISP[n] === 1; let a;
    if (n === 1) a = 0.55 * ss(6.2, 7.2, u);
    else if (isP) a = ss(PT[n] - 0.05, PT[n] + 0.35, u);
    else a = 0.42 * ss(12.2 + n * 0.03, 13.0 + n * 0.03, u);
    let ao = a * (n === 12 || n === 13 ? 1 : out) * (1 - ss(1300, 1480, y)); if (ao <= 0.003) continue;
    const pop = isP ? 1 + 0.25 * Math.exp(-Math.max(0, u - PT[n]) * 3) * (u > PT[n] ? 1 : 0) : 1;
    const size = (isP ? 84 : 52) * pop;
    if (n === 12 || n === 13) ao *= 1 - ss(13.7, 14.2, u);
    if (isP) glowL(540, y, 120 * pop, 0.32 * ao, 'gold');
    const col = isP ? COL.hgold : COL.num;
    TXT.push(() => textLine(ctx, String(n), 540 * S, y * S, size, 400, 0.02, MATHF, col, ao * (isP ? 1 : 0.85), 0));
  }
}

/* ---------- divisible only by 1 and itself: rectangles of dots ---------- */
function dotLayout(n, rows, sp, cx, cy) { // row-major rectangle rows × floor(n/rows); leftovers start a new row
  const cols = Math.floor(n / rows), out = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), k = i % cols;
    const left = r >= rows; out.push([cx + (k - (cols - 1) / 2) * sp, cy + (r - (rows - 1) / 2) * sp + (left ? sp * 0.35 : 0), left]);
  }
  return out;
}
function morph(seq, u) { // seq: [[t, layout], ...]
  let i = 0; while (i < seq.length - 1 && u > seq[i + 1][0]) i++;
  if (i === seq.length - 1 || u <= seq[0][0]) return seq[u <= seq[0][0] ? 0 : i][1].map(p => [p[0], p[1], p[2] ? 1 : 0]);
  const k = sm5((u - seq[i + 1][0] + 0.45) / 0.45), A0 = seq[i][1], A1 = seq[i + 1][1];
  return A0.map((p, j) => [lerp(p[0], A1[j][0], k), lerp(p[1], A1[j][1], k), lerp(p[2] ? 1 : 0, A1[j][2] ? 1 : 0, k)]);
}
function sceneDivide(u) {
  const a = win(u, 13.75, 17.7, 0.5, 0.6); if (a <= 0) return;
  const A = morph([[13.9, dotLayout(12, 1, 72, 540, 560)], [14.55, dotLayout(12, 2, 72, 540, 560)], [15.15, dotLayout(12, 3, 72, 540, 560)]], u);
  const lab12 = u < 14.55 ? '12 = 1 × 12' : u < 15.15 ? '12 = 2 × 6' : '12 = 3 × 4';
  for (const p of A) { glowL(p[0], p[1], 36, 0.22 * a, 'ice'); dotL(p[0], p[1], 15, 0.95 * a, 'ice'); }
  const fit = (s, y, col, aa) => TXT.push(() => textLine(ctx, s, 540 * S, y * S, 46, 400, 0.04, MATHF, col, aa, 0));
  fit(lab12, 340, COL.num, a * ss(13.95, 14.3, u));
  const b = a * ss(14.9, 15.3, u);
  const Bd = morph([[15.1, dotLayout(13, 1, 70, 540, 1160)], [15.55, dotLayout(13, 2, 70, 540, 1160)], [16.0, dotLayout(13, 3, 70, 540, 1160)], [16.45, dotLayout(13, 1, 70, 540, 1160)]], u);
  const gold = ss(16.25, 16.6, u);
  for (const p of Bd) { const bad = p[2] * (1 - gold); const key = bad > 0.5 ? 'crimson' : gold > 0.5 ? 'gold' : 'ice';
    glowL(p[0], p[1], 38, 0.25 * b, key); dotL(p[0], p[1], 15, 0.95 * b, key); }
  const lab13 = u < 15.55 ? '13 = 1 × 13' : u < 16.45 ? '13 = ? × ?' : '13 = 1 × 13';
  fit(lab13, 950, gold > 0.5 || u < 15.55 ? COL.hgold : COL.rose, b);
  if (u > 15.5 && u < 16.45) label(540, 1330, 'ALWAYS ONE LEFT OVER', b * win(u, 15.55, 16.4, 0.2, 0.2), COL.rose, 22, 0.3);
}

/* ---------- every number is built from primes: 360 = 2³ · 3² · 5 ---------- */
const TREE = [ // [value, x, y, parent, level]
  [360, 540, 470, -1, 0], [36, 340, 700, 0, 1], [10, 740, 700, 0, 1],
  [6, 220, 930, 1, 2], [6, 460, 930, 1, 2], [2, 660, 930, 2, 2], [5, 820, 930, 2, 2],
  [2, 160, 1160, 3, 3], [3, 280, 1160, 3, 3], [2, 400, 1160, 4, 3], [3, 520, 1160, 4, 3]];
const LV = [17.4, 17.85, 18.3, 18.75];
function sceneTree(u) {
  const a = win(u, 17.3, 20.9, 0.4, 0.7); if (a <= 0) return;
  const Ls = new Lines();
  for (const [v, x, y, par, lv] of TREE) {
    const k = ss(LV[lv], LV[lv] + 0.45, u); if (k <= 0) continue;
    if (par >= 0) { const P = TREE[par]; const e = ease(k); Ls.addL(P[1], P[2] + 40, lerp(P[1], x, e), lerp(P[2] + 40, y - 40, e), 0.5 * a, 'silver'); }
    const pr = ISP[v] === 1; if (pr) glowL(x, y, 90, 0.35 * a * k, 'gold');
    TXT.push(() => textLine(ctx, String(v), x * S, y * S, pr ? 70 : 58, 400, 0.02, MATHF, pr ? COL.hgold : COL.num, a * k, 0));
  }
  Ls.flush(FINE);
  const f = a * ss(19.1, 19.6, u);
  mathL(540, 1420, ['360', '=', GP('2'), { sup: ['3'] }, '·', GP('3'), { sup: ['2'] }, '·', GP('5')], 78, COL.white, f);
}

/* ---------- the tower of integers ---------- */
const RIBS = [1, 7, 11, 13, 17, 19, 23, 29];
// n -> world position on a cylinder: 30 numbers per turn, one row per turn
function towerPos(n, cx, cz, R, rowH, a0) { const r = Math.floor((n - 1) / 30), c = (n - 1) % 30; const th = a0 + TAU * c / 30;
  return [cx + R * Math.sin(th), r * rowH + 0.25, cz - R * Math.cos(th)]; }
function drawTower(u, o) {
  // o: {cx, cz, R, rowH, a0, alpha, rLo, rHi, zMax, text, ribs, twin, gap, fog}
  const Ls = new Lines(); const minPx = 9;
  for (let r = Math.max(0, o.rLo); r <= o.rHi; r++) for (let c = 0; c < 30; c++) {
    const n = r * 30 + c + 1; if (n > NMAX) break;
    const p = towerPos(n, o.cx, o.cz, o.R, o.rowH, o.a0); if (p[2] - o.cz > o.zMax) continue;
    if (!project(p[0], p[1], p[2]) || PD < 0.7) continue;
    const px = FOCAL * 0.2 / PD / S, x = PX / S, y = PY / S; if (y < -80 || y > 2000 || x < -80 || x > 1160) continue;
    const fog = Math.exp(-PD / o.fog) * clamp((PD - 0.7) / 1.2);
    const pr = ISP[n] === 1; let a = o.alpha * fog * (pr ? 1 : 0.34);
    let key = pr ? 'gold' : 'num';
    if (o.gap && n > 1327 && n < 1361) { a = o.alpha * fog * lerp(0.34, 0.9, o.gap); key = o.gap > 0.4 ? 'crimson' : key; }
    if (o.twin && pr && (TWIN[n] || TWIN[n - 2]) && n < 400) a *= 1 + 0.6 * o.twin;
    if (a < 0.01) continue;
    if (pr) glowL(x, y, px * 2.6, 0.35 * a, 'gold');
    if (o.text && px > minPx) { const col = key === 'crimson' ? COL.rose : pr ? COL.hgold : COL.num; const aa = a * clamp((px - minPx) / 6);
      TXT.push(() => textLine(ctx, String(n), x * S, y * S, px, 400, 0.02, MATHF, col, Math.min(1, aa), 0));
      if (aa < 1) dotL(x, y, Math.max(1.2, px * 0.12), a * (1 - aa), pr ? 'gold' : 'num'); }
    else dotL(x, y, Math.max(1.1, px * 0.16), a * (pr ? 1 : 0.8), key === 'crimson' ? 'crimson' : pr ? 'gold' : 'num');
  }
  if (o.ribs > 0) for (const c of RIBS) { const th = o.a0 + TAU * (c - 1) / 30; const x = o.cx + o.R * Math.sin(th), z = o.cz - o.R * Math.cos(th); if (z - o.cz > o.zMax) continue;
    const y0 = 1 * o.rowH, y1 = (o.rHi + 1) * o.rowH; const segs = 24;
    for (let i = 0; i < segs; i++) { const ya = lerp(y0, y1, i / segs), yb = lerp(y0, y1, (i + 1) / segs); if (!project(x, ya, z)) continue; const d0 = PD; Ls.add3([x, ya, z], [x, yb, z], o.ribs * Math.exp(-d0 / o.fog) * 0.6, 'gold'); } }
  if (o.twin > 0) for (let n = 3; n < 400; n++) if (TWIN[n]) { // arcs linking twin primes
    const p = towerPos(n, o.cx, o.cz, o.R, o.rowH, o.a0), q = towerPos(n + 2, o.cx, o.cz, o.R, o.rowH, o.a0); if (p[2] - o.cz > o.zMax) continue;
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 0.16, (p[2] + q[2]) / 2]; Ls.add3(p, m, o.twin * 0.85, 'turq'); Ls.add3(m, q, o.twin * 0.85, 'turq'); }
  Ls.flush(GLW);
}
function towerCam(u) { // returns [Y target, dist, pitch, yaw]
  return chan([[20.3, [2.2, 7.6, -0.42, 0.0]], [23.8, [3.4, 6.4, -0.52, 0.1]], [26.2, [4.6, 6.0, -0.55, 0.16]], [27.6, [21.6, 6.2, -0.5, -0.5]],
               [29.3, [22.4, 6.4, -0.5, -0.62]], [33.4, [150, 15.5, -0.62, -0.9]]], u, sm5);
}
function sceneTower(u, alpha) {
  if (alpha <= 0.003) return;
  const [Yt, D, P, Y] = towerCam(u); setCam([0, Yt, 0], D, Y, P);
  const rC = Yt / 0.5; const lo = Math.floor(rC - 9 - D * 0.3), hi = Math.ceil(rC + 22 + D * 1.6);
  drawTower(u, { cx: 0, cz: 0, R: 4, rowH: 0.5, a0: 0.015 * u, alpha, rLo: lo, rHi: Math.min(hi, 660), zMax: 2.2, text: true, fog: 9 + D * 0.8,
    ribs: alpha * ss(29.8, 32.4, u), twin: win(u, 24.0, 26.4, 0.5, 0.5), gap: win(u, 27.0, 29.6, 0.6, 0.6) });
  const tw = win(u, 24.2, 26.3, 0.4, 0.5) * alpha; label(540, 300, 'TWIN PRIMES', tw, COL.turq, 26, 0.34); label(540, 342, 'PAIRS JUST 2 APART', tw * 0.8, COL.ice, 19, 0.3);
  const gp = win(u, 27.3, 29.3, 0.4, 0.5) * alpha; label(540, 300, 'A GAP OF 34', gp, COL.rose, 26, 0.34); label(540, 342, 'NO PRIMES BETWEEN 1327 AND 1361', gp * 0.85, COL.ice, 19, 0.26);
  const rb = win(u, 30.2, 33.4, 0.6, 0.5) * alpha; label(540, 300, 'ABOVE 5, EVERY PRIME FALLS IN', rb * 0.85, COL.ice, 19, 0.26); label(540, 338, 'ONLY 8 OF THESE 30 COLUMNS', rb, COL.gold, 24, 0.3);
}

/* ---------- golden primes dissolve into curves (33.0 – 36.6) ---------- */
let STREAM = null;
function buildStream() { // freeze the tower camera at u = 33.0 and record where the visible primes are
  const [Yt, D, P, Y] = towerCam(33.0); setCam([0, Yt, 0], D, Y, P); const R0 = rng(91); STREAM = [];
  const rC = Yt / 0.5;
  for (let r = Math.floor(rC - 20); r < rC + 50; r++) for (const c of RIBS) { const n = r * 30 + c; if (n < 2 || n > NMAX || !ISP[n]) continue;
    const p = towerPos(n, 0, 0, 4, 0.5, 0.015 * 33.0); if (p[2] > 2.2 || !project(...p) || PD < 0.7) continue; const x = PX / S, y = PY / S; if (y < -40 || y > 1960) continue;
    STREAM.push({ x, y, tx: 130 + R0() * 820, ty: 1192 + (R0() - 0.5) * 6, cx: 540 + (R0() - 0.5) * 900, cy: lerp(y, 1192, 0.5) + (R0() - 0.5) * 700, d: R0() * 0.9, f: Math.exp(-PD / (9 + D * 0.8)) }); }
}
function sceneStream(u) {
  if (u < 33.0 || u > 39.8) return; if (!STREAM) buildStream();
  const Ls = new Lines(); const fade = 1 - ss(38.6, 39.7, u);
  for (const s of STREAM) {
    const k = clamp((u - 33.0 - s.d) / 2.6); const at = k2 => { const e = ease(k2), i = 1 - e; return [i * i * s.x + 2 * i * e * s.cx + e * e * s.tx, i * i * s.y + 2 * i * e * s.cy + e * e * s.ty]; };
    const p = at(k); const a = (0.35 + 0.65 * s.f) * fade;
    if (k < 1) { let q = at(Math.max(0, k - 0.12)); Ls.addL(q[0], q[1], p[0], p[1], a * 0.8 * (k > 0 ? 1 : 0), 'gold'); glowL(p[0], p[1], 22, 0.35 * a, 'gold'); dotL(p[0], p[1], 4, a, 'gold'); }
  }
  Ls.flush(GLW);
  const ln = ss(34.6, 36.4, u) * fade; if (ln > 0) { const Lb = new Lines(); Lb.addL(540 - 420 * ln, 1192, 540 + 420 * ln, 1192, 0.9 * ln, 'gold'); Lb.flush(GLW); }
}

function part1(u) {
  sceneFirst(u); sceneDivide(u); sceneTree(u);
  const ta = ss(20.4, 22.4, u) * (1 - ss(32.7, 33.6, u));
  sceneTower(u, ta);
  sceneStream(u);
}
CAPS.push(
  { t0: 7.42, t1: 12.0, s: '2, 3, 5, 7, 11, 13…', size: 50, col: COL.hgold, y: 1640 },
  { t0: 12.1, t1: 13.75, s: 'THE PRIME NUMBERS.', size: 54, y: 1640 },
  { t0: 13.85, t1: 17.15, s: 'DIVISIBLE ONLY BY 1 AND ITSELF', size: 44, y: 1640 },
  { t0: 17.35, t1: 20.3, s: 'THE BUILDING BLOCKS OF EVERY NUMBER', size: 44, y: 1640 },
  { t0: 29.4, t1: 33.3, s: 'IS THERE A HIDDEN PATTERN?', size: 54, y: 1640 },
);
