'use strict';
/* =====================================================================
   PART 2 — the six leptons
   ===================================================================== */
let DETECT, H2CLOUD, SHOWER, NURAIN, OSC;

function initPart2() { const R = rng(1956); // Cowan & Reines detect the (anti)neutrino
  DETECT = []; for (let i = 0; i < 900; i++) { const p = CLOUD[Math.floor(R() * CLOUD.length)]; DETECT.push([p[0], p[1], p[2]]); }
  // H2 bonding orbital: (ψ1s(A) + ψ1s(B))², rejection sampled in the plane of view
  H2CLOUD = []; const ra = 0.7; while (H2CLOUD.length < 1600) { const x = (R() * 2 - 1) * 3, y = (R() * 2 - 1) * 2, z = (R() * 2 - 1) * 2; const a = Math.exp(-Math.hypot(x - ra, y, z)), b = Math.exp(-Math.hypot(x + ra, y, z)); if (R() < (a + b) * (a + b) / 4) H2CLOUD.push([x, y]); }
  // cosmic-ray air shower (logical coords; top of atmosphere → ground)
  SHOWER = []; const branch = (x, y, th, gen, t0, kind) => { const len = kind === 'mu' ? 1720 - y + 40 : 90 + R() * 120; const x2 = x + Math.sin(th) * len, y2 = y + Math.cos(th) * len; const dur = kind === 'mu' ? 1.8 : 0.35;
      SHOWER.push({ x, y, x2, y2, t0, dur, kind }); if (kind === 'mu' || gen > 4 || y2 > 1500) return; const n = gen < 2 ? 3 : 2;
      for (let i = 0; i < n; i++) { const k = R() < 0.42 ? 'mu' : R() < 0.5 ? 'e' : 'had'; branch(x2, y2, th + (R() - 0.5) * (0.5 + gen * 0.12), gen + 1, t0 + dur, k); } };
  branch(560, -40, 0.05, 0, 0, 'had');
  NURAIN = []; for (let i = 0; i < 160; i++) NURAIN.push({ x: 40 + R() * 1000, ph: R(), sp: 0.5 + R() * 0.5, k: R() });
  // three-flavour oscillation (PMNS, normal ordering, δ = 0): P(νe → να) along the path, x = L/E in km/GeV
  const d = Math.PI / 180, t12 = 33.4 * d, t23 = 49.0 * d, t13 = 8.6 * d; const s12 = Math.sin(t12), c12 = Math.cos(t12), s23 = Math.sin(t23), c23 = Math.cos(t23), s13 = Math.sin(t13), c13 = Math.cos(t13);
  const U = [[c12 * c13, s12 * c13, s13], [-s12 * c23 - c12 * s23 * s13, c12 * c23 - s12 * s23 * s13, s23 * c13], [s12 * s23 - c12 * c23 * s13, -c12 * s23 - s12 * c23 * s13, c23 * c13]];
  const m2 = [0, 7.4e-5, 2.51e-3]; OSC = { U, P: [] };
  for (let i = 0; i <= 600; i++) { const x = i / 600 * 34000; const pr = [0, 1, 2].map(b => { let re = 0, im = 0; for (let j = 0; j < 3; j++) { const ph = 2.534 * m2[j] * x; re += U[0][j] * U[b][j] * Math.cos(ph); im -= U[0][j] * U[b][j] * Math.sin(ph); } return re * re + im * im; }); OSC.P.push(pr); }
}
const NUK = ['cyan', 'emerald', 'sapph'], NURGB = [[110, 225, 255], [60, 225, 150], [80, 130, 255]];

