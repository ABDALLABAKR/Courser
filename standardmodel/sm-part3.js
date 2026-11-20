'use strict';
/* =====================================================================
   PART 3 — the force carriers (gauge bosons)
   ===================================================================== */
function lissajous(t, a) { if (a <= 0.003) return; const L = new Lines();
  for (let j = 0; j < 6; j++) { const pts = [], ax = 3 + (j % 3), ay = 2 + (j % 2), R1 = 380 + 50 * j; for (let i = 0; i <= 260; i++) { const u = i / 260 * TAU; pts.push([540 + R1 * Math.sin(ax * u + t * 0.07 * (j + 1)), 960 + R1 * 1.5 * Math.sin(ay * u + j)]); }
    L.polyL(pts, a * 0.07, ['violet', 'magenta', 'cobalt'][j % 3]); }
  L.flush(FINE); }

function sceneInteract(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const k1 = clamp((t - t0) / 1.4), k2 = clamp((t - t0 - 1.4) / 0.9), k3 = clamp((t - t0 - 2.3) / 1.4);
  const V1 = [400, 980], V2 = [680, 900];
  fLine(L, 220, 1500, V1[0], V1[1], 'f', k1, a, 'cyan'); fLine(L, 880, 1500, V2[0], V2[1], 'f', k1, a, 'gold');
  fLine(L, V1[0], V1[1], V2[0], V2[1], 'wave', k2, a, 'violet', t);
  fLine(L, V1[0], V1[1], 230, 420, 'f', k3, a, 'cyan'); fLine(L, V2[0], V2[1], 870, 420, 'f', k3, a, 'gold');
  L.flush(GLW); if (k1 >= 1) { vertex(...V1, a, 'cyan'); vertex(...V2, a, 'gold'); }
  label(540, 1600, 'PARTICLES INTERACT BY EXCHANGING FIELD QUANTA', a * ss(t0 + 2.4, t0 + 3.4, t) * 0.85, [235, 235, 245], 24, 0.12, 300); }

function sceneEMWave(t, a) { if (a <= 0.003) return; const yc = lerp(-0.6, 0.8, clamp((t - G(17.6)) / 6.6)); setCam([0, yc, 0], 5.6, 0.75 + (t - G(17.6)) * 0.12, 0.18); const L = new Lines();
  const k = TAU / 1.6, w = 3.2; const Ept = [], Bpt = [];
  for (let i = 0; i <= 220; i++) { const y = -5 + i / 220 * 10; const env = Math.exp(-Math.pow(y - lerp(-2.5, 3.5, frac((t - G(17.6)) / 5.5)), 2) / 6) * 0.7 + 0.3; const v = Math.cos(k * y - w * t) * 1.05 * env;
    Ept.push([v, y, 0]); Bpt.push([0, y, v]); if (i % 4 === 0) { L.add3([0, y, 0], [v, y, 0], a * 0.32, 'cyan'); L.add3([0, y, 0], [0, y, v], a * 0.32, 'violet'); } }
  L.poly3(Ept, a, 'cyan'); L.poly3(Bpt, a, 'violet'); L.add3([0, -5, 0], [0, 5.2, 0], a * 0.5, 'silver');
  L.flush(GLW);
  if (project(1.3, yc + 0.2, 0)) label(PX / S + 40, PY / S, 'E', a, COL.cyan, 40, 0, 300); if (project(0, yc - 0.6, 1.3)) label(PX / S - 40, PY / S, 'B', a, [190, 150, 255], 40, 0, 300);
  label(540, 250, 'ELECTRIC FIELD ⟂ MAGNETIC FIELD ⟂ DIRECTION OF TRAVEL', a * 0.75, [235, 235, 245], 21, 0.1, 300); }

