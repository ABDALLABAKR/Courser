'use strict';
/* =====================================================================
   PART 4 — the Higgs field, the Higgs boson, the complete Standard Model
   ===================================================================== */
let LAT, HIST;
function initPart4() { const R = rng(2012);
  LAT = []; for (let i = -4; i <= 4; i++) for (let j = -6; j <= 6; j++) for (let k = -5; k <= 2; k++) LAT.push({ p: [i * 0.85, j * 0.85, k * 0.85], ph: R() * TAU, c: (i + j + k + 30) % 3 });
  // diphoton invariant-mass spectrum: smooth falling background + a narrow excess at 125 GeV (illustrative event counts)
  HIST = []; for (let i = 0; i < 30; i++) { const m = 101 + i * 2; const bkg = 900 * Math.exp(-(m - 100) / 28), sig = 150 * Math.exp(-Math.pow(m - 125, 2) / (2 * 1.8 * 1.8)); HIST.push({ m, bkg, sig, n: gauss(R) }); }
}
const HKEY = ['pearl', 'hemer', 'hgold'];
function latIndex(i, j, k) { return ((i + 4) * 13 + (j + 6)) * 8 + (k + 5); }
function sceneLattice(t, a, exc = 0, camK = 0) { if (a <= 0.003) return; setCam([0, 0.2, -1.2], lerp(5.2, 4.4, camK), 0.25 * Math.sin(t * 0.08) + 0.15, 0.12 + 0.05 * Math.sin(t * 0.11)); const L = new Lines();
  const pos = LAT.map(n => { const [x, y, z] = n.p; const r = Math.hypot(x, y, z + 1.2); const bump = exc * Math.exp(-r * r / 1.1) * Math.cos(r * 5 - t * 6) * 0.35; const f = 1 + bump / Math.max(0.2, r);
    return [x * f + 0.03 * Math.sin(t * 0.9 + n.ph), y * f + 0.03 * Math.cos(t * 0.8 + n.ph), z + 1.2 * 0 + (z + 1.2) * (f - 1)]; });
  for (let i = -4; i <= 4; i++) for (let j = -6; j <= 6; j++) for (let k = -5; k <= 2; k++) { const p = pos[latIndex(i, j, k)]; const key = HKEY[(i + j + k + 30 + Math.floor(t * 0.3)) % 3];
    if (i < 4) L.add3(p, pos[latIndex(i + 1, j, k)], a * 0.18, key); if (j < 6) L.add3(p, pos[latIndex(i, j + 1, k)], a * 0.18, key); if (k < 2) L.add3(p, pos[latIndex(i, j, k + 1)], a * 0.12, key); }
  L.flush(FINE);
  LAT.forEach((n, i) => { const p = pos[i]; if (!project(...p)) return; const r = Math.hypot(n.p[0], n.p[1], n.p[2] + 1.2); const e = exc * Math.exp(-r * r / 1.4); const sh = 0.5 + 0.5 * Math.sin(t * 1.3 + n.ph);
    dotPx(PX, PY, FOCAL / PD * (0.03 + 0.04 * e), a * (0.45 + 0.4 * sh + e), HKEY[(n.c + Math.floor(t * 0.5)) % 3]); if (e > 0.05) glowPx(PX, PY, FOCAL / PD * 0.22 * e, a * e * 0.35, 'hemer'); });
  if (exc > 0.01 && project(0, 0, -1.2)) { glowPx(PX, PY, FOCAL / PD * 1.2 * exc, a * exc * 0.4, 'hgold'); glowPx(PX, PY, FOCAL / PD * 0.3 * exc, a * exc * 0.5, 'white'); } }