/* ---------- the cathedral of curves ---------- */
function cathedral(t, a) { if (a <= 0.003) return; setCam([0, 0.6, 0], 6, 0.05 * Math.sin(t * 0.1), -0.04); const L = new Lines(); const off = (t * 0.35) % 2.4;
  for (let k = 0; k < 9; k++) { const z = 2 - k * 2.4 + off; const fa = a * clamp(1 - k / 9) * clamp((z + 6) / 2); const pts = [];
    for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([-2.7, -5 + 8.2 * u, z]); }
    for (let i = 0; i <= 24; i++) { const th = Math.PI - i / 24 * Math.PI / 2 * 0.98; pts.push([-2.7 + 3.4 * (1 + Math.cos(th)) * 0.79, 3.2 + 3.4 * Math.sin(th) * 0.85, z]); }
    L.poly3(pts, fa * 0.45, k % 2 ? 'turq' : 'cyan'); L.poly3(pts.map(p => [-p[0], p[1], p[2]]), fa * 0.45, k % 2 ? 'turq' : 'cyan');
    for (let j = 0; j < 5; j++) { const yy = -4 + j * 1.6; L.add3([-2.7, yy, z], [-2.7, yy + 0.8 * Math.sin(t + j), z - 2.4], fa * 0.12, 'sapph'); L.add3([2.7, yy, z], [2.7, yy + 0.8 * Math.cos(t + j), z - 2.4], fa * 0.12, 'sapph'); } }
  for (let j = 0; j < 14; j++) { const pts = []; for (let i = 0; i <= 40; i++) { const z = 2 - i * 0.55; pts.push([Math.sin(j * 0.45 + z * 0.4 + t * 0.2) * 2.4, 5.6 + 0.4 * Math.sin(j + z), z]); } L.poly3(pts, a * 0.12, 'emerald'); }
  L.flush(FINE); }

/* ---------- the electron: probability distribution + localized detection events ---------- */
function electronCloud(cx, cy, R, t, a, t0) { const rot = t * 0.2, c = Math.cos(rot), s = Math.sin(rot); const k = R / 2.2;
  for (let i = 0; i < CLOUD.length; i += 2) { const [x, y, z, r] = CLOUD[i]; const xr = x * c - z * s; dotL(cx + xr * k, cy - y * k, 1.6, a * (0.3 + 0.25 * r), r < 0.5 ? 'cyan' : 'sapph'); }
  glowL(cx, cy, R * 0.9, a * 0.18, 'cyan'); dotL(cx, cy, 8, a * 0.9, 'gold');
  const n = Math.floor(clamp((t - t0) / 6) * DETECT.length); // each measurement finds the electron at one place; together they trace |ψ|²
  for (let i = 0; i < n; i++) { const [x, y, z] = DETECT[i]; const age = (t - t0) - i / DETECT.length * 6; const xr = x * c - z * s; const fresh = Math.exp(-age * 3);
    dotL(cx + xr * k, cy - y * k, 3 + 6 * fresh, a * (0.35 + 0.65 * fresh), 'white'); if (fresh > 0.05) glowL(cx + xr * k, cy - y * k, 26 * fresh, a * fresh, 'cyan'); } }