function sceneSpectrum(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const x = 640, y0 = 1380, y1 = 420;
  // a wave whose wavelength shrinks as frequency rises (radio at the bottom, gamma at the top)
  const pts = []; let ph = 0; for (let y = y0; y >= y1; y -= 2) { const u = (y0 - y) / (y0 - y1); const lam = 140 * Math.pow(0.03, u); ph += 2 / lam * TAU; pts.push([330 + 80 * Math.sin(ph - t * 4), y]); } L.polyL(pts, a * 0.85, 'violet');
  L.flush(GLW);
  TXT.push(() => { const gr = ctx.createLinearGradient(0, y0 * S, 0, y1 * S); const st = [[0, [120, 40, 60]], [0.38, [200, 40, 40]], [0.44, [255, 60, 40]], [0.47, [255, 200, 40]], [0.5, [60, 220, 90]], [0.53, [40, 120, 255]], [0.56, [140, 60, 255]], [0.62, [150, 90, 255]], [1, [220, 230, 255]]];
    for (const [u, c] of st) gr.addColorStop(u, rgba(c, (u > 0.42 && u < 0.58 ? 0.95 : 0.45) * a)); ctx.fillStyle = gr; ctx.fillRect((x - 14) * S, y1 * S, 28 * S, (y0 - y1) * S); });
  const bands = [['RADIO', 0.04, G(25.3)], ['MICROWAVE', 0.2], ['INFRARED', 0.36], ['VISIBLE LIGHT', 0.5, G(23.9)], ['ULTRAVIOLET', 0.64], ['X-RAYS', 0.8], ['GAMMA RAYS', 0.96]];
  for (const [n, u, hi] of bands) { const y = lerp(y0, y1, u); const h = hi && t > hi ? ss(hi, hi + 0.6, t) : 0; label(x + 40, y, n, a * (0.6 + 0.4 * h), h > 0 ? [255, 255, 255] : [210, 200, 245], 24 + 6 * h, 0.16, h > 0 ? 400 : 300, 'left'); }
  glowL(x, lerp(y0, y1, 0.5), 80, a * 0.35 * ss(G(23.9), G(24.5), t), 'white');
  label(540, 1500, 'EVERY COLOUR · EVERY RADIO SIGNAL · ALL SUNLIGHT', a * ss(G(25.4), G(26.4), t), [235, 230, 255], 27, 0.1, 300);
  label(540, 1560, 'THE SAME FIELD, DIFFERENT WAVELENGTHS', a * ss(G(27.0), G(28.0), t) * 0.8, [235, 235, 245], 22, 0.16, 300); }

function sceneGluonStates(t, a, t0) { if (a <= 0.003) return; const pairs = [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [-1, 0], [-1, 1]];
  pairs.forEach(([c1, c2], i) => { const x = 360 + (i % 2) * 360, y = 520 + Math.floor(i / 2) * 210; const g = ss(t0 + i * 0.25, t0 + 0.6 + i * 0.25, t); const L = new Lines();
    if (c1 >= 0) { glowL(x - 34, y, 60, a * g * 0.6, CC[c1]); dotL(x - 34, y, 20, a * g, CC[c1]); const pts = []; for (let k = 0; k <= 40; k++) pts.push([x + 40 + 24 * Math.cos(k / 40 * TAU), y + 24 * Math.sin(k / 40 * TAU)]); L.polyL(pts, a * g, CC[c2]);
      label(x + 3, y + 70, ['C', 'G', 'V'][c1] + ' · ANTI-' + ['C', 'G', 'V'][c2], 0, [0, 0, 0]); }
    else { for (let j = 0; j < 3; j++) { const th = j / 3 * TAU + t * 0.6; glowL(x + Math.cos(th) * 30, y + Math.sin(th) * 30, 34, a * g * 0.55, CC[j]); const pts = []; for (let k = 0; k <= 40; k++) pts.push([x + Math.cos(th) * 30 + 14 * Math.cos(k / 40 * TAU), y + Math.sin(th) * 30 + 14 * Math.sin(k / 40 * TAU)]); L.polyL(pts, a * g * 0.8, CC[j]); } }
    L.flush(FINE); });
  label(540, 1400, '8 GLUON COLOUR STATES', a * ss(t0 + 0.4, t0 + 1.4, t), FAMRGB.b, 40, 0.14, 300);
  label(540, 1460, 'EACH CARRIES A COLOUR AND AN ANTI-COLOUR', a * ss(t0 + 1.0, t0 + 2.0, t) * 0.85, [235, 235, 245], 24, 0.14, 300);
  label(540, 1510, 'COLOURS HERE ARE SYMBOLIC NAMES FOR A QUANTUM CHARGE', a * ss(t0 + 1.4, t0 + 2.4, t) * 0.6, [235, 235, 245], 18, 0.14, 300); }

