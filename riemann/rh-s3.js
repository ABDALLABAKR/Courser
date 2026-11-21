'use strict';
/* =====================================================================
   SCENE 3 — THE ZEROS (narration 57.8 – 82.6) and
   SCENE 5 — THE UNSOLVED MYSTERY (93.8 – end), both on the complex plane.
   Zeros are drawn at their true heights (first 400, from mpmath).
   ===================================================================== */
function planeCam(u) {
  return chan([[48.6, [0.75, 2.5, 5.9, 0, 0]], [52.5, [0.75, 2.5, 5.9, 0, 0]], [54.0, [0.85, 2.2, 6.6, 0, -1.02]], [55.8, [0.6, 1.8, 4.6, 0.32, -1.06]],
    [57.5, [0.5, 1.42, 2.6, 0.12, -0.92]], [60.4, [-2.0, 5.2, 11.2, 0, 0]], [63.4, [-2.0, 5.2, 11.2, 0, 0]], [65.3, [0.5, 2.47, 3.86, 0, 0]],
    [76.3, [0.5, 2.47, 3.86, 0, 0]], [80.8, [0.5, 8.6, 4.4, 0, 0]], [82.6, [0.5, 9.4, 4.4, 0, 0]],
    [93.9, [0.5, 2.9, 3.86, 0, 0]], [99.2, [0.5, 5.4, 4.0, 0, 0]], [103.2, [0.5, 38, 11, 0, 0]], [106.3, [0.5, 61.4, 6.4, 0, 0]], [115.6, [0.5, 62.6, 5.0, 0, 0]],
    [119.6, [0.5, 63.0, 5.0, 0, 0]], [122.4, [0.5, 66.5, 6.0, 0, -1.25]], [129.6, [0.5, 30, 46, 0.32, -0.42]], [145, [0.5, 32, 52, 0.4, -0.4]]], u, sm5);
}
function planeCamSet(u) { const c = planeCam(u); setCam([c[0], c[1], 0], c[2], c[3], c[4]); }

function sceneZeros(u) { // scene 3
  if (u < 57.6 || u > 83) return; planeCamSet(u);
  const out = 1 - ss(81.4, 82.5, u);
  const grid = ss(57.9, 59.8, u) * out, strip = win(u, 63.4, 83, 1.4, 0.1) * out;
  drawPlane(u, { grid, axes: grid, strip, line: ss(69.6, 70.4, u) * out, lineGrow: ss(69.6, 71.2, u), lineFrom: 0,
    zeros: out, zA: k => ss(67.0 + 0.24 * Math.min(k, 12), 67.4 + 0.24 * Math.min(k, 12), u), zR: 0.05 });
  // wide view: axes, trivial zeros, pole
  const wv = win(u, 58.6, 64.8, 0.9, 0.9);
  if (wv > 0) {
    for (let s = -7; s <= 3; s++) { const p = wl(s, 0); if (p && s !== 0) label(p[0], p[1] + 30, s < 0 ? '−' + (-s) : String(s), wv * 0.7, COL.ice, 18, 0.1, 300); }
    for (const s of [-2, -4, -6]) { const p = wl(s, 0); if (!p) continue; glowL(p[0], p[1], 26, 0.4 * wv, 'ice'); dotL(p[0], p[1], 6, wv, 'pearl'); }
    const tz = wl(-4, 0); if (tz) { label(tz[0], tz[1] + 74, 'TRIVIAL ZEROS  −2, −4, −6, …', wv * 0.9, COL.pearl, 19, 0.2); }
    const pl = wl(1, 0); if (pl) { const Lc = new Lines(); for (let i = 0; i < 24; i++) Lc.addL(pl[0] + 11 * Math.cos(i / 24 * TAU), pl[1] + 11 * Math.sin(i / 24 * TAU), pl[0] + 11 * Math.cos((i + 1) / 24 * TAU), pl[1] + 11 * Math.sin((i + 1) / 24 * TAU), wv, 'crimson'); Lc.flush(GLW); label(pl[0] + 6, pl[1] - 34, 'POLE', wv * 0.9, COL.rose, 17, 0.24); }
    const re = wl(2.7, 0); if (re) label(re[0], re[1] - 32, 'Re(s)', wv, COL.pearl, 22, 0.08);
    const im = wl(0, 8.8); if (im) label(im[0] + 54, im[1], 'Im(s)', wv, COL.pearl, 22, 0.08);
    mathL(540, 300, [{ i: 's' }, '=', { i: 'σ' }, '+', { i: 'it' }], 70, COL.pearl, win(u, 59.0, 63.4, 0.8, 0.7), 8);
    label(540, 380, 'A COMPLEX NUMBER: REAL PART  +  IMAGINARY PART', win(u, 59.4, 63.4, 0.8, 0.7) * 0.8, COL.ice, 18, 0.22, 300);
  }
  // close view: imaginary-axis ticks
  const cv = ss(64.6, 65.8, u) * out;
  if (cv > 0) for (let k = 1; k <= 12; k++) { const p = wl(0, k); if (!p || p[1] < 60 || p[1] > 1880) continue; label(p[0] - 16, p[1], `${k * 10}i`, cv * 0.55, COL.ice, 17, 0.06, 300, 'right'); }
  mathL(540, 300, ['0', '<', ...RE_S, '<', '1'], 62, COL.violet.map(c => Math.min(255, c + 60)), win(u, 64.0, 68.8, 0.8, 0.8), 10);
  // first zeros with their coordinates
  const za = win(u, 71.8, 76.4, 0.6, 0.7) * out;
  if (za > 0) for (let k = 0; k < 3; k++) { const p = wl(0.5, ZER[k] * TY); if (!p) continue; const s = ZER[k].toFixed(6).slice(0, 9);
    mathL(p[0] + 44, p[1], [HALF, '+', s, { i: 'i' }], 40, COL.hgold, za * ss(72.0 + 0.4 * k, 72.5 + 0.4 * k, u), 0, 'left'); }
  if (u > 76.4) { const p = wl(0.5, planeCam(u)[1]); }
  mathL(540, 1640, [...RE_S, '=', HALF], 86, COL.hgold, win(u, 72.0, 76.3, 0.6, 0.6), 14);
  // the zeros become oscillations
  const wa = win(u, 80.3, 82.7, 1.0, 0.7); if (wa > 0) { const Lw = new Lines();
    for (let k = 0; k < 60; k++) { const p = wl(0.5, ZER[k] * TY); if (!p || p[1] < -20 || p[1] > 1940) continue; const g = ZER[k];
      const len = 620 * ss(80.4 + k * 0.03, 81.8 + k * 0.03, u), amp = 16 * wa; let px = p[0], py = p[1];
      for (let x = 4; x <= len; x += 4) { const X = p[0] + x, Y = p[1] + amp * Math.sin(x * g * 0.012 - u * 5) * Math.min(1, x / 60); Lw.addL(px, py, X, Y, wa * 0.7 * (1 - x / 700), k % 2 ? 'turq' : 'gold'); px = X; py = Y; } }
    Lw.flush(GLW); }
}