function electronUses(t, a) { if (a <= 0.003) return; const L = new Lines();
  const p1 = win(t, B(19.6), B(26.4), 0.7, 0.8), p2 = win(t, B(20.9), B(26.4), 0.7, 0.8), p3 = win(t, B(22.3), B(26.4), 0.7, 0.8), p4 = win(t, B(23.8), B(26.4), 0.7, 0.8);
  // atoms
  for (let i = 0; i < CLOUD.length; i += 6) { const [x, y, z, r] = CLOUD[i]; const xr = x * Math.cos(t * 0.3) - z * Math.sin(t * 0.3); dotL(300 + xr * 70, 560 - y * 70, 2.2, a * p1, 'cyan'); } glowL(300, 560, 22, a * p1, 'gold');
  label(300, 760, 'ATOMS', a * p1, FAMRGB.l, 30, 0.24, 300);
  // chemical bond (H₂ bonding orbital)
  for (const [x, y] of H2CLOUD) dotL(780 + x * 62, 560 + y * 62, 2.2, a * p2 * 0.9, 'turq'); glowL(780 - 43, 560, 18, a * p2, 'gold'); glowL(780 + 43, 560, 18, a * p2, 'gold');
  label(780, 760, 'CHEMICAL BONDS', a * p2, FAMRGB.l, 30, 0.2, 300);
  // electricity: electrons drifting through a lattice of ions
  for (let i = 0; i < 9; i++) for (let j = 0; j < 4; j++) dotL(150 + i * 40, 1030 + j * 40, 4, a * p3 * 0.5, 'gold');
  for (let i = 0; i < 40; i++) { const x = 140 + frac(hash(i) + t * 0.18) * 340, y = 1020 + hash(i * 3) * 140 + 6 * Math.sin(t * 3 + i); dotL(x, y, 3.2, a * p3, 'cyan'); glowL(x, y, 12, a * p3 * 0.4, 'cyan'); }
  label(300, 1240, 'ELECTRICITY', a * p3, FAMRGB.l, 30, 0.24, 300);
  // complexity of matter: a molecular network
  for (let i = 0; i < 26; i++) { const th = i * 2.4, r = 30 + 6 * i; const x = 780 + Math.cos(th + t * 0.1) * r * 0.9, y = 1080 + Math.sin(th + t * 0.1) * r * 0.7; dotL(x, y, 5, a * p4, i % 3 ? 'cyan' : 'crimson');
    if (i > 0) { const th2 = (i - 1) * 2.4, r2 = 30 + 6 * (i - 1); L.addL(x, y, 780 + Math.cos(th2 + t * 0.1) * r2 * 0.9, 1080 + Math.sin(th2 + t * 0.1) * r2 * 0.7, a * p4 * 0.4, 'turq'); } }
  label(780, 1240, 'COMPLEX MATTER', a * p4, FAMRGB.l, 30, 0.2, 300);
  L.flush(FINE); }

/* ---------- muons from cosmic rays ---------- */
function sceneShower(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const el = t - t0;
  const sky = C.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, 'rgba(0,0,0,0)'); sky.addColorStop(0.75, rgba([20, 80, 120], 0.25 * a)); sky.addColorStop(0.9, rgba([40, 150, 170], 0.35 * a)); sky.addColorStop(1, 'rgba(0,0,0,0)'); C.globalAlpha = 1; C.fillStyle = sky; C.fillRect(0, 0, W, H);
  const gy = x => 1720 + Math.pow((x - 540) / 540, 2) * 40; const gpts = []; for (let x = -20; x <= 1100; x += 20) gpts.push([x, gy(x)]); L.polyL(gpts, a * 0.7, 'turq');
  for (const s of SHOWER) { const g = clamp((el * 1.1 - s.t0) / s.dur); if (g <= 0) continue; const k = s.kind === 'mu' ? 'cyan' : s.kind === 'e' ? 'sapph' : 'ice';
    L.addL(s.x, s.y, lerp(s.x, s.x2, g), lerp(s.y, Math.min(s.y2, gy(s.x2)), g), a * (s.kind === 'mu' ? 0.85 : 0.4), k); if (s.kind === 'mu' && g < 1) { const x = lerp(s.x, s.x2, g), y = lerp(s.y, s.y2, g); glowL(x, y, 18, a * 0.6, 'cyan'); } }
  L.flush(GLW); glowL(560, -40 + Math.min(1, el) * 60, 40, a * 0.6, 'white');
  label(540, 240, 'COSMIC RAY', a * ss(t0 + 0.3, t0 + 1.2, t), [235, 235, 245], 30, 0.24, 300); label(540, 285, 'HIGH-ENERGY PROTON', a * ss(t0 + 0.5, t0 + 1.4, t) * 0.75, [235, 235, 245], 22, 0.2, 300);
  label(820, 900, 'ATMOSPHERE', a * ss(t0 + 1.5, t0 + 2.5, t) * 0.7, FAMRGB.l, 22, 0.3, 300);
  fml(540, 1560, [{ s: 'μ', sup: '±' }, '   REACH THE GROUND'], 54, FAMRGB.l, a * ss(t0 + 3.0, t0 + 4.0, t), 10);
  label(540, 1630, 'LIFETIME ≈ 2.2 μs — STRETCHED BY RELATIVITY', a * ss(t0 + 3.6, t0 + 4.6, t) * 0.75, [235, 235, 245], 22, 0.12, 300); }