function sceneHat(t, a, t0) { if (a <= 0.003) return; setCam([0, 0.2, 0], 4.6, 0.3 + (t - t0) * 0.1, 0.55, 80); const L = new Lines(); const V = r => 0.55 * Math.pow(r * r - 1, 2) - 0.2;
  for (let j = 0; j < 40; j++) { const th = j / 40 * TAU; const pts = []; for (let i = 0; i <= 26; i++) { const r = i / 26 * 1.6; pts.push([r * Math.cos(th), V(r), r * Math.sin(th)]); } L.poly3(pts, a * 0.35, HKEY[j % 3]); }
  for (let i = 1; i <= 12; i++) { const r = i / 12 * 1.6; const pts = []; for (let j = 0; j <= 60; j++) { const th = j / 60 * TAU; pts.push([r * Math.cos(th), V(r), r * Math.sin(th)]); } L.poly3(pts, a * (Math.abs(r - 1) < 0.08 ? 0.8 : 0.25), Math.abs(r - 1) < 0.08 ? 'hgold' : 'hemer'); }
  L.add3([0, -0.25, 0], [0, 1.3, 0], a * 0.4, 'pearl');
  L.flush(GLW); const thb = 0.6 + 0.15 * Math.sin(t * 0.5); if (project(Math.cos(thb), V(1) + 0.06, Math.sin(thb))) { glowPx(PX, PY, FOCAL / PD * 0.4, a, 'hgold'); dotPx(PX, PY, FOCAL / PD * 0.08, a, 'white'); const x = PX / S, y = PY / S;
    fml(x + 130, y - 30, ['⟨', { s: 'φ' }, '⟩  =  ', { s: 'v' }, '  ≈  246 GeV'], 46, [255, 235, 190], a * ss(t0 + 1.2, t0 + 2.2, t), 10); }
  if (project(0, 0.55 * 1 - 0.2 + 0.1, 0)) fml(PX / S, PY / S - 90, [{ s: 'V' }, '(', { s: 'φ' }, ')'], 54, [235, 240, 255], a * ss(t0 + 0.4, t0 + 1.4, t), 10);
  label(540, 1380, 'THE FIELD SETTLES AWAY FROM ZERO', a * ss(t0 + 1.6, t0 + 2.6, t), [255, 235, 190], 32, 0.12, 400);
  label(540, 1436, 'A NON-ZERO VALUE EVEN IN EMPTY SPACE', a * ss(t0 + 2.2, t0 + 3.2, t) * 0.85, [235, 235, 245], 24, 0.14, 300); }

function sceneLanes(t, a) { if (a <= 0.003) return; const L = new Lines(); const lanes = [['e', 180, 0.85, 0.08, Hg(16.3)], ['t', 360, 0.22, 1.0, Hg(16.9)], ['W', 540, 0.32, 0.6, Hg(22.6)], ['Z', 720, 0.3, 0.65, Hg(23.4)], ['ga', 900, 1.0, 0, Hg(26.8)]];
  const nodes = []; for (let x = 60; x <= 1020; x += 60) for (let y = 400; y <= 1560; y += 60) nodes.push([x + 6 * Math.sin(t + y * 0.01), y + 6 * Math.cos(t * 0.9 + x * 0.01)]);
  for (const [x, y] of nodes) { dotL(x, y, 4, a * 0.7, HKEY[Math.floor(x / 60 + y / 60) % 3]); }
  for (const [k, x, sp, cpl, t0] of lanes) { const la = a * ss(t0, t0 + 0.8, t); if (la <= 0.003) continue; const y = 1560 - frac((t - t0) * sp * 0.22) * 1160; const sym = k === 'e' ? P.e.sym : k === 'ga' ? P.ga.sym : k === 'W' ? { s: 'W', sup: '±' } : k === 'Z' ? P.Z.sym : P.t.sym;
    L.addL(x, 1560, x, 400, la * 0.12, 'pearl');
    for (const [nx, ny] of nodes) { const d = Math.hypot(nx - x, ny - y); if (d < 50 + 160 * cpl) L.addL(x, y, nx, ny, la * Math.min(1, cpl * 1.2 + 0.25) * (1 - d / (50 + 160 * cpl)), 'hgold'); }
    glowL(x, y, 30 + 70 * cpl, la * (0.3 + 0.5 * cpl), k === 'ga' ? 'violet' : k === 't' ? 'gold' : k === 'e' ? 'cyan' : 'magenta'); dotL(x, y, 10, la, 'white');
    fml(x, 300, [sym], 64, [255, 255, 255], la, 10); label(x, 362, k === 'ga' ? 'MASSLESS' : P[k === 'W' ? 'W' : k].m.replace('≈ ', '').replace('/c²', ''), la * 0.85, [255, 235, 190], 20, 0.06, 300); }
  L.flush(FINE);
  label(540, 1630, 'STRONGER COUPLING TO THE HIGGS FIELD  →  LARGER MASS', a * 0.8 * ss(Hg(17.4), Hg(18.4), t), [255, 235, 190], 22, 0.1, 300); }