function sceneFluxTube(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const top = 600; const brk = t0 + 3.4; const d = lerp(130, 680, ease(clamp((t - t0 - 0.8) / 2.6)));
  const tube = (y1, y2, alpha) => { for (let j = 0; j < 7; j++) { const pts = []; const off = (j - 3) * 7; for (let y = y1; y <= y2; y += 6) pts.push([540 + off + 5 * Math.sin(y * 0.08 - t * 7 + j), y]); L.polyL(pts, alpha * (0.6 - Math.abs(j - 3) * 0.12), j % 2 ? 'hgold' : 'magenta'); } };
  const qcol = j => CC[(j + Math.floor(t * 1.2)) % 3];
  if (t < brk) { tube(top, top + d, a); glowL(540, top + d / 2, 40 + d * 0.15, a * 0.15 * (d / 680), 'amber'); }
  else { const k = clamp((t - brk) / 1.2), m = top + d / 2; tube(top, m - 30 - 120 * k, a); tube(m + 30 + 120 * k, top + d, a); glowL(540, m, 120 * (1 - k), a * (1 - k), 'white');
    const y1 = m - 30 - 120 * k, y2 = m + 30 + 120 * k; glowL(540, y1, 50, a * 0.7, 'gold'); dotL(540, y1, 10, a, 'white'); glowL(540, y2, 50, a * 0.7, 'violet'); dotL(540, y2, 10, a, 'white');
    fml(600, y1, [{ s: 'q' }], 50, [255, 255, 255], a * k, 8); fml(600, y2, [{ s: 'q', bar: 1 }], 50, [255, 255, 255], a * k, 8); }
  L.flush(GLW);
  // the bound pair at the top and the quark being pulled away
  [[470, top - 40], [610, top - 40]].forEach(([x, y], j) => { glowL(x, y, 60, a * 0.6, qcol(j)); dotL(x, y, 12, a, 'white'); }); L.addL(470, top - 40, 610, top - 40, a, 'hgold');
  glowL(540, top + d, 60, a * 0.6, qcol(2)); dotL(540, top + d, 12, a, 'white');
  label(540, 360, t < brk ? 'PULL A QUARK AWAY: THE FIELD ENERGY GROWS' : 'THE TUBE SNAPS INTO A NEW QUARK–ANTIQUARK PAIR', a * ss(t0 + 0.6, t0 + 1.4, t), [235, 235, 245], 25, 0.1, 300);
  label(540, 1440, 'CONFINEMENT', a * ss(t0 + 0.4, t0 + 1.4, t), FAMRGB.b, 46, 0.24, 300); label(540, 1505, 'QUARKS ARE NEVER FOUND ALONE', a * ss(t0 + 1.0, t0 + 2.0, t) * 0.85, [235, 235, 245], 26, 0.14, 300); }

function sceneBeta(t, a) { if (a <= 0.003) return; const L = new Lines(); const k1 = ease((t - G(62.6)) / 1.8), k2 = ease((t - G(64.4)) / 1.4), k3 = ease((t - G(65.8)) / 1.6), hl = ss(G(68.6), G(69.6), t);
  const V1 = [660, 1060], V2 = [880, 880];
  fLine(L, 400, 1400, 400, 560, 'f', k1, a * 0.7, 'gold'); fLine(L, 530, 1400, 530, 560, 'f', k1, a * 0.7, 'gold');
  fLine(L, 660, 1400, V1[0], V1[1], 'f', clamp(k1 * 1.8), a, 'gold'); fLine(L, V1[0], V1[1], 660, 560, 'f', clamp(k1 * 1.8 - 0.8), a, 'gold');
  fLine(L, V1[0], V1[1], V2[0], V2[1], 'wave', k2, a, 'magenta', t);
  fLine(L, V2[0], V2[1], 990, 560, 'f', k3, a, 'cyan'); fLine(L, 800, 560, V2[0], V2[1], 'f', k3, a * 0.8, 'turq'); // antineutrino: arrow against time
  L.flush(GLW); if (k1 > 0.6) vertex(...V1, a * (0.7 + 0.6 * hl), 'magenta'); if (k2 >= 1) vertex(...V2, a, 'magenta');
  hadron(t, 530, 1470, 70, ['u', 'd', 'd'], a * ss(G(62.4), G(63.2), t), { rot: 0.2 }); hadron(t, 530, 480, 70, ['u', 'u', 'd'], a * ss(G(66.4), G(67.6), t), { rot: 0.2 });
  label(320, 1470, 'NEUTRON', a * ss(G(62.4), G(63.2), t) * 0.9, [255, 225, 170], 22, 0.2, 400); label(320, 480, 'PROTON', a * ss(G(66.4), G(67.6), t) * 0.9, [255, 225, 170], 22, 0.2, 400);
  fml(V1[0] - 40, 1230, [{ s: 'd' }], 54, [255, 255, 255], a * k1, 8); fml(V1[0] - 40, 760, [{ s: 'u' }], 54, [255, 255, 255], a * clamp(k1 * 1.8 - 0.8), 8);
  fml(800, 1010, [{ s: 'W', sup: '−' }], 60, [240, 150, 240], a * k2, 10); fml(1010, 520, [{ s: 'e', sup: '−' }], 56, FAMRGB.l, a * k3, 8); fml(790, 520, [{ s: 'ν', sub: 'e', bar: 1 }], 56, FAMRGB.l, a * k3, 8);
  label(540, 1600, 'A DOWN QUARK BECOMES AN UP QUARK', a * hl * (1 - ss(G(72.0), G(72.6), t)), [255, 225, 170], 28, 0.12, 400);
  fml(540, 1600, ['β', { s: '', sup: '−' }, ' DECAY:   ', { s: 'n' }, '  →  ', { s: 'p' }, '  +  ', { s: 'e', sup: '−' }, '  +  ', { s: 'ν', sub: 'e', bar: 1 }], 52, [240, 230, 255], a * ss(G(72.6), G(73.4), t), 8); }