function sceneTauDecay(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const vx = 540, vy = 1120; const g1 = clamp((t - t0) / 0.5), g2 = clamp((t - t0 - 0.5) / 1.1);
  fLine(L, vx, 1260, vx, vy, 'f', g1, a, 'cyan'); fLine(L, vx, vy, vx + 280, vy - 520, 'f', g2, a, 'turq'); fLine(L, vx, vy, vx - 40, vy - 600, 'dash', g2, a * 0.45, 'ice'); fLine(L, vx, vy, vx - 300, vy - 470, 'dash', g2, a * 0.45, 'ice');
  L.flush(GLW); if (g1 >= 1) vertex(vx, vy, a, 'cyan');
  fml(vx + 60, 1220, [{ s: 'τ', sup: '−' }], 70, [255, 255, 255], a * g1, 10); fml(vx + 330, vy - 560, [{ s: 'e', sup: '−' }], 64, FAMRGB.l, a * g2, 10); fml(vx - 40, vy - 650, [{ s: 'ν', sub: 'τ' }], 64, FAMRGB.l, a * g2, 10); fml(vx - 340, vy - 520, [{ s: 'ν', sub: 'e', bar: 1 }], 64, FAMRGB.l, a * g2, 10);
  label(540, 1420, 'LIFETIME ≈ 2.9 × 10⁻¹³ s', a * ss(t0 + 1.4, t0 + 2.4, t), [200, 240, 255], 32, 0.14, 300);
  label(540, 1476, 'ABOUT 3,477 TIMES THE ELECTRON’S MASS', a * ss(t0 + 2.0, t0 + 3.0, t) * 0.85, [235, 235, 245], 23, 0.14, 300); }

function sceneSun(t, a, t0) { if (a <= 0.003) return; const L = new Lines();
  glowL(540, 60, 700, a * 0.5, 'amber'); glowL(540, 60, 420, a * 0.8, 'gold'); glowL(540, 60, 240, a, 'hgold');
  for (let i = 0; i < 40; i++) { const th = Math.PI * (0.1 + 0.8 * hash(i)), r = 330 + 20 * Math.sin(t * 2 + i); dotL(540 + Math.cos(th) * r, 60 + Math.sin(th) * r * 0.9, 3, a * 0.5, 'hgold'); }
  fml(540, 470, [{ s: 'p' }, ' + ', { s: 'p' }, '  →  ', { s: 'd' }, ' + ', { s: 'e', sup: '+' }, ' + ', { s: 'ν', sub: 'e' }], 50, [255, 230, 190], a * ss(t0 + 0.4, t0 + 1.4, t), 10);
  label(540, 540, 'NUCLEAR FUSION IN THE SUN', a * ss(t0 + 0.6, t0 + 1.6, t) * 0.85, [255, 225, 170], 24, 0.2, 300);
  // ordinary matter: a block of atoms — neutrinos pass almost untouched
  const mA = a * ss(B(70.4), B(71.6), t); for (let i = 0; i < 14; i++) for (let j = 0; j < 12; j++) { const x = 230 + i * 48 + (j % 2) * 24, y = 900 + j * 44; glowL(x, y, 18, mA * 0.18, 'gold'); dotL(x, y, 4, mA * 0.7, 'hgold'); }
  label(540, 860, 'ORDINARY MATTER', mA * 0.8, [255, 225, 170], 22, 0.3, 300);
  for (const n of NURAIN) { const y = (frac(n.ph + (t - t0) * 0.45 * n.sp) * 2000) - 60; L.addL(n.x, y - 120, n.x, y, a * 0.28 * n.k, 'cyan'); }
  const hitT = B(74.6); if (t > hitT) { const k = clamp((t - hitT) / 1.5); glowL(518, 1076, 60 * (1 - k * 0.5), a * (1 - k), 'white'); for (let i = 0; i < 5; i++) L.addL(518, 1076, 518 + Math.cos(i * 1.3) * 160 * k, 1076 + Math.sin(i * 1.3) * 160 * k, a * (1 - k), 'cyan'); }
  L.flush(FINE);
  label(540, 1500, '≈ 65 BILLION PER cm² EVERY SECOND', a * ss(B(71.0), B(72.2), t), FAMRGB.l, 34, 0.1, 400);
  label(540, 1556, 'ALMOST NONE OF THEM INTERACT', a * ss(B(74.1), B(75.0), t), [235, 235, 245], 26, 0.16, 300); }