function sceneHist(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const x0 = 160, x1 = 960, y0 = 1260, y1 = 560; const f = clamp((t - t0) / 5.2); const mx = m => lerp(x0, x1, (m - 100) / 62), my = n => lerp(y0, y1, n / 1050);
  L.addL(x0, y0, x1, y0, a * 0.6, 'pearl'); L.addL(x0, y0, x0, y1, a * 0.6, 'pearl'); for (let m = 110; m <= 160; m += 10) { L.addL(mx(m), y0, mx(m), y0 + 12, a * 0.6, 'pearl'); label(mx(m), y0 + 36, String(m), a * 0.7, [235, 235, 245], 20, 0.05, 300); }
  const bpts = []; for (let m = 100; m <= 161; m += 1) bpts.push([mx(m), my(900 * Math.exp(-(m - 100) / 28) * f)]); for (let i = 0; i + 1 < bpts.length; i += 2) L.polyL([bpts[i], bpts[i + 1]], a * 0.9, 'hemer');
  for (const h of HIST) { const n = (h.bkg + h.sig) * f + h.n * Math.sqrt((h.bkg + h.sig) * f) * 0.9; const err = Math.sqrt(Math.max(1, n)); const x = mx(h.m); L.addL(x, my(n - err), x, my(n + err), a * 0.9, 'pearl'); dotL(x, my(n), 10, a, Math.abs(h.m - 125) < 3 ? 'hgold' : 'white'); }
  L.flush(FINE); const hb = ss(t0 + 3.0, t0 + 4.2, t); glowL(mx(125), my(560), 90, a * hb * 0.4, 'hgold');
  label(mx(125), my(760) - 20, '125 GeV', a * hb, [255, 235, 190], 30, 0.08, 400);
  fml(540, 500, ['EVENTS WITH TWO PHOTONS:   ', { s: 'H' }, '  →  ', { s: 'γ' }, { s: 'γ' }], 44, [235, 240, 255], a * ss(t0, t0 + 1, t), 8);
  label(540, y0 + 90, 'PHOTON-PAIR MASS (GeV)', a * 0.7, [235, 235, 245], 20, 0.16, 300);
  label(540, 1470, 'DISCOVERED AT CERN · 2012', a * ss(t0 + 0.6, t0 + 1.6, t), [255, 235, 190], 36, 0.14, 400);
  label(540, 1530, 'PREDICTED IN 1964', a * ss(Hg(40.6), Hg(41.6), t) * 0.85, [235, 235, 245], 26, 0.16, 300);
  label(540, 1580, 'ILLUSTRATIVE DATA', a * 0.4, [235, 235, 245], 16, 0.2, 300); }