function sceneNeutral(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const k1 = ease((t - t0) / 1.2), k2 = ease((t - t0 - 1.2) / 1.0), k3 = ease((t - t0 - 2.2) / 1.2); const V1 = [420, 960], V2 = [660, 960];
  fLine(L, 300, 1420, V1[0], V1[1], 'f', k1, a, 'emerald'); fLine(L, 780, 1420, V2[0], V2[1], 'f', k1, a, 'cyan');
  fLine(L, V1[0], V1[1], V2[0], V2[1], 'wave', k2, a, 'uv', t);
  fLine(L, V1[0], V1[1], 300, 500, 'f', k3, a, 'emerald'); fLine(L, V2[0], V2[1], 780, 500, 'f', k3, a, 'cyan');
  L.flush(GLW); if (k1 >= 1) { vertex(...V1, a, 'silver'); vertex(...V2, a, 'silver'); }
  fml(250, 1460, [{ s: 'ν', sub: 'μ' }], 56, [140, 240, 190], a * k1, 8); fml(830, 1460, [{ s: 'e', sup: '−' }], 56, FAMRGB.l, a * k1, 8); fml(250, 460, [{ s: 'ν', sub: 'μ' }], 56, [140, 240, 190], a * k3, 8); fml(830, 460, [{ s: 'e', sup: '−' }], 56, FAMRGB.l, a * k3, 8);
  fml(540, 900, [{ s: 'Z', sup: '0' }], 62, [220, 220, 255], a * k2, 10);
  label(540, 1580, 'NO CHARGE EXCHANGED · THE PARTICLES KEEP THEIR IDENTITY', a * ss(t0 + 2.6, t0 + 3.4, t) * 0.85, [235, 235, 245], 21, 0.1, 300); }