function scenePion(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const vx = 540, vy = 1100; const g1 = clamp((t - t0) / 0.9), g2 = clamp((t - t0 - 0.9) / 1.2);
  fLine(L, vx, 1330, vx, vy, 'dash', g1, a * 0.8, 'gold'); fLine(L, vx, vy, vx + 260, vy - 520, 'f', g2, a, 'cyan'); fLine(L, vx, vy, vx - 260, vy - 520, 'dash', g2, a * 0.6, 'emerald');
  L.flush(GLW); hadron(t, vx, 1390, 54, [{ s: 'u' }, { s: 'd', bar: 1 }], a * g1 * (1 - g2 * 0.7), { rot: 0.5 }); if (g1 >= 1) vertex(vx, vy, a, 'cyan');
  fml(vx + 300, vy - 570, [{ s: 'μ', sup: '+' }], 64, FAMRGB.l, a * g2, 10); fml(vx - 300, vy - 570, [{ s: 'ν', sub: 'μ' }], 64, [140, 240, 190], a * g2, 10);
  fml(540, 1530, [{ s: 'π', sup: '+' }, '  →  ', { s: 'μ', sup: '+' }, '  +  ', { s: 'ν', sub: 'μ' }], 66, [235, 245, 255], a * ss(t0 + 2.0, t0 + 3.0, t), 10); }

function sceneDetector(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const x0 = 260, x1 = 820, y0 = 560, y1 = 1380;
  for (let i = 0; i <= 14; i++) { const y = lerp(y0, y1, i / 14); L.addL(x0, y, x1, y, a * 0.14, 'sapph'); } for (let i = 0; i <= 8; i++) { const x = lerp(x0, x1, i / 8); L.addL(x, y0, x, y1, a * 0.14, 'sapph'); }
  for (const n of NURAIN.slice(0, 70)) { const y = (frac(n.ph + (t - t0) * 0.5 * n.sp) * 2000) - 60; L.addL(n.x, y - 140, n.x, y, a * 0.22 * n.k, 'ice'); }
  const hit = t0 + 2.4; if (t > hit) { const k = clamp((t - hit) / 2.0); const hx = 600, hy = 980; glowL(hx, hy, 70 * (1 - 0.5 * k), a * (1 - k * 0.6), 'white');
    fLine(L, hx, hy, hx + 30, hy - 60, 'f', clamp(k * 4), a, 'sapph'); fLine(L, hx + 30, hy - 60, hx + 160, hy - 300, 'f', clamp(k * 3 - 0.3), a, 'cyan'); for (let i = 0; i < 4; i++) fLine(L, hx, hy, hx - 120 + i * 50, hy - 260 - i * 20, 'f', clamp(k * 3), a * 0.5, 'ice'); }
  L.flush(GLW);
  label(540, 1500, 'A SINGLE RARE INTERACTION', a * ss(t0 + 2.6, t0 + 3.4, t), FAMRGB.l, 32, 0.12, 400); label(540, 1556, 'TAU NEUTRINO FIRST OBSERVED DIRECTLY IN 2000', a * ss(t0 + 3.0, t0 + 3.8, t) * 0.8, [235, 235, 245], 23, 0.14, 300); }