function sceneMystery(u) { // scene 5 and the closing composition
  if (u < 93.6) return; planeCamSet(u);
  const plane = ss(93.9, 95.0, u), dark = 1 - ss(111.8, 115.4, u), fin = win(u, 122.8, 132.5, 3.2, 2.8);
  const grid = plane * dark * 0.8 + fin * 0.3;
  const lineA = plane * (1 - ss(141.6, 143.8, u)) * (1 + 0.6 * win(u, 117.6, 119.6, 0.4, 1.0)) * (1 - 0.45 * win(u, 137.6, 145, 0.6, 0.1));
  drawPlane(u, { grid, axes: grid, strip: plane * dark + fin * 0.45, line: Math.min(1.6, lineA), zeros: plane * dark + fin * 0.85, zR: 0.05, zTop: 68.5 });
  if (fin > 0) {
    drawTower(u, { cx: 0.5, cz: 0, R: 9, rowH: 0.5, a0: 0.4 + 0.01 * u, alpha: fin * 0.85, rLo: 0, rHi: 260, zMax: -1.0, text: false, fog: 70, ribs: fin * 0.7 });
    drawRelief(u, fin * 0.55, 1, { fog: 60, si: 2, tj: 4 });
  }
  // climbing counter
  const ca = win(u, 99.4, 106.4, 0.6, 0.8); if (ca > 0) { const t = planeCam(u)[1] / TY; label(540, 250, `Im(s) ≈ ${Math.round(t)}`, ca * 0.85, COL.hgold, 26, 0.16, 300);
    label(540, 292, 'THE FIRST 400 ZEROS, AT THEIR TRUE HEIGHTS', ca * 0.6, COL.ice, 16, 0.24, 300); }
  // the hypothesis
  const ha = win(u, 109.8, 116.0, 0.8, 1.0);
  mathL(540, 1250, [{ r: 'Re' }, '(', { i: 'ρ' }, ')', '=', HALF], 104, COL.hgold, ha, 18);
  mathL(540, 1390, [{ sans: 'FOR EVERY NONTRIVIAL ZERO  ' }, { i: 'ρ' }, { sans: '  OF  ' }, ...ZS], 48, COL.pearl, ha * ss(110.3, 111.2, u) * 0.9);
  // one equation
  const oa = win(u, 115.9, 120.0, 0.5, 1.0); mathL(540, 520, seriesItems(1e9, 1), 64, COL.pearl, oa, 8);
}
CAPS.push(
  { t0: 63.4, t1: 66.3, s: 'THE CRITICAL STRIP.', size: 52, y: 1640 },
  { t0: 69.8, t1: 71.8, s: 'THE CRITICAL LINE.', size: 52, y: 1640, col: COL.hgold },
  { t0: 76.4, t1: 80.7, s: 'ALL NONTRIVIAL ZEROS?', size: 54, y: 1640 },
  { t0: 94.3, t1: 99.1, s: 'MORE THAN 160 YEARS OF ATTEMPTS', size: 44, y: 1640 },
  { t0: 99.3, t1: 102.7, s: 'MORE THAN 10¹² ZEROS CHECKED', size: 48, y: 1640 },
  { t0: 102.8, t1: 106.2, s: 'EVERY ONE ON THE LINE.', size: 50, y: 1640, col: COL.hgold },
  { t0: 106.4, t1: 109.7, s: 'BUT CHECKING IS NOT PROOF.', size: 50, y: 1640 },
  { t0: 111.6, t1: 115.6, s: 'DOES EVERY NONTRIVIAL ZERO LIE HERE?', size: 44, y: 1640 },
  { t0: 129.9, t1: 137.4, s: 'THE RIEMANN HYPOTHESIS', size: 62, weight: 300, ls: 0.2, y: 900, fi: 1.6, fo: 1.2 },
  { t0: 132.0, t1: 137.4, s: 'PROPOSED IN 1859.', size: 34, y: 1010, fi: 1.0, fo: 1.2, alpha: 0.85 },
  { t0: 134.6, t1: 137.4, s: 'STILL UNPROVEN.', size: 34, y: 1066, col: COL.hgold, fi: 0.8, fo: 1.2 },
  { t0: 137.9, t1: 143.4, s: 'CAN INFINITY HIDE A PERFECT PATTERN?', size: 46, y: 960, fi: 1.4, fo: 1.6 },
);