/* ---------- act III timeline ---------- */
CAPS.push(
  { s: 'THE FORCE CARRIERS', t0: G(0.0), t1: G(5.0), y: 330, size: 54, weight: 200, ls: 0.24, col: FAMRGB.b },
  { s: 'PHOTON', t0: G(18.06), t1: G(23.6), y: 1440, size: 56, weight: 300, col: FAMRGB.b },
  { s: 'ELECTROMAGNETIC FORCE', t0: G(18.8), t1: G(23.6), y: 1510, size: 36 },
  { s: 'GLUON  ·  STRONG FORCE', t0: G(32.2), t1: G(35.4), y: 1600, size: 34, col: FAMRGB.b },
  { s: 'BOUND BY THE STRONG INTERACTION', t0: G(47.6), t1: G(52.0), y: 1500, size: 32, col: FAMRGB.b },
  { s: 'THE WEAK INTERACTION', t0: G(52.0), t1: G(55.4), y: 940, size: 56, weight: 200, ls: 0.2, col: [245, 170, 240] },
  { s: 'W⁺ AND W⁻ BOSONS', t0: G(62.4), t1: G(68.4), y: 250, size: 46, col: [245, 170, 240] },
  { s: 'WEAK FORCE', t0: G(63.0), t1: G(68.4), y: 315, size: 32 },
  { s: 'Z BOSON  ·  WEAK FORCE', t0: G(84.4), t1: G(90.1), y: 300, size: 42, col: [220, 220, 255] },
  { s: 'FOUR GAUGE-BOSON CATEGORIES.', t0: G(90.5), t1: G(99.9), y: 1440, size: 44 },
  { s: 'THREE FUNDAMENTAL INTERACTIONS.', t0: G(93.4), t1: G(99.9), y: 1510, size: 40, col: FAMRGB.b },
);
function part3(t) {
  const ba = win(t, B(124.6), Hg(1.0), 2.4, 3.0); ribbons(t, FAMC.b, ba * 0.75, 30, 0.9); motes(t, ['violet', 'magenta', 'cobalt'], ba * 0.6, 110, 11); lissajous(t, ba);
  sceneInteract(t, win(t, G(4.8), G(7.4), 0.6, 0.7), G(5.0));
  const bg = (o) => bosonGrid(t, o);
  bg({ a: win(t, G(6.9), G(12.3), 0.8, 0.7), cam: t => gridCam(t, 'b', G(6.9), G(12.3), -0.3, 0.3, 5.2), content: () => 0, glow: () => 0.4 });
  card(t, 'ga', { a: win(t, G(11.9), G(18.0), 0.8, 0.7), props: ss(G(14.0), G(16.6), t) });
  sceneEMWave(t, win(t, G(17.6), G(24.2), 0.7, 0.7));
  sceneSpectrum(t, win(t, G(23.8), G(30.2), 0.6, 0.7), G(23.9));
  card(t, 'gl', { a: win(t, G(29.9), G(35.8), 0.8, 0.7), props: ss(G(32.0), G(34.2), t) });
  sceneGluonStates(t, win(t, G(35.5), G(40.8), 0.6, 0.7), G(35.7));
  const ft = win(t, G(40.4), G(47.6), 0.6, 0.7); sceneFluxTube(t, ft, G(40.6)); label(540, 250, 'GLUON · STRONG FORCE', ft * 0.9, FAMRGB.b, 30, 0.2, 300);
  sceneNucleus(t, win(t, G(47.2), G(52.4), 0.7, 0.8));
  const wk = win(t, G(51.8), G(55.8), 0.8, 0.8); if (wk > 0.003) { setCam([0, 0.3, 0], 6.5, 0, 0.3); const L = new Lines(); fieldSheet(L, t, -1.2, 'magenta', wk * 0.8, [{ x: 0, z: 0, h: 0.6, w: 0.9, k: 7, a: 1 }], { n: 28 }); fieldSheet(L, t, 2.4, 'uv', wk * 0.4, [], { n: 22 }); L.flush(FINE); }
  card(t, 'Wp', { a: win(t, G(55.6), G(62.6), 0.8, 0.7), props: ss(G(57.6), G(59.0), t), sc: 0.58, cy: 470 });
  card(t, 'Wm', { a: win(t, G(57.9), G(62.6), 0.8, 0.7), props: ss(G(59.6), G(61.0), t), sc: 0.58, cy: 1180 });
  sceneBeta(t, win(t, G(62.3), G(76.9), 0.6, 0.8));
  card(t, 'Z', { a: win(t, G(76.6), G(84.6), 0.8, 0.7), props: ss(G(79.2), G(82.6), t) });
  sceneNeutral(t, win(t, G(84.2), G(90.4), 0.6, 0.7), G(84.4));
  bg({ a: win(t, G(90.0), G(101.0), 0.9, 1.6), cam: t => gridCam(t, 'b', G(90.0), G(101), 0.2, -0.1, 5.4), content: () => 1, glow: () => 0.5 + 0.5 * Math.pow(Math.sin((t - G(90)) * 1.6), 8), fa: (k, i) => 1 - ss(G(99.4) + i * 0.2, G(100.8) + i * 0.2, t) });
}
function bosonGrid(t, o) { const a = o.a; if (a <= 0.003) return; o.cam(t); const set = ['ga', 'gl', 'W', 'Z'];
  drawChart(t, k => { const i = set.indexOf(k); if (i < 0) return null; return { a: a * (o.fa ? o.fa(k, i) : 1), content: o.content(k, i), glow: o.glow(k, i), detail: 0 }; });
}
