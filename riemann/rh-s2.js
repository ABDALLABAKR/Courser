'use strict';
/* =====================================================================
   SCENE 2 — RIEMANN'S DISCOVERY   (narration 33.4 – 58)
   1859 · the series and its convergence · the Euler product (primes!) ·
   domain colouring and analytic continuation · the |ζ| landscape
   ===================================================================== */
function sceneRiemannTitle(u) {
  const a = win(u, 33.6, 39.7, 1.0, 0.7); if (a <= 0) return;
  const p = sm5((u - 33.6) / 3);
  glowL(540, 720, 420, 0.1 * a, 'gold');
  TXT.push(() => textLine(ctx, '1859', 540 * S, (735 + 20 * (1 - p)) * S, 230, 400, 0.04 + 0.04 * (1 - p), MATHF, COL.hgold, a, 4 * (1 - ss(33.6, 34.8, u))));
  const b = win(u, 35.0, 39.7, 1.0, 0.7);
  TXT.push(() => { textLine(ctx, 'Ueber die Anzahl der Primzahlen', 540 * S, 1080 * S, 48, 400, 0.01, MATHF, COL.pearl, b * 0.95, 0, 'center', true);
    textLine(ctx, 'unter einer gegebenen Grösse.', 540 * S, 1136 * S, 48, 400, 0.01, MATHF, COL.pearl, b * 0.95, 0, 'center', true); });
  label(540, 1250, 'ON THE NUMBER OF PRIMES LESS THAN A GIVEN MAGNITUDE', b * 0.75 * ss(35.8, 36.8, u), COL.ice, 17, 0.2, 300);
}

/* ζ(s) = 1 + 1/2ˢ + 1/3ˢ + 1/4ˢ + … , revealed term by term */
function seriesItems(u, a) {
  const r = t0 => a * ss(t0, t0 + 0.45, u);
  const ns = n => ({ frac: ['1'], den: [String(n), { sup: [{ i: 's' }] }], a: r(40.4 + 0.4 * (n - 1)) });
  return [{ i: 'ζ', a: r(39.9) }, { r: '(', a: r(39.9) }, { i: 's', a: r(39.9) }, { r: ')', a: r(39.9) }, { r: '=', a: r(39.9) }, { r: '1', a: r(40.2) },
    { r: '+', a: r(40.6) }, ns(2), { r: '+', a: r(41.0) }, ns(3), { r: '+', a: r(41.4) }, ns(4), { r: '+', a: r(41.8) }, { r: '…', a: r(41.9) }];
}
const RE_S = [{ r: 'Re' }, '(', { i: 's' }, ')'];
function sceneSeries(u) {
  const a = win(u, 39.8, 53.4, 0.3, 1.0); if (a <= 0) return;
  const y = lerp(470, 300, ss(47.8, 49.0, u));
  mathL(540, y, seriesItems(u, 1), 76, COL.pearl, a, 10);
  const c = win(u, 42.4, 52.6, 0.6, 0.8); mathL(540, y + 130, [{ sans: 'CONVERGES ONLY WHEN  ' }, ...RE_S, '>', '1'], 46, COL.turq, c);

  // a bar of length π²/6 built from pieces of width 1/n² (s = 2), then the camera dives into its infinite tail
  const ba = win(u, 40.3, 48.4, 0.4, 0.8); if (ba > 0) {
    const L = 560, X0 = 80, XL = X0 + L * Math.PI * Math.PI / 6, Y = 840, hgt = 64;
    const z = Math.exp(4.6 * ease(clamp((u - 42.2) / 3.4))); const anchor = lerp(XL, 900, ss(42.0, 43.0, u));
    const tx = X => anchor + (X - XL) * z;
    const Nshow = Math.floor(Math.exp(Math.log(2000) * ss(40.4, 42.4, u))) + 1;
    let X = X0; C.globalCompositeOperation = 'lighter';
    for (let n = 1; n <= Nshow; n++) { const w = L / (n * n), xa = tx(X), xb = tx(X + w); X += w; if (xb < -10) continue; if (xa > 1090) break; if ((xb - xa) < 0.25) { break; }
      const col = n % 2 ? COL.gold : COL.turq; const k = ss(40.4 + Math.log(n) * 0.35, 40.7 + Math.log(n) * 0.35, u);
      C.fillStyle = rgba(col, 0.55 * ba * k); C.fillRect((xa + 0.6) * S, (Y - hgt / 2) * S, Math.max(0.6, xb - xa - 1.2) * S, hgt * S);
      if (xb - xa > 36) { const s = n === 1 ? '1' : `1/${n * n}`; label((xa + xb) / 2, Y - hgt / 2 - 26, s, ba * k * 0.9, n % 2 ? COL.hgold : COL.turq, Math.min(22, (xb - xa) * 0.3), 0.06, 300); } }
    const Lx = new Lines(); const xl = tx(XL); Lx.addL(xl, Y - 70, xl, Y + 70, ba * 0.9, 'pearl'); Lx.flush(GLW);
    mathL(Math.min(980, xl), Y + 130, [{ frac: [{ i: 'π' }, { sup: ['2'] }], den: ['6'] }, '=', '1.6449…'], 46, COL.pearl, ba * ss(41.2, 41.9, u), 0, xl > 800 ? 'right' : 'center');
    mathL(540, Y + 250, [{ sans: 'WITH  ' }, { i: 's' }, '=', '2', { sans: '  THE TERMS ADD UP TO A FINITE NUMBER' }], 40, COL.ice, ba * win(u, 41.6, 48.4, 0.6, 0.8) * 0.85);
  }
  // Euler product: one factor for every prime
  const ea = win(u, 44.9, 48.6, 0.4, 0.6); if (ea > 0) {
    const r = t0 => ss(t0, t0 + 0.5, u);
    const fac = (p, t0) => ({ frac: ['1'], den: ['1', '−', GP(String(p)), { sup: ['−', { i: 's' }] }], a: r(t0) });
    mathL(540, 1250, [{ r: '=', a: r(45.0) }, fac(2, 45.2), { r: '·', a: r(45.6) }, fac(3, 45.6), { r: '·', a: r(46.0) }, fac(5, 46.0), { r: '·', a: r(46.4) }, fac(7, 46.4), { r: '⋯', a: r(46.7) }], 60, COL.pearl, ea, 8);
    label(540, 1390, 'EULER PRODUCT — ONE FACTOR FOR EVERY PRIME', ea * r(46.6) * 0.85, COL.gold, 20, 0.26, 300);
  }
}

