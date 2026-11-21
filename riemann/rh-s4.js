'use strict';
/* =====================================================================
   SCENE 4 — THE HIDDEN RHYTHM OF THE PRIMES   (narration 80.8 – 94.4)
   three layers: the primes · one oscillation per zero · π(x) rebuilt from
   Riemann's explicit formula with 0 … 100 zeros (data: rh-data.js), then
   li(x) − π(x) inside the bound that the hypothesis would guarantee.
   ===================================================================== */
const WV = RHD.WAVES, NXW = WV.x.length; let CUM = null;
function initPart4() { CUM = []; let cur = Float32Array.from(WV.base); CUM.push(cur);
  for (let k = 0; k < WV.terms.length; k++) { const nx = new Float32Array(NXW); for (let i = 0; i < NXW; i++) nx[i] = cur[i] + WV.terms[k][i]; CUM.push(nx); cur = nx; } }
const GX = x => 90 + x * 9, GY = p => 1700 - p * 24;
const WCOL = ['gold', 'emerald', 'turq', 'sapph', 'violet', 'crimson'];
function sceneRhythm(u) {
  if (u < 81.6 || u > 94.6) return;
  const sq = 1 - ease(clamp((u - 93.0) / 1.25)); C.setTransform(sq, 0, 0, 1, (1 - sq) * W / 2, 0);
  const A = ss(81.8, 83.0, u), txtA = A * (1 - ss(92.6, 93.2, u)), bound = ss(88.6, 89.8, u);
  const Lf = new Lines(), Lg = new Lines(), Lb = new Lines();
  // layer 1 — the primes
  const xr = 100 * ease(clamp((u - 82.6) / 2.2));
  let i = 0; for (const p of PRIMES) { if (p > 100) break; const y = 372 + (i % 3) * 34; i++; if (p > xr) continue; const a = A * (1 - 0.55 * bound);
    glowL(GX(p), y, 16, 0.35 * a, 'gold'); TXT.push(() => textLine(ctx, String(p), GX(p) * S, y * S, 21, 400, 0, MATHF, COL.hgold, txtA * (1 - 0.55 * bound), 0)); Lf.addL(GX(p), y + 14, GX(p), 478, a * 0.22, 'gold'); }
  label(90, 318, 'THE PRIMES', txtA * 0.75, COL.gold, 16, 0.3, 300, 'left');
  // layer 2 — one oscillation per zero (x^ρ terms of the explicit formula)
  const wA = A * (1 - 0.5 * bound);
  for (let k = 0; k < 6; k++) { const yb = 560 + k * 70, rk = ss(85.2 + 0.32 * k, 86.0 + 0.32 * k, u); if (rk <= 0) continue; const xe = 1.6 + 98.4 * rk; const T = WV.terms[k];
    let px = null, py = 0; for (let j = 0; j < NXW; j += 2) { const x = WV.x[j]; if (x > xe) break; const X = GX(x), Y = yb - T[j] * 120; if (px !== null) Lg.addL(px, py, X, Y, wA * 0.9, WCOL[k]); px = X; py = Y; }
    label(80, yb, ZER[k].toFixed(2) + 'i', txtA * rk * 0.8, COL[WCOL[k]], 15, 0.04, 300, 'right'); }
  label(90, 508, 'ONE WAVE FOR EACH ZERO  ½ + γi', txtA * ss(85.2, 86, u) * 0.75, COL.turq, 16, 0.26, 300, 'left');
  // layer 3 — π(x) and its reconstruction
  const st = A * (1 - bound);
  if (st > 0.003) {
    Lf.addL(GX(0), GY(0), GX(100), GY(0), st * 0.5, 'pearl'); Lf.addL(GX(0), GY(0), GX(0), GY(26), st * 0.4, 'pearl');
    for (let x = 0; x <= 100; x += 25) label(GX(x), GY(0) + 28, String(x), txtA * (1 - bound) * 0.6, COL.ice, 16, 0.04, 300);
    for (let p = 5; p <= 25; p += 5) label(GX(0) - 12, GY(p), String(p), txtA * (1 - bound) * 0.6, COL.ice, 16, 0.04, 300, 'right');
    let cnt = 0, lx = 0; for (const p of PRIMES) { if (p > 100) break; const xe = Math.min(p, xr); if (xe > lx) Lb.addL(GX(lx), GY(cnt), GX(xe), GY(cnt), st * 0.85, 'pearl'); if (p > xr) { lx = xe; break; }
      Lb.addL(GX(p), GY(cnt), GX(p), GY(cnt + 1), st * 0.85, 'pearl'); cnt++; lx = p; }
    if (xr >= 97) Lb.addL(GX(97), GY(25), GX(Math.min(100, xr)), GY(25), st * 0.85, 'pearl');
    label(GX(3), GY(24.5), 'π(x)  —  HOW MANY PRIMES UP TO x', txtA * (1 - bound) * ss(83.4, 84.2, u) * 0.85, COL.pearl, 17, 0.14, 300, 'left');
    // approximation with N zeros
    const nk = clamp((u - 85.9) / 6.0); const Nf = u < 85.9 ? 0 : Math.min(100, Math.exp(Math.log(101) * ease(nk)) - 1); const N0 = Math.floor(Nf), fr = Nf - N0;
    const ca = st * ss(84.4, 85.3, u); const key = Nf < 0.5 ? 'turq' : 'gold';
    let px = null, py = 0; for (let j = 0; j < NXW; j++) { const x = WV.x[j]; const v = lerp(CUM[N0][j], CUM[Math.min(100, N0 + 1)][j], fr); const X = GX(x), Y = GY(v); if (px !== null) Lg.addL(px, py, X, Y, ca, key); px = X; py = Y; }
    mathL(540, 1068, [{ sans: 'ZEROS USED  ' }, String(Math.round(Nf))], 54, COL.hgold, txtA * (1 - bound) * ss(85.6, 86.2, u));
    label(540, 1760, Nf < 0.5 ? 'SMOOTH TREND — NO ZEROS YET' : 'SMOOTH TREND + WAVES FROM THE ZEROS', txtA * (1 - bound) * ss(84.6, 85.3, u) * 0.8, COL.ice, 17, 0.22, 300);
  }
  // the bound the hypothesis would give: |π(x) − li(x)| < √x ln x / 8π  (x ≥ 2657)
  if (bound > 0.003) {
    const BX = x => 90 + x / 1e6 * 900, Y0 = 1420, k = 300 / 550, BD = RHD.BOUND, a = bound * A;
    C.globalCompositeOperation = 'lighter'; C.fillStyle = rgba(COL.emerald, 0.12 * a); C.beginPath(); C.moveTo(BX(BD[0][0]) * S, (Y0 - BD[0][2] * k) * S);
    for (const r of BD) C.lineTo(BX(r[0]) * S, (Y0 - r[2] * k) * S); for (let j = BD.length - 1; j >= 0; j--) C.lineTo(BX(BD[j][0]) * S, (Y0 + BD[j][2] * k) * S); C.closePath(); C.fill();
    for (let j = 1; j < BD.length; j++) { const [x0, d0, b0] = BD[j - 1], [x1, d1, b1] = BD[j];
      Lf.addL(BX(x0), Y0 - b0 * k, BX(x1), Y0 - b1 * k, a * 0.6, 'emerald'); Lf.addL(BX(x0), Y0 + b0 * k, BX(x1), Y0 + b1 * k, a * 0.6, 'emerald');
      if (BX(x1) <= lerp(90, 990, ss(89.0, 91.4, u))) Lb.addL(BX(x0), Y0 - d0 * k, BX(x1), Y0 - d1 * k, a, 'gold'); }
    Lf.addL(90, Y0, 990, Y0, a * 0.3, 'pearl');
    for (const [x, s] of [[0, '0'], [5e5, '500,000'], [1e6, '1,000,000']]) label(BX(x), Y0 + 330, s, txtA * bound * 0.6, COL.ice, 16, 0.06, 300);
    label(990, Y0 - 330, 'BOUND IF THE HYPOTHESIS IS TRUE', txtA * bound * 0.8, COL.emerald, 15, 0.2, 300, 'right');
    label(110, Y0 - 120, 'li(x) − π(x)', txtA * bound * ss(90.0, 90.8, u), COL.hgold, 20, 0.06, 300, 'left');
    mathL(540, 990, ['|', { i: 'π' }, '(', { i: 'x' }, ')', '−', { r: 'li' }, '(', { i: 'x' }, ')', '|', '<', { frac: [{ sq: [{ i: 'x' }] }, { r: ' ln ' }, { i: 'x' }], den: ['8', { i: 'π' }] }], 50, COL.pearl, txtA * bound);
    label(540, 1062, 'SCHOENFELD 1976 · FOR ALL x ≥ 2657 — IF RH HOLDS', txtA * bound * 0.6, COL.ice, 14, 0.2, 300);
  }
  Lf.flush(FINE); Lb.flush(GLW); Lg.flush(GLW);
  // contraction into one golden line
  C.setTransform(1, 0, 0, 1, 0, 0);
  const gl = win(u, 93.2, 95.2, 0.6, 1.0); if (gl > 0) { const Lx = new Lines(); Lx.addL(540, -20, 540, 1940, gl, 'gold'); Lx.flush(BOLD); }
}
CAPS.push(
  { t0: 82.7, t1: 85.5, s: 'THE ZEROS AND THE PRIMES…', size: 46, y: 200 },
  { t0: 85.6, t1: 88.4, s: 'ARE DEEPLY CONNECTED.', size: 50, y: 200, col: COL.hgold },
  { t0: 89.6, t1: 93.0, s: 'ORDER HIDDEN WITHIN IRREGULARITY.', size: 42, y: 200 },
);