/* ---------- neutrino oscillation ---------- */
function sceneOscillation(t, a) { if (a <= 0.003) return; const L = new Lines(); const y0 = 300, y1 = 1380; const prog = clamp((t - B(99.4)) / 8.2); const N = OSC.P.length - 1; const yAt = u => lerp(y0, y1, u);
  // the path: three flavour bands whose widths are the measured probabilities
  const upto = Math.floor(prog * N);
  for (let i = 0; i < upto; i += 2) { const pr = OSC.P[i], u = i / N, y = yAt(u), yn = yAt(Math.min(1, (i + 2) / N)); let x = 540 - 80; for (let f = 0; f < 3; f++) { const w = 160 * pr[f]; C.globalAlpha = 1; C.fillStyle = rgba(NURGB[f], a * 0.3); C.fillRect(x * S, y * S, w * S, (yn - y) * S + 1); x += w; } }
  const pr = OSC.P[Math.min(N, upto)]; const py = yAt(prog); const pc = [0, 1, 2].reduce((c, f) => [c[0] + NURGB[f][0] * pr[f], c[1] + NURGB[f][1] * pr[f], c[2] + NURGB[f][2] * pr[f]], [0, 0, 0]);
  if (prog > 0 && prog < 1) { glowL(540, py, 70, a * 0.45, 'white'); TXT.push(() => { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(540 * S, py * S, 0, 540 * S, py * S, 90 * S); g.addColorStop(0, rgba(pc, a)); g.addColorStop(1, rgba(pc, 0)); ctx.fillStyle = g; ctx.fillRect(450 * S, (py - 90) * S, 180 * S, 180 * S); ctx.globalCompositeOperation = 'source-over'; }); }
  label(540, 250, 'SOURCE', a * 0.7, [235, 235, 245], 20, 0.3, 300); fml(540, 205, [{ s: 'ν', sub: 'e' }], 64, NURGB[0], a, 12);
  label(540, 1430, 'DISTANCE TRAVELLED  →', a * 0.6, [235, 235, 245], 20, 0.3, 300);
  // live probabilities
  const names = [{ s: 'ν', sub: 'e' }, { s: 'ν', sub: 'μ' }, { s: 'ν', sub: 'τ' }];
  for (let f = 0; f < 3; f++) { const x = 230 + f * 310; fml(x, 1520, [names[f]], 60, NURGB[f], a, 10); label(x, 1590, `${Math.round(pr[f] * 100)} %`, a * 0.9, NURGB[f], 30, 0.05, 300); }
  label(540, 1660, 'P (DETECTED AS EACH FLAVOUR)  ·  MEASURED MIXING ANGLES', a * 0.55, [235, 235, 245], 18, 0.14, 300);
  L.flush(FINE); }
function sceneMassStates(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const lam = [1, 1.06, 1.2]; const xs = [270, 540, 810];
  for (let j = 0; j < 3; j++) { const pts = []; for (let y = 420; y <= 1300; y += 6) pts.push([xs[j] + 70 * Math.sin((y - 420) / 52 / lam[j] - t * 3), y]); L.polyL(pts, a * 0.75, ['pearl', 'turq', 'sapph'][j]); fml(xs[j], 360, [{ s: 'ν', sub: String(j + 1) }], 64, [235, 245, 255], a, 10); }
  // the flavour states are superpositions: connection strength = |U|²
  const mix = ss(t0 + 5.4, t0 + 6.6, t); const fx = [270, 540, 810];
  for (let f = 0; f < 3; f++) for (let j = 0; j < 3; j++) { const w = OSC.U[f][j] * OSC.U[f][j]; L.addL(fx[f], 1440, xs[j], 1320, a * mix * (0.1 + 0.9 * w), NUK[f]); }
  for (let f = 0; f < 3; f++) fml(fx[f], 1490, [{ s: 'ν', sub: ['e', 'μ', 'τ'][f] }], 64, NURGB[f], a * mix, 10);
  L.flush(GLW);
  label(540, 260, 'THREE MASS STATES, SLIGHTLY DIFFERENT MASSES', a * ss(t0, t0 + 1, t) * 0.85, [235, 235, 245], 23, 0.14, 300);
  label(540, 1580, 'EACH FLAVOUR IS A QUANTUM MIXTURE OF ALL THREE', a * ss(t0 + 5.8, t0 + 6.8, t), FAMRGB.l, 26, 0.12, 400); }