/* domain colouring, analytic continuation, the landscape of |ζ| */
function sceneZetaPlane(u) {
  if (u < 48.3 || u > 61.5) return;
  planeCamSet(u);
  const dom = win(u, 48.7, 53.2, 0.9, 0.7); const rev = chan([[49.9, 1.0], [52.2, -2.0]], u, sm5);
  drawDomain(dom, rev);
  if (dom > 0) {
    const Lr = new Lines(); const p1 = wl(1, 0), p2 = wl(1, 5); if (p1 && p2) Lr.addL(p1[0], p1[1], p2[0], p2[1], dom * 0.7 * (1 - ss(51.0, 52.4, u)), 'pearl'); Lr.flush(GLW);
    const q = wl(1, 0); if (q) { glowL(q[0], q[1] - 6, 60, 0.5 * dom, 'white'); label(q[0], q[1] + 40, 'POLE  s = 1', dom * ss(49.2, 50, u), COL.pearl, 20, 0.2); }
    const ra = dom * win(u, 48.9, 51.4, 0.6, 0.6); const qq = wl(2.25, 4.6); if (qq) mathL(qq[0], qq[1], [...RE_S, '>', '1'], 44, COL.white, ra, 8);
    label(540, 1560, 'ANALYTIC CONTINUATION', dom * win(u, 50.0, 53.0, 0.6, 0.6), COL.hgold, 30, 0.3);
    label(540, 1605, 'ζ EXTENDED TO THE WHOLE PLANE — EXCEPT s = 1', dom * win(u, 50.4, 53.0, 0.6, 0.6) * 0.8, COL.ice, 18, 0.2, 300);
    const ax = wl(-2, 0), ax2 = wl(3.5, 0); if (ax && ax2) { const La = new Lines(); La.addL(ax[0], ax[1], ax2[0], ax2[1], dom * 0.5, 'pearl'); La.flush(FINE); }
  }
  const hk = ss(52.9, 54.4, u) * (1 - ss(57.7, 59.8, u)); const ra = ss(52.5, 53.6, u) * (1 - ss(58.4, 60.6, u));
  drawRelief(u, ra, hk, { fog: 7 });
  // zeros at the bottom of the pits
  const za = win(u, 54.3, 60.5, 0.8, 0.8); if (za > 0) for (const g of ZER) { if (g > 50) break; const p = wl(0.5, g * TY, 0); if (!p) continue; const r = 0.05 * FOCAL / PD / S; glowL(p[0], p[1], r * 6, 0.5 * za, 'gold'); dotL(p[0], p[1], Math.max(2.5, r), za, 'hgold'); }
  mathL(540, 1640, [...ZS, '=', '0'], 84, COL.hgold, win(u, 55.6, 58.6, 0.6, 0.7), 14);
  label(540, 280, 'HEIGHT = |ζ(s)|   ·   COLOUR = ARG ζ(s)', ra * win(u, 53.4, 57.6, 0.7, 0.6) * 0.8, COL.ice, 19, 0.24, 300);
}
function part2(u) { sceneRiemannTitle(u); sceneSeries(u); sceneZetaPlane(u); }
CAPS.push(
  { t0: 36.7, t1: 39.7, s: 'BERNHARD RIEMANN.', size: 52, y: 1640 },
  { t0: 42.9, t1: 44.8, s: 'THE ZETA FUNCTION.', size: 52, y: 1640 },
  { t0: 44.95, t1: 48.5, s: 'AN EQUATION CONNECTED TO PRIME NUMBERS.', size: 44, y: 1640 },
);