function sceneProtonMass(t, a, t0) { if (a <= 0.003) return; glowL(540, 760, 420, a * 0.25 * (0.8 + 0.2 * Math.sin(t * 3)), 'violet'); glowL(540, 760, 300, a * 0.25, 'amber'); hadron(t, 540, 760, 200, ['u', 'u', 'd'], a, { rot: 0.25 });
  const x0 = 140, x1 = 940, y = 1240, k = ss(t0 + 2.4, t0 + 4.0, t); label(540, 1160, 'PROTON MASS ≈ 938 MeV/c²', a * ss(t0 + 1.8, t0 + 2.6, t), [255, 255, 255], 32, 0.1, 400);
  TXT.push(() => { ctx.fillStyle = rgba([150, 90, 255], 0.75 * a * k); ctx.fillRect((x0 + 8) * S, (y - 16) * S, (x1 - x0 - 8) * k * S, 32 * S); ctx.fillStyle = rgba([255, 210, 120], a * k); ctx.fillRect(x0 * S, (y - 16) * S, 8 * S, 32 * S); });
  label(540, 1320, 'QUARK MASSES (FROM THE HIGGS FIELD) ≈ 1 %', a * k, [255, 215, 140], 26, 0.1, 400);
  label(540, 1372, 'ENERGY OF THE STRONG INTERACTION ≈ 99 %', a * k, [200, 170, 255], 26, 0.1, 400); }

/* ---------- the grand finale: the complete chart ---------- */
function finaleCam(t) { const full = 9.6, oy = -70; const down = clamp((t - Hg(66.0)) / 5.4), back = ease((t - Hg(71.4)) / 3.6), far = ease((t - Hg(90.6)) / 6.5);
  if (t < Hg(66.0)) { setCam([0, lerp(1.8, 0, ease((t - Hg(52.6)) / 6.0)), 0], lerp(13, full, ease((t - Hg(52.6)) / 6.0)), 0.06 * Math.sin(t * 0.2), 0.04, oy); return 0; }
  if (t < Hg(71.4)) { const y = lerp(CHART.u[1] - 0.2, CHART.H[1] + 0.2, sm5(down)); const ein = ease((t - Hg(66.0)) / 1.2); setCam([0, lerp(0, y, ein), 0], lerp(full, 4.5, ein), 0.06 * Math.sin(t * 0.2), 0.04, lerp(oy, 0, ein)); return ein; }
  setCam([0, lerp(CHART.H[1] + 0.2, 0, back), 0], lerp(4.5, full, back) + far * 9, 0.06 * Math.sin(t * 0.2), 0.04, lerp(0, oy, back)); return 1 - back; }