function sceneEarth(t, a) { if (a <= 0.003) return; setCam([0, 0, 0], 4.2, t * 0.12, 0.25, 40); const L = new Lines();
  for (let i = 1; i < 12; i++) { const la = -Math.PI / 2 + i / 12 * Math.PI; const pts = []; for (let j = 0; j <= 48; j++) { const lo = j / 48 * TAU; pts.push([Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]); } L.poly3(pts, a * 0.3, 'turq', true); }
  for (let j = 0; j < 16; j++) { const lo = j / 16 * TAU; const pts = []; for (let i = 0; i <= 24; i++) { const la = -Math.PI / 2 + i / 24 * Math.PI; pts.push([Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]); } L.poly3(pts, a * 0.22, 'sapph'); }
  for (let i = 0; i < 28; i++) { const x = (hash(i) * 2 - 1) * 1.4, z = (hash(i * 3) * 2 - 1) * 1.4, ph = frac(hash(i * 7) + t * 0.3); const y = 3 - ph * 6; L.add3([x, y + 0.9, z], [x, y, z], a * 0.6, 'cyan'); if (project(x, y, z)) dotPx(PX, PY, 4 * S, a, 'white'); }
  L.flush(GLW); if (project(0, 0, 0)) glowPx(PX, PY, FOCAL / PD * 1.4, a * 0.25, 'turq'); }