function sceneFinale(t, a) { if (a <= 0.003) return; const close = finaleCam(t); glowL(540, 80, 700, a * 0.35 * ss(Hg(54.3), Hg(57.5), t) * (1 - ss(Hg(90.6), Hg(96), t)), 'hgold');
  const sec = { q: Hg(59.12), l: Hg(60.38), b: Hg(61.73), h: Hg(64.13) }; const order = { q: ['u', 'd', 'c', 's', 't', 'b'], l: ['e', 've', 'mu', 'vm', 'ta', 'vt'], b: ['ga', 'gl', 'W', 'Z'], h: ['H'] };
  const dim = 1 - 0.65 * win(t, Hg(71.8), Hg(90.6), 1.0, 1.0); const dis = k => 1 - ss(Hg(97.6) + KEYS.indexOf(k) * 0.12, Hg(99.6) + KEYS.indexOf(k) * 0.12, t);
  drawChart(t, k => { const fam = P[k].fam; const i = order[fam].indexOf(k); const t0 = sec[fam] + i * 0.14; const g = ss(t0, t0 + 0.9, t); const nu = k[0] === 'v' && k !== 'vt' || k === 'vt' ? 1 : 0;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2 - CHART[k][1] * 0.8); const nuQ = nu * win(t, Hg(85.1), Hg(90.4), 0.6, 0.8);
    return { a: a * g * dim * dis(k) + a * g * nuQ * 0.4, content: g, glow: 0.4 + 0.4 * pulse + nuQ, detail: close, yaw: (1 - ease(clamp((t - t0) / 1.4))) * 1.2 }; });
  // section names (left) and counts (right)
  const secA = a * (1 - close) * (1 - win(t, Hg(71.8), Hg(90.6), 1, 1)) * (1 - ss(Hg(90.6), Hg(93), t));
  [['q', 'QUARKS', '6'], ['l', 'LEPTONS', '6'], ['b', 'GAUGE BOSONS', '4'], ['h', 'SCALAR BOSON', '1']].forEach(([f, n, c]) => { const sa = secA * ss(sec[f], sec[f] + 0.8, t); if (sa <= 0.003 || !project(-2.25, SECT[f], 0)) return; const y = PY / S;
    label(PX / S - 18, y, n, sa, FAMRGB[f], 19, 0.18, 400, 'right'); if (project(2.25, SECT[f], 0)) fml(PX / S + 50, y, [{ s: c }], 74, FAMRGB[f], sa, 14); });
}
function questionFrames(t, a) { if (a <= 0.003) return; const L = new Lines(); const items = [['GRAVITY', 'NOT PART OF THE STANDARD MODEL', Hg(80.31), 760], ['DARK MATTER', 'NO KNOWN PARTICLE EXPLAINS IT', Hg(82.47), 960], ['NEUTRINO MASSES', 'THEIR ORIGIN IS STILL UNKNOWN', Hg(85.12), 1160]];
  for (const [n, sub, t0, y] of items) { const g = a * ss(t0, t0 + 0.8, t); if (g <= 0.003) continue; const w = 640, h = 150; const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([540 - w / 2 + w * u, y - h / 2]); } for (let i = 0; i + 1 < pts.length; i += 2) { L.polyL([pts[i], pts[i + 1]], g * 0.7, 'pearl'); L.polyL([[pts[i][0], y + h / 2], [pts[i + 1][0], y + h / 2]], g * 0.7, 'pearl'); }
    L.addL(540 - w / 2, y - h / 2, 540 - w / 2, y + h / 2, g * 0.5, 'pearl'); L.addL(540 + w / 2, y - h / 2, 540 + w / 2, y + h / 2, g * 0.5, 'pearl');
    label(540, y - 18, n + '  ?', g, [255, 255, 255], 42, 0.18, 300); label(540, y + 36, sub, g * 0.8, [255, 235, 190], 21, 0.14, 300); }
  L.flush(FINE); }
function sceneEndFields(t, a) { if (a <= 0.003) return; setCam([0, 0.2, (t - Hg(97)) * 0.25], 6.5, 0, lerp(0.3, -0.1, ss(Hg(100), Hg(108), t))); const L = new Lines(); const fwd = (t - Hg(97)) * 0.25;
  const pk = (x, z, h, t0) => ({ x, z: fwd + z, h, w: 0.55, k: 9, a: ss(t0, t0 + 1.4, t) * (0.6 + 0.4 * Math.sin(t * 0.8 + x)) });
  SHEETS.forEach(([y, k], i) => fieldSheet(L, t, y, k, a * ss(Hg(98.5) + i * 0.5, Hg(100.5) + i * 0.5, t) * 0.75, [pk(-1.2 + i * 0.6, 0.6 - i * 0.3, (i % 2 ? -1 : 1) * 0.8, Hg(101) + i * 0.7), pk(1.4 - i * 0.5, -0.8 + i * 0.4, (i % 2 ? 1 : -1) * 0.6, Hg(103) + i * 0.6)], { n: 26, ext: 7, z0: fwd }));
  L.flush(FINE); }

/* ---------- act IV timeline ---------- */
CAPS.push(
  { s: 'THE HIGGS FIELD', t0: Hg(0.0), t1: Hg(7.6), y: 330, size: 54, weight: 200, ls: 0.26, col: FAMRGB.h },
  { s: 'THE HIGGS BOSON', t0: Hg(33.9), t1: Hg(37.2), y: 1360, size: 54, weight: 300, col: [255, 235, 190] },
  { s: 'CHARGE 0  ·  SPIN 0  ·  ≈ 125 GeV/c²', t0: Hg(34.6), t1: Hg(37.2), y: 1430, size: 28, col: [235, 240, 245] },
  { s: 'NOT ALL MASS COMES FROM THE HIGGS FIELD', t0: Hg(44.0), t1: Hg(52.4), y: 300, size: 32, col: [255, 235, 190] },
  { s: '12 MATTER PARTICLES.', t0: Hg(72.2), t1: Hg(76.4), y: 800, size: 50 },
  { s: '4 GAUGE-BOSON CATEGORIES.', t0: Hg(72.9), t1: Hg(76.4), y: 880, size: 50, col: FAMRGB.b },
  { s: '1 HIGGS BOSON.', t0: Hg(73.6), t1: Hg(76.4), y: 960, size: 50, col: [255, 235, 190] },
  { s: '17 FUNDAMENTAL PARTICLE TYPES.', t0: Hg(74.6), t1: Hg(76.4), y: 1080, size: 54, weight: 400 },
  { s: 'EVEN THIS MAP IS INCOMPLETE', t0: Hg(76.6), t1: Hg(90.4), y: 420, size: 40, col: [255, 235, 190] },
  { s: 'A WORLD OF INTERACTING QUANTUM FIELDS', t0: Hg(104.8), t1: Hg(108.6), y: 1500, size: 34, col: [235, 240, 255] },
  { s: 'THE STANDARD MODEL', t0: Hg(108.91), t1: Hg(116.6), y: 900, size: 86, weight: 200, ls: 0.18, fi: 1.4 },
  { s: 'OUR DEEPEST MAP OF THE SUBATOMIC WORLD.', t0: Hg(110.46), t1: Hg(116.6), y: 990, size: 28, col: [255, 214, 150], alpha: 0.9 },
  { s: 'BUT IS THE MAP COMPLETE?', t0: Hg(117.2), t1: DURATION - 0.9, y: 960, size: 46, weight: 300, ls: 0.2, fi: 1.4, fo: 1.4 },
);
function part4(t) {
  const ha = win(t, G(99.4), Hg(53.0), 2.4, 2.0); ribbons(t, FAMC.h, ha * 0.55, 26, 0.6); motes(t, ['pearl', 'hemer', 'hgold'], Math.max(ha, win(t, Hg(52), Hg(110), 2, 4)) * 0.6, 110, 13);
  const exc = ss(Hg(29.1), Hg(31.6), t) * (1 - ss(Hg(36.6), Hg(37.4), t));
  sceneLattice(t, win(t, G(99.6), Hg(37.4), 2.2, 0.8) * (1 - 0.75 * win(t, Hg(8.0), Hg(29.0), 0.8, 0.9)), exc, ss(Hg(29), Hg(34), t));
  sceneHat(t, win(t, Hg(8.0), Hg(16.4), 0.8, 0.8), Hg(8.2));
  sceneLanes(t, win(t, Hg(16.1), Hg(29.2), 0.8, 0.9));
  if (exc > 0.01 && project(0, 0, -1.2)) fml(PX / S, PY / S - 230, [{ s: 'H' }], 150, [255, 245, 220], exc * ss(Hg(33.8), Hg(34.6), t), 30);
  sceneHist(t, win(t, Hg(36.8), Hg(44.2), 0.7, 0.7), Hg(37.0));
  sceneProtonMass(t, win(t, Hg(43.8), Hg(52.8), 0.8, 0.8), Hg(44.0));
  ribbons(t, ['hgold', 'gold', 'pearl', 'cyan', 'violet'], win(t, Hg(52.8), Hg(63.0), 1.5, 3.0) * 0.9, 40, 2.2);
  sceneFinale(t, win(t, Hg(52.6), Hg(101.0), 1.5, 0.5));
  questionFrames(t, win(t, Hg(80.0), Hg(90.6), 0.6, 1.2));
  sceneEndFields(t, win(t, Hg(98.0), Hg(117.5), 1.6, 3.5));
}