/* ---------- act II timeline ---------- */
CAPS.push(
  { s: 'THE SIX LEPTONS', t0: B(0.0), t1: B(5.6), y: 330, size: 54, weight: 200, ls: 0.26, col: FAMRGB.l },
  { s: 'NO COLOUR CHARGE', t0: B(8.4), t1: B(12.8), y: 1440, size: 40, col: FAMRGB.l },
  { s: 'NO STRONG INTERACTION', t0: B(10.0), t1: B(12.8), y: 1505, size: 40 },
  { s: '≈ 207 × THE ELECTRON’S MASS', t0: B(36.1), t1: B(39.3), y: 1640, size: 36, col: FAMRGB.l },
  { s: 'THE NEUTRINOS', t0: B(59.9), t1: B(63.3), y: 330, size: 54, weight: 200, ls: 0.26, col: FAMRGB.l },
  { s: 'NEUTRINOS CHANGE FLAVOUR AS THEY TRAVEL', t0: B(99.6), t1: B(107.6), y: 120, size: 30, col: [235, 245, 255] },
  { s: 'SIX LEPTONS.', t0: B(117.1), t1: B(121.0), y: 1440, size: 50 },
  { s: 'THREE GENERATIONS.', t0: B(118.6), t1: B(121.0), y: 1510, size: 50, col: FAMRGB.l },
  { s: 'THE QUIET PARTICLES OF MATTER.', t0: B(121.2), t1: B(125.8), y: 1560, size: 42 },
);
function part2(t) {
  const la = win(t, A(150.6), G(1.0), 2.4, 2.4); ribbons(t, FAMC.l, la * 0.8, 30, 0.8); motes(t, ['cyan', 'turq', 'sapph'], la * 0.6, 110, 7);
  cathedral(t, win(t, A(150.8), B(14.0), 2.0, 1.4) * 0.9 + win(t, B(13), G(0.5), 1.5, 2) * 0.25);
  const lg = (o) => sceneQuarkGridL(t, o);
  lg({ a: win(t, B(1.6), B(13.3), 1.2, 0.8), cam: t => gridCam(t, 'l', B(1.6), B(13), -0.6, 0.3, 5.6), content: () => 0, glow: () => 0.35 });
  card(t, 'e', { a: win(t, B(12.9), B(19.8), 0.8, 0.7), props: ss(B(15.0), B(18.0), t), cloud: B(14.6) });
  const eu = win(t, B(19.4), B(26.6), 0.6, 0.7); miniHead('e', eu, 250); electronUses(t, eu);
  card(t, 'e', { a: win(t, B(26.2), B(30.5), 0.7, 0.7), props: 1, cloud: B(14.6) });
  card(t, 'mu', { a: win(t, B(30.2), B(39.2), 0.7, 0.7), props: ss(B(32.2), B(35.4), t) });
  sceneShower(t, win(t, B(38.8), B(45.4), 0.6, 0.7), B(39.0));
  card(t, 'ta', { a: win(t, B(45.1), B(50.0), 0.7, 0.7), props: ss(B(47.3), B(49.4), t) });
  const td = win(t, B(49.6), B(56.0), 0.6, 0.7); miniHead('ta', td, 250); sceneTauDecay(t, td, B(49.9));
  lg({ a: win(t, B(55.7), B(61.8), 1.0, 0.8), cam: t => gridCam(t, 'l', B(55.7), B(61.6), 0.4, -0.2, 5.6), content: k => k[0] === 'v' ? ss(B(57.0), B(59.6), t) : 1, glow: k => k[0] === 'v' ? 0.9 : 0.1, fa: k => k[0] === 'v' ? 1 : 0.5, gen: 1 });
  card(t, 've', { a: win(t, B(61.4), B(66.8), 0.7, 0.7), props: ss(B(63.4), B(65.6), t) });
  const sun = win(t, B(66.4), B(76.2), 0.8, 0.8); sceneSun(t, sun, B(66.6));
  card(t, 'vm', { a: win(t, B(75.9), B(80.6), 0.7, 0.7), props: ss(B(77.6), B(79.6), t) });
  const pi = win(t, B(80.2), B(85.0), 0.6, 0.6); miniHead('vm', pi, 250); scenePion(t, pi, B(80.4));
  card(t, 'vt', { a: win(t, B(84.8), B(91.3), 0.7, 0.7), props: ss(B(86.8), B(89.4), t) });
  const dt = win(t, B(91.0), B(96.9), 0.6, 0.7); miniHead('vt', dt, 250); sceneDetector(t, dt, B(91.2));
  sceneOscillation(t, win(t, B(96.6), B(107.9), 0.8, 0.7));
  sceneMassStates(t, win(t, B(107.7), B(117.2), 0.8, 0.8), B(107.8));
  lg({ a: win(t, B(116.9), B(121.4), 1.0, 0.8), cam: t => gridCam(t, 'l', B(117), B(121.4), -0.15, 0.15, 6.0), content: () => 1, glow: () => 0.6 + 0.3 * Math.sin(t * 2), gen: 1 });
  sceneEarth(t, win(t, B(120.9), B(126.4), 1.0, 1.4));
}
function sceneQuarkGridL(t, o) { const a = o.a; if (a <= 0.003) return; o.cam(t); const set = ['e', 've', 'mu', 'vm', 'ta', 'vt'];
  drawChart(t, k => { const i = set.indexOf(k); if (i < 0) return null; return { a: a * (o.fa ? o.fa(k, i) : 1), content: o.content(k, i), glow: o.glow(k, i), detail: 0 }; });
  genLabels('l', ['e', 'mu', 'ta'], a * (o.gen ?? 0));
  if ((o.gen ?? 0) > 0.01 && project(0, CHART.e[1] + FH / 2 + 0.22, 0)) label(PX / S, PY / S, 'CHARGED LEPTONS        NEUTRINOS', a * o.gen * 0.8, FAMRGB.l, 20, 0.16, 300); }
