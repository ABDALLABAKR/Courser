'use strict';
/* =====================================================================
   PART 1 — the hidden architecture, fields, the six quarks
   ===================================================================== */
let IRIS, UNI, DNA, CLOUD, NUC, THREADS, EVT, VEV;

function initPart1() { const R = rng(1897);
  // --- iris texture
  const N = 2048; IRIS = document.createElement('canvas'); IRIS.width = IRIS.height = N; const g = IRIS.getContext('2d'); const c = N / 2, Ri = N * 0.49;
  const base = g.createRadialGradient(c, c, Ri * 0.28, c, c, Ri);
  base.addColorStop(0, '#6a4618'); base.addColorStop(0.18, '#a8742a'); base.addColorStop(0.32, '#56603a'); base.addColorStop(0.55, '#33605a'); base.addColorStop(0.82, '#22434e'); base.addColorStop(0.95, '#0c1c26'); base.addColorStop(1, '#05080c');
  g.fillStyle = base; g.beginPath(); g.arc(c, c, Ri, 0, TAU); g.fill();
  g.lineCap = 'round';
  for (let i = 0; i < 3400; i++) { const th = R() * TAU, r0 = Ri * (0.3 + R() * 0.12), r1 = Ri * (0.7 + R() * 0.28), wob = (R() - 0.5) * 0.08; g.beginPath();
    for (let k = 0; k <= 14; k++) { const u = k / 14, r = lerp(r0, r1, u), a = th + wob * Math.sin(u * 5 + i) + 0.03 * Math.sin(u * 13 + i * 0.7); if (k === 0) g.moveTo(c + r * Math.cos(a), c + r * Math.sin(a)); else g.lineTo(c + r * Math.cos(a), c + r * Math.sin(a)); }
    const warm = R() < 0.35; g.strokeStyle = warm ? `rgba(${200 + R() * 55 | 0},${140 + R() * 60 | 0},${60 + R() * 40 | 0},${0.12 + R() * 0.25})` : `rgba(${70 + R() * 70 | 0},${120 + R() * 70 | 0},${115 + R() * 60 | 0},${0.1 + R() * 0.2})`;
    g.lineWidth = 1 + R() * 3; g.stroke(); }
  for (let i = 0; i < 70; i++) { const th = R() * TAU, r = Ri * (0.45 + R() * 0.35); g.fillStyle = `rgba(5,10,12,${0.25 + R() * 0.3})`; g.beginPath(); g.ellipse(c + r * Math.cos(th), c + r * Math.sin(th), Ri * (0.02 + R() * 0.03), Ri * (0.008 + R() * 0.012), th, 0, TAU); g.fill(); }
  g.strokeStyle = 'rgba(255,215,140,0.35)'; g.lineWidth = 6; g.beginPath(); for (let k = 0; k <= 200; k++) { const th = k / 200 * TAU, r = Ri * (0.46 + 0.025 * Math.sin(th * 23) + 0.012 * Math.sin(th * 51)); k ? g.lineTo(c + r * Math.cos(th), c + r * Math.sin(th)) : g.moveTo(c + r * Math.cos(th), c + r * Math.sin(th)); } g.stroke();
  for (const rr of [0.74, 0.84]) { g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 10; g.beginPath(); g.arc(c, c, Ri * rr, 0, TAU); g.stroke(); }
  const lim = g.createRadialGradient(c, c, Ri * 0.86, c, c, Ri); lim.addColorStop(0, 'rgba(0,0,0,0)'); lim.addColorStop(1, 'rgba(0,0,0,0.85)'); g.fillStyle = lim; g.beginPath(); g.arc(c, c, Ri, 0, TAU); g.fill();
  const pin = g.createRadialGradient(c, c, Ri * 0.26, c, c, Ri * 0.36); pin.addColorStop(0, 'rgba(0,0,0,0.9)'); pin.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = pin; g.beginPath(); g.arc(c, c, Ri * 0.36, 0, TAU); g.fill();
  // --- the universe in the pupil (unit = pupil radius)
  UNI = { stars: [], gal: [], neb: [] };
  for (let i = 0; i < 700; i++) { const r = Math.sqrt(R()) * 1.6, th = R() * TAU; UNI.stars.push([r * Math.cos(th), r * Math.sin(th), Math.pow(R(), 3), R() < 0.2 ? 'cyan' : R() < 0.5 ? 'hgold' : 'white']); }
  for (let i = 0; i < 1300; i++) { const arm = i % 2, s = Math.pow(R(), 0.7), th = arm * Math.PI + s * 9 + gauss(R) * 0.28, r = 0.03 + s * 0.5; UNI.gal.push([r * Math.cos(th), r * Math.sin(th) * 0.55, R(), s]); }
  for (let i = 0; i < 26; i++) UNI.neb.push([-0.5 + gauss(R) * 0.25, 0.35 + gauss(R) * 0.2, 0.15 + R() * 0.25, R() < 0.6 ? 'violet' : 'magenta']);
  // --- DNA double helix (molecules)
  DNA = []; for (let i = 0; i < 90; i++) { const y = -9 + i * 0.2, th = i * 0.6; for (const s of [0, Math.PI]) DNA.push({ p: [Math.cos(th + s), y, Math.sin(th + s)], k: R() < 0.3 ? 'crimson' : R() < 0.6 ? 'cyan' : 'white', r: 0.7 + R() * 0.5, i, s }); }
  // --- electron probability cloud (hydrogen-like 1s + 2p orbitals, rejection-sampled |ψ|²)
  CLOUD = []; const gam = k => { let s = 0; for (let i = 0; i < k; i++) s -= Math.log(1 - R()); return s; };
  for (let i = 0; i < 5200; i++) { const type = R(); let x, y, z;
    if (type < 0.18) { const r = gam(3) * 0.5; const ct = R() * 2 - 1, ph = R() * TAU, st = Math.sqrt(1 - ct * ct); x = r * st * Math.cos(ph); y = r * ct; z = r * st * Math.sin(ph); }
    else { const ax = Math.floor(R() * 3); const r = gam(5) * 0.5; let ct; do { ct = R() * 2 - 1; } while (R() > ct * ct); const ph = R() * TAU, st = Math.sqrt(1 - ct * ct); const v = [r * st * Math.cos(ph), r * st * Math.sin(ph), r * ct]; [x, y, z] = ax === 0 ? [v[2], v[0], v[1]] : ax === 1 ? [v[0], v[2], v[1]] : v; }
    CLOUD.push([x * 0.42, y * 0.42, z * 0.42, R()]); }
  // --- nucleus (carbon-12: 6 protons + 6 neutrons)
  NUC = []; const ico = []; const ph = (1 + Math.sqrt(5)) / 2; for (const [a, b] of [[1, ph], [-1, ph], [1, -ph], [-1, -ph]]) { ico.push([0, a, b], [a, b, 0], [b, 0, a]); }
  ico.forEach((p, i) => { const n = Math.hypot(...p); NUC.push({ c: p.map(v => v / n * 0.62), pr: i % 2 === 0, ax: [R() - 0.5, R() - 0.5, R() - 0.5], ph: R() * TAU }); });
  // --- scaffold threads for the tower
  THREADS = []; for (let i = 0; i < 260; i++) THREADS.push({ x: (R() * 2 - 1) * 3.4, z: -0.6 - R() * 3.2, d: R(), k: R() < 0.33 ? 'gold' : R() < 0.5 ? 'cyan' : R() < 0.75 ? 'violet' : 'pearl', w: R() });
  // --- collision event (charm)
  EVT = []; for (let i = 0; i < 34; i++) { const th = R() * TAU, curv = (R() < 0.5 ? -1 : 1) * (0.0015 + R() * 0.006), len = 220 + R() * 300; EVT.push({ th, curv, len, k: R() < 0.5 ? 'gold' : R() < 0.7 ? 'amber' : 'white', d: R() * 0.3 }); }
  VEV = []; for (let i = 0; i < 22; i++) VEV.push({ x: 140 + R() * 800, y: 300 + R() * 1250, th: -Math.PI / 2 + (R() - 0.5) * 1.4, op: 0.25 + R() * 0.35, l1: 90 + R() * 160, l2: 70 + R() * 140, c1: (R() - 0.5) * 0.006, c2: (R() - 0.5) * 0.012, t0: R(), neutral: 40 + R() * 120 });
}

/* ---------- flowing ribbons (family landscapes) ---------- */
function ribbons(t, keys, a, n = 34, sp = 1) { if (a <= 0.003) return; const L = new Lines();
  for (let i = 0; i < n; i++) { const x0 = (i + 0.5) / n * 1180 - 50; const pts = []; const k = keys[i % keys.length];
    for (let y = -60; y <= 1980; y += 36) { const x = x0 + 70 * Math.sin(y * 0.0037 + t * 0.25 * sp + i * 0.9) + 34 * Math.sin(y * 0.011 - t * 0.45 * sp + i * 1.7); pts.push([x, y]); }
    const ph = frac(t * 0.08 * sp + hash(i)); L.polyL(pts, j => a * (0.1 + 0.32 * Math.exp(-Math.pow((j / pts.length - ph) * 6, 2))) * (0.5 + 0.5 * hash(i * 3)), k); }
  L.flush(FINE); }
function motes(t, keys, a, n = 140, seed = 3) { if (a <= 0.003) return; for (let i = 0; i < n; i++) { const x = hash(i * 7 + seed) * 1080, y = frac(hash(i * 13 + seed) - t * 0.012 * (0.5 + hash(i))) * 2000 - 40; const tw = 0.5 + 0.5 * Math.sin(t * (1 + hash(i)) + i);
  glowL(x, y, 10 + 14 * hash(i * 3), a * 0.25 * tw, keys[i % keys.length]); dotL(x, y, 2.2, a * 0.6 * tw, 'white'); } }

/* ---------- opening threads + title ---------- */
function sceneOpen(t, a) { if (a <= 0.003) return; const L = new Lines();
  for (let i = 0; i < 90; i++) { const pts = []; const y0 = 200 + hash(i) * 1500, k = ['violet', 'gold', 'cyan', 'cobalt'][i % 4];
    for (let x = -40; x <= 1120; x += 30) pts.push([x, y0 + 80 * Math.sin(x * 0.004 + t * 0.3 + i) + 30 * Math.sin(x * 0.013 - t * 0.5 + i * 2)]);
    const g = ss(0, 3, t + hash(i) * 1.5); L.polyL(pts, j => a * g * 0.22 * Math.exp(-Math.pow((j / pts.length - frac(t * 0.1 + hash(i * 5))) * 4, 2)), k); }
  L.flush(FINE); motes(t, ['gold', 'violet', 'cyan'], a * 0.6, 80, 9); }

/* ---------- the eye and the universe in its reflection ---------- */
function eyeZoom(t) { return t < A(12.3) ? lerp(1.0, 1.55, ease((t - A(4.0)) / 8.3)) : 1.55 * Math.exp(Math.pow(clamp((t - A(12.3)) / 2.3), 2.2) * 2.0); }
function sceneEye(t, a) { if (a <= 0.003) return; const Z = eyeZoom(t); const cx = 540, cy = 930; const RI = 440 * Z; const rp = RI * 0.335 * (1 + 0.015 * Math.sin(t * 0.7));
  const g = C; g.globalCompositeOperation = 'source-over'; g.globalAlpha = a;
  if (rp < 1300) {
    // skin and lids (dark, rim-lit)
    g.fillStyle = '#0b0605'; g.fillRect(0, 0, W, H);
    const up = x => cy - 0.84 * RI * (1 - Math.pow((x - cx) / (1.9 * RI), 2)), lo = x => cy + 0.9 * RI * (1 - Math.pow((x - cx) / (1.9 * RI), 2));
    g.save(); g.beginPath(); for (let x = -20; x <= 1100; x += 20) g.lineTo(x * S, up(x) * S); for (let x = 1100; x >= -20; x -= 20) g.lineTo(x * S, lo(x) * S); g.closePath(); g.clip();
    const scl = g.createRadialGradient(cx * S, cy * S, RI * 0.9 * S, cx * S, cy * S, RI * 2.2 * S); scl.addColorStop(0, '#5a4a48'); scl.addColorStop(0.45, '#2e2224'); scl.addColorStop(1, '#0c0708'); g.fillStyle = scl; g.fillRect(0, 0, W, H);
    g.globalAlpha = a * 0.9; g.drawImage(IRIS, (cx - RI / 0.98) * S, (cy - RI / 0.98) * S, (2 * RI / 0.98) * S, (2 * RI / 0.98) * S);
    // pupil = window into a miniature universe
    g.globalAlpha = a; g.save(); g.beginPath(); g.arc(cx * S, cy * S, rp * S, 0, TAU); g.clip(); g.fillStyle = '#010104'; g.fillRect(0, 0, W, H); g.restore();
    const lidSh = g.createLinearGradient(0, up(cx) * S, 0, (up(cx) + 0.5 * RI) * S); lidSh.addColorStop(0, 'rgba(0,0,0,0.85)'); lidSh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lidSh; g.fillRect(0, 0, W, H);
    g.restore();
    // lashes
    g.strokeStyle = 'rgba(46,32,28,0.95)'; g.lineCap = 'round';
    for (let i = 0; i < 110; i++) { const x = cx + (hash(i) * 2 - 1) * 2.0 * RI; if (x < -80 || x > 1160) continue; const y = up(x), len = (60 + 70 * hash(i * 3)) * Z * (1 - Math.abs(x - cx) / (2.3 * RI)) ; const lean = (x - cx) / (2.3 * RI);
      g.lineWidth = (2.2 + 1.8 * hash(i * 7)) * S * Math.sqrt(Z); g.beginPath(); g.moveTo(x * S, y * S); g.quadraticCurveTo((x + lean * len * 0.4) * S, (y - len * 0.7) * S, (x + lean * len * 0.9 + 20 * Z) * S, (y - len) * S); g.stroke(); }
    const rim = g.createLinearGradient(0, (lo(cx) - 10) * S, 0, (lo(cx) + 30) * S); rim.addColorStop(0, 'rgba(255,200,170,0.0)'); rim.addColorStop(0.5, 'rgba(255,190,160,0.10)'); rim.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rim; g.fillRect(0, (lo(cx) - 10) * S, W, 40 * S);
  } else { g.fillStyle = '#010104'; g.fillRect(0, 0, W, H); }
  g.globalAlpha = 1;
  // the miniature universe (drawn additively, clipped by the pupil until we pass through it)
  const uz = rp * (1 + 0.35 * clamp((t - A(12.3)) / 3)); const clipR = rp < 1300 ? rp : 1e9; const ua = a * ss(A(4.3), A(7.0), t);
  C.save(); if (clipR < 1e8) { C.beginPath(); C.arc(cx * S, cy * S, clipR * S, 0, TAU); C.clip(); }
  C.globalCompositeOperation = 'lighter'; const gx = cx + 0.18 * uz, gy = cy - 0.1 * uz;
  for (const [x, y, r, k] of UNI.neb) glowL(cx + x * uz, cy + y * uz, r * uz * 1.1, ua * 0.1, k);
  for (const [x, y, b, k] of UNI.stars) { const X = cx + x * uz, Y = cy + y * uz; if (X < -20 || X > 1100 || Y < -20 || Y > 1940) continue; dotL(X, Y, 1.4 + 3 * b, ua * (0.4 + 0.6 * b), k); if (b > 0.5) glowL(X, Y, 10 + 20 * b, ua * 0.3 * b, k); }
  const rot = t * 0.04; glowL(gx, gy, 0.42 * uz, ua * 0.35, 'gold'); glowL(gx, gy, 0.1 * uz, ua * 0.8, 'hgold');
  for (const [x, y, b, s] of UNI.gal) { const xr = x * Math.cos(rot) - y * Math.sin(rot) * 1.8, yr = (x * Math.sin(rot) * 0.55 + y * Math.cos(rot)); dotL(gx + xr * uz, gy + yr * uz, 1.2 + 1.6 * b, ua * (0.5 - 0.3 * s), s < 0.4 ? 'hgold' : b < 0.3 ? 'cyan' : 'gold'); }
  glowL(cx - 0.55 * uz, cy + 0.5 * uz, 0.3 * uz, ua * 0.25, 'turq');
  C.restore();
  // a soft corneal highlight
  if (rp < 900) { glowL(cx - RI * 0.42, cy - RI * 0.42, RI * 0.16, a * 0.22, 'white'); }
}

/* ---------- molecules → atom ---------- */
function sceneDNA(t, a) { if (a <= 0.003) return; const k = clamp((t - A(13.6)) / 4.6); setCam([0, lerp(-3, 2.5, ease(k)), 0], lerp(9, 3.0, ease(k)), 0.4 + t * 0.15, 0.12);
  const L = new Lines(); for (let i = 0; i + 2 < DNA.length; i += 2) { const p = DNA[i], q2 = DNA[i + 1]; L.add3(p.p, q2.p, a * 0.18, 'ice'); if (i + 3 < DNA.length) { L.add3(p.p, DNA[i + 2].p, a * 0.5, 'cyan'); L.add3(q2.p, DNA[i + 3].p, a * 0.5, 'violet'); } }
  L.flush(GLW); for (const d of DNA) if (project(...d.p)) { const r = FOCAL / PD * 0.13 * d.r; glowPx(PX, PY, r * 2.4, a * 0.35, d.k); dotPx(PX, PY, r, a * 0.85, 'white'); }
  if (project(0, 2.5, 0)) glowPx(PX, PY, FOCAL / PD * 0.6, a * 0.4 * ss(A(16.5), A(18), t), 'cyan'); }
function sceneAtom(t, a, dissolve) { if (a <= 0.003) return; setCam([0, 0, 0], lerp(3.4, 2.5, ease((t - A(16.8)) / 5)), t * 0.18, 0.3);
  const sp = dissolve; for (const [x, y, z, r] of CLOUD) { const yy = y + sp * (r - 0.5) * 0.4, xx = x * (1 + sp * 3 * r), zz = z; if (!project(xx, yy, zz)) continue; dotPx(PX, PY, FOCAL / PD * 0.016 * (1 + sp), a * (0.45 + 0.35 * r) * (1 - sp * 0.6), r < 0.5 ? 'cyan' : 'sapph'); }
  for (const n of NUC) { const p = n.c.map(v => v * 0.18); if (project(...p)) { glowPx(PX, PY, FOCAL / PD * 0.08, a * 0.6 * (1 - sp), n.pr ? 'gold' : 'amber'); dotPx(PX, PY, FOCAL / PD * 0.03, a * (1 - sp), 'white'); } }
  if (project(0, 0, 0)) glowPx(PX, PY, FOCAL / PD * 0.25, a * 0.3 * (1 - sp), 'gold'); }

/* ---------- the fields ---------- */
const SHEETS = [[-3.2, 'gold'], [-1.0, 'cyan'], [1.2, 'violet'], [3.4, 'pearl'], [-5.4, 'magenta']];
function sceneFields(t, a) { if (a <= 0.003) return; const look = ss(A(40.6), A(42.6), t); const fwd = (t - A(21)) * 0.22;
  setCam([0, lerp(-0.1, 0.4, look), fwd], 6.5, 0, lerp(0.42, -0.4, look)); const L = new Lines();
  const pk1 = { x: 0.3, z: fwd + 0.2, h: 1.1, w: 0.6, k: 9, a: ss(A(32.9), A(34.5), t) }, pk2 = { x: -0.2, z: fwd + 0.2, h: -1.0, w: 0.55, k: 10, a: ss(A(41.2), A(42.8), t) };
  SHEETS.forEach(([y, k], i) => { const sa = a * ss(A(22.5) + i * 0.8, A(24.5) + i * 0.8, t) * (k === 'cyan' ? 1 : 0.7); const pks = k === 'cyan' ? [pk1] : k === 'violet' ? [pk2] : [];
    fieldSheet(L, t, y, k, sa * (k === 'cyan' || k === 'violet' ? 1 : 0.6), pks, { n: 30, ext: 7, z0: fwd }); });
  L.flush(FINE);
  if (project(pk1.x, -1.0 + 0.6, pk1.z)) { glowPx(PX, PY, FOCAL / PD * 0.8, a * pk1.a * 0.7, 'cyan'); dotPx(PX, PY, FOCAL / PD * 0.08, a * pk1.a, 'white'); const x = PX / S, y = PY / S; fml(x, y - 120, [P.e.sym], 90, FAMRGB.l, a * ss(A(38.0), A(39.0), t) * (1 - look), 18); label(x, y - 50, 'ELECTRON FIELD', a * ss(A(38.3), A(39.3), t) * (1 - look), FAMRGB.l, 26, 0.24, 400); }
  if (project(pk2.x, 1.2 - 0.6, pk2.z)) { glowPx(PX, PY, FOCAL / PD * 0.8, a * pk2.a * 0.7, 'violet'); dotPx(PX, PY, FOCAL / PD * 0.08, a * pk2.a, 'white'); const x = PX / S, y = PY / S; fml(x, y + 70, [P.ga.sym], 90, FAMRGB.b, a * ss(A(41.4), A(42.4), t), 18); label(x, y + 150, 'ELECTROMAGNETIC FIELD', a * ss(A(41.6), A(42.6), t), FAMRGB.b, 26, 0.22, 400); }
  label(540, 1480, 'A PARTICLE = A LOCALIZED QUANTUM EXCITATION OF A FIELD', a * win(t, A(33.6), A(37.9), 0.8, 0.6), [235, 235, 245], 25, 0.14, 300);
}

/* ---------- the tower of seventeen frames ---------- */
function towerCam(t) { const yb = CHART.H[1] - 0.3, yt = CHART.u[1] + 0.2; const k = ease((t - A(44.8)) / 5.6); const back = ease((t - A(50.3)) / 3.0);
  setCam([0, lerp(lerp(yb, yt, k), 0, back), 0], lerp(5.2, 8.8, back), lerp(-0.35, 0.18, clamp((t - A(44.8)) / 12)), lerp(0.18, 0.03, back)); }
function sceneTower(t, a) { if (a <= 0.003) return; towerCam(t); const L = new Lines();
  // scaffold: thousands of fine lines rising out of darkness
  for (const th of THREADS) { const g = clamp((t - A(44.4) - th.d * 2.5) / 2.2); if (g <= 0) continue; const y0 = -7.5, y1 = lerp(y0, 7.5, ease(g)); const pts = []; for (let k = 0; k <= 12; k++) { const y = lerp(y0, y1, k / 12); pts.push([th.x + 0.06 * Math.sin(y * 1.3 + th.w * 6 + t * 0.4), y, th.z]); } L.poly3(pts, a * 0.22 * (0.4 + th.w), th.k); }
  for (let r = -7; r <= 7; r += 0.7) { const g = ss(A(45.5), A(48.5), t + r * 0.05); L.add3([-3.2, r, -0.6], [3.2, r, -0.6], a * g * 0.08, 'ice'); }
  L.flush(FINE);
  const pulseY = lerp(CHART.H[1] - 1, CHART.u[1] + 1.2, clamp((t - A(52.0)) / 2.4)), quarks = ss(A(55.0), A(55.8), t); const keysQ = { u: 1, d: 1, c: 1, s: 1, t: 1, b: 1 };
  drawChart(t, k => { const i = KEYS.length - 1 - KEYS.indexOf(k); const t0 = A(45.0) + i * 0.3; const g = ss(t0, t0 + 1.6, t); const pulse = t > A(52) && t < A(54.8) ? Math.exp(-Math.pow((CHART[k][1] - pulseY) * 1.6, 2)) : 0;
    return { a: a * g * (1 - 0.6 * quarks * (keysQ[k] ? 0 : 1)), yaw: (1 - ease(clamp((t - t0) / 2.4))) * (1.4 + 0.12 * i), glow: Math.max(pulse, keysQ[k] ? quarks : 0), content: 0 }; });
}

/* ---------- quark world ---------- */
function gridCam(t, sect, k0, k1, from, to, dist = 6.2) { const k = ease(clamp((t - k0) / (k1 - k0))); setCam([0, SECT[sect] + lerp(from, to, k), 0], dist, 0.12 * Math.sin(t * 0.15), 0.04); }
const GEN = ['I', 'II', 'III'];
function genLabels(sect, rowsKeys, a) { rowsKeys.forEach((k, i) => { if (project(-CX - FW / 2 - 0.16, CHART[k][1], 0)) label(PX / S, PY / S, GEN[i], a, [235, 235, 245], 26, 0.1, 300); }); }
function sceneQuarkGrid(t, a, o) { if (a <= 0.003) return; o.cam(t); const set = ['u', 'd', 'c', 's', 't', 'b'];
  drawChart(t, k => { const i = set.indexOf(k); if (i < 0) return null; return { a: a * (o.fa ? o.fa(k, i) : 1), content: o.content(k, i), glow: o.glow ? o.glow(k, i) : 0.3, detail: o.detail ? o.detail(k, i) : 0 }; });
  genLabels('q', ['u', 'c', 't'], a * (o.gen ?? 0));
  if (o.gen > 0.01 && project(0, CHART.u[1] + FH / 2 + 0.22, 0)) { label(PX / S - 0, PY / S, 'UP-TYPE   +2/3        DOWN-TYPE   −1/3', a * o.gen * 0.8, FAMRGB.q, 20, 0.16, 300); }
}
function miniHead(key, a, y = 300) { if (a <= 0.003) return; const pa = P[key]; fml(540, y, [pa.sym], 92, [255, 255, 255], a, 16); label(540, y + 78, pa.name, a * 0.9, FAMRGB[pa.fam], 28, 0.24, 300); }

function sceneNucleus(t, a) { if (a <= 0.003) return; setCam([0, 0, 0], 3.2, t * 0.22, 0.25, -40); const L = new Lines();
  const pts = NUC.map((n, i) => { const qs = []; for (let j = 0; j < 3; j++) { const th = t * (1.4 + 0.2 * i) + j * TAU / 3 + n.ph; const u = [Math.cos(th) * 0.17, Math.sin(th) * 0.17 * Math.cos(n.ph), Math.sin(th) * 0.17 * Math.sin(n.ph)]; qs.push([n.c[0] + u[0], n.c[1] + u[1], n.c[2] + u[2]]); } return qs; });
  pts.forEach((qs, i) => { for (let j = 0; j < 3; j++) L.add3(qs[j], qs[(j + 1) % 3], a * 0.45, 'hgold'); });
  L.flush(FINE);
  pts.forEach((qs, i) => { if (project(...NUC[i].c)) glowPx(PX, PY, FOCAL / PD * 0.42, a * 0.16, NUC[i].pr ? 'gold' : 'amber'); qs.forEach((q3, j) => { if (project(...q3)) { glowPx(PX, PY, FOCAL / PD * 0.12, a * 0.6, CC[(j + Math.floor(t * 1.2) + i) % 3]); dotPx(PX, PY, FOCAL / PD * 0.03, a, 'white'); } }); });
  if (project(0, 0, 0)) glowPx(PX, PY, FOCAL / PD * 1.6, a * 0.18, 'amber');
  label(540, 1330, 'AN ATOMIC NUCLEUS', a, FAMRGB.q, 44, 0.2, 300); label(540, 1400, 'PROTONS (uud)  +  NEUTRONS (udd)', a * 0.85, [235, 235, 245], 26, 0.14, 300); }

function sceneCollision(t, a, t0) { if (a <= 0.003) return; const cx = 540, cy = 980, L = new Lines(); const k = clamp((t - t0) / 1.6);
  for (const r of [110, 200, 300, 400]) { const pts = []; for (let i = 0; i <= 90; i++) pts.push([cx + r * Math.cos(i / 90 * TAU), cy + r * Math.sin(i / 90 * TAU)]); L.polyL(pts, a * 0.12, 'amber'); }
  // incoming beams
  const bk = clamp((t - t0 + 0.6) / 0.6); L.addL(cx, cy - 700, cx, cy - 700 + 700 * bk, a * 0.5 * (1 - k), 'white'); L.addL(cx, cy + 700, cx, cy + 700 - 700 * bk, a * 0.5 * (1 - k), 'white');
  for (const e of EVT) { const pts = []; let x = cx, y = cy, th = e.th; const n = Math.floor(40 * clamp(k * 1.3 - e.d)); for (let i = 0; i <= n; i++) { pts.push([x, y]); x += Math.cos(th) * e.len / 40; y += Math.sin(th) * e.len / 40; th += e.curv * e.len / 40 * 0.9; } if (pts.length > 1) L.polyL(pts, a * 0.55, e.k); }
  // the charm hadron: neutral, flies a short distance (dashed), then decays
  const dk = clamp((t - t0 - 0.6) / 1.2); const vx = cx + 120 * dk, vy = cy - 170 * dk; fLine(L, cx, cy, vx, vy, 'dash', 1, a * 0.8, 'white');
  if (dk >= 1) { const g = clamp((t - t0 - 1.8) / 1.0); fLine(L, vx, vy, vx + 260, vy - 240, 'f', g, a * 0.8, 'gold'); fLine(L, vx, vy, vx - 40, vy - 330, 'f', g, a * 0.8, 'crimson'); vertex(vx, vy, a * g, 'gold'); }
  L.flush(GLW); vertex(cx, cy, a * k, 'white');
  const la = a * ss(t0 + 2.2, t0 + 3, t); fml(vx + 150, vy + 30, [{ s: 'D', sup: '0' }, '  =  ', { s: 'c' }, { s: 'u', bar: 1 }], 50, FAMRGB.q, la, 10);
  label(540, 1520, 'SHORT-LIVED: ≈ 4 × 10⁻¹³ s', la * 0.9, [235, 235, 245], 26, 0.14, 300); }

function sceneCloudChamber(t, a, t0) { if (a <= 0.003) return; const L = new Lines();
  for (let i = 0; i < 26; i++) { const x = hash(i * 3) * 1080; L.addL(x, -20, x + (hash(i) - 0.5) * 300, 1940, a * 0.1 * clamp((t - t0) * 2 - hash(i) * 3), 'ice'); }
  for (const v of VEV) { const g = clamp((t - t0 - v.t0 * 3.5) / 0.9); if (g <= 0) continue; const ox = v.x, oy = v.y;
    const p1 = [], p2 = []; let th1 = v.th - v.op, th2 = v.th + v.op, x1 = ox, y1 = oy, x2 = ox, y2 = oy; for (let i = 0; i <= 20 * g; i++) { p1.push([x1, y1]); p2.push([x2, y2]); x1 += Math.cos(th1) * v.l1 / 20; y1 += Math.sin(th1) * v.l1 / 20; th1 += v.c1 * 5; x2 += Math.cos(th2) * v.l2 / 20; y2 += Math.sin(th2) * v.l2 / 20; th2 += v.c2 * 5; }
    L.polyL(p1, a * 0.7, 'ice'); L.polyL(p2, a * 0.7, 'gold'); glowL(ox, oy, 18, a * g * 0.6, 'hgold'); }
  L.flush(GLW);
  label(540, 1500, '“V” DECAYS OF STRANGE PARTICLES', a * ss(t0 + 1, t0 + 2, t), FAMRGB.q, 32, 0.14, 300); label(540, 1556, 'COSMIC-RAY CLOUD CHAMBERS · 1947', a * ss(t0 + 1.4, t0 + 2.4, t) * 0.85, [235, 235, 245], 24, 0.16, 300); }

function sceneMassLadder(t, a, t0) { if (a <= 0.003) return; const set = ['u', 'd', 's', 'c', 'b', 't'], mv = [2.2, 4.7, 93, 1270, 4180, 172600]; const L = new Lines();
  const x0 = 250, x1 = 960, lg = m => (Math.log10(m) - 0) / (Math.log10(3e5)); label(540, 610, 'QUARK MASSES  ·  LOGARITHMIC SCALE', a * 0.85, [235, 235, 245], 24, 0.16, 300);
  set.forEach((k, i) => { const y = 700 + i * 105; const g = ease(clamp((t - t0 - i * 0.15) / 1.2)); const xe = lerp(x0, lerp(x0, x1, lg(mv[i])), g); const top = k === 't';
    TXT.push(() => { const gr = ctx.createLinearGradient(x0 * S, 0, x1 * S, 0); gr.addColorStop(0, rgba(COL.amber, 0.25 * a)); gr.addColorStop(1, rgba(top ? COL.hgold : COL.gold, 0.9 * a)); ctx.fillStyle = gr; ctx.fillRect(x0 * S, (y - 9) * S, (xe - x0) * S, 18 * S); });
    glowL(xe, y, top ? 40 : 22, a * g * 0.6, top ? 'hgold' : 'gold');
    fml(180, y, [P[k].sym], 64, [255, 255, 255], a, 8); label(Math.min(xe + 24, 760), y - 38, P[k].m.replace('≈ ', ''), a * g * 0.9, FAMRGB.q, 26, 0.06, 300, 'left'); });
  L.flush(FINE);
  label(540, 1380, 'THE HEAVIEST KNOWN ELEMENTARY PARTICLE', a * ss(t0 + 1.4, t0 + 2.4, t), [255, 225, 170], 30, 0.12, 400); }
function sceneTopDecay(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); const vx = 540, vy = 1050; const g1 = clamp((t - t0) / 1.0), g2 = clamp((t - t0 - 1.0) / 1.2);
  fLine(L, vx, 1450, vx, vy, 'f', g1, a * 0.9, 'gold'); fLine(L, vx, vy, vx - 260, vy - 420, 'wave', g2, a * 0.9, 'magenta', t); fLine(L, vx, vy, vx + 250, vy - 420, 'f', g2, a * 0.9, 'amber');
  L.flush(GLW); if (g1 >= 1) vertex(vx, vy, a, 'gold');
  fml(vx + 50, 1330, [{ s: 't' }], 80, [255, 255, 255], a * g1, 12); fml(vx - 300, vy - 470, [{ s: 'W', sup: '+' }], 80, FAMRGB.b, a * g2, 12); fml(vx + 290, vy - 470, [{ s: 'b' }], 80, [255, 255, 255], a * g2, 12);
  label(540, 1540, 'LIFETIME ≈ 5 × 10⁻²⁵ s', a * ss(t0 + 2, t0 + 3, t), [255, 225, 170], 32, 0.14, 300);
  label(540, 1596, 'IT DECAYS BEFORE IT CAN BIND INTO HADRONS', a * ss(t0 + 2.6, t0 + 3.6, t) * 0.85, [235, 235, 245], 23, 0.14, 300); }
function sceneMirror(t, a, t0) { if (a <= 0.003) return; const L = new Lines(); L.addL(120, 930, 960, 930, a * 0.5, 'pearl'); L.flush(GLW);
  const g = ss(t0, t0 + 1.2, t); hadron(t, 540, 660, 95, [{ s: 'd' }, { s: 'b', bar: 1 }], a * g, { rot: 0.4 }); hadron(-t, 540, 1200, 95, [{ s: 'b' }, { s: 'd', bar: 1 }], a * g, { rot: 0.4 });
  fml(540, 500, ['MATTER   ', { s: 'B', sup: '0' }], 56, FAMRGB.q, a * g, 8); fml(540, 1360, ['ANTIMATTER   ', { s: 'B', sup: '0', bar: 1 }], 56, [255, 170, 150], a * g, 8);
  // decay counters: the two mirror processes do not occur at exactly the same rate
  const n1 = Math.floor(clamp((t - t0 - 1.2) / 5) * 60), n2 = Math.floor(clamp((t - t0 - 1.2) / 5) * 52);
  for (let i = 0; i < n1; i++) dotL(250 + (i % 30) * 20, 800 + Math.floor(i / 30) * 22, 7, a, 'gold'); for (let i = 0; i < n2; i++) dotL(250 + (i % 30) * 20, 1030 + Math.floor(i / 30) * 22, 7, a, 'coral');
  label(540, 1500, 'CP VIOLATION: A SUBTLE ASYMMETRY', a * ss(t0 + 3, t0 + 4, t), [255, 225, 170], 32, 0.12, 400); }

function sceneHadronCard(t, a, kind) { if (a <= 0.003) return; const p = kind === 'p'; hadron(t, 540, 800, 200, p ? ['u', 'u', 'd'] : ['u', 'd', 'd'], a, { rot: 0.2 });
  fml(540, 1250, [p ? 'PROTON  =  ' : 'NEUTRON  =  ', { s: 'u' }, { s: p ? 'u' : 'd' }, { s: 'd' }], 92, FAMRGB.q, a, 14);
  label(540, 1350, p ? 'TWO UP + ONE DOWN  ·  CHARGE +1' : 'ONE UP + TWO DOWN  ·  CHARGE 0', a * 0.9, [235, 235, 245], 27, 0.14, 300);
  label(540, 1400, 'VALENCE QUARKS BOUND BY GLUON FIELDS  ·  NOT ELEMENTARY', a * 0.7, [235, 235, 245], 20, 0.14, 300); }

/* ---------- act I timeline ---------- */
CAPS.push(
  { s: 'THE STANDARD MODEL', t0: 0.5, t1: A(3.9), y: 900, size: 80, weight: 200, ls: 0.2, fi: 1.2 },
  { s: 'THE SECRET ARCHITECTURE OF THE UNIVERSE', t0: A(1.5), t1: A(3.9), y: 990, size: 26, weight: 300, ls: 0.22, col: [255, 214, 150], alpha: 0.9 },
  { s: 'EVERYTHING WE KNOW…', t0: A(45.0), t1: A(50.1), y: 1430, size: 48, weight: 300 },
  { s: 'BEGINS WITH SOMETHING SMALLER.', t0: A(47.0), t1: A(50.1), y: 1500, size: 40, weight: 300, col: [255, 214, 150] },
  { s: 'THE STANDARD MODEL', t0: A(50.47), t1: A(54.9), y: 960, size: 86, weight: 200, ls: 0.18, fi: 1.0 },
  { s: 'THE SIX QUARKS', t0: A(55.26), t1: A(59.6), y: 330, size: 54, weight: 200, ls: 0.26, col: FAMRGB.q },
  { s: 'SIX QUARKS.', t0: A(145.43), t1: A(152.3), y: 1440, size: 50 },
  { s: 'THREE GENERATIONS.', t0: A(147.7), t1: A(152.3), y: 1510, size: 50, col: [255, 214, 150] },
  { s: 'THE FOUNDATION OF ATOMIC NUCLEI.', t0: A(149.6), t1: A(152.3), y: 1574, size: 32 },
);
function part1(t) {
  sceneOpen(t, 1 - ss(A(3.4), A(4.6), t));
  sceneEye(t, ss(A(3.6), A(5.2), t) * (1 - ss(A(14.3), A(15.3), t)));
  const dna = win(t, A(14.2), A(18.4), 1.0, 1.0); sceneDNA(t, dna); label(540, 1500, 'MOLECULES', dna * win(t, A(14.6), A(17.8), 0.6, 0.6), [235, 235, 245], 30, 0.4, 300);
  const atom = win(t, A(17.3), A(24.6), 1.0, 1.8); sceneAtom(t, atom, ss(A(20.4), A(24.2), t));
  label(540, 1500, 'ATOM', atom * win(t, A(17.6), A(20.4), 0.6, 0.6), [235, 235, 245], 30, 0.4, 300);
  label(540, 1556, 'NUCLEUS  ·  ELECTRON PROBABILITY CLOUD', atom * win(t, A(18.2), A(20.4), 0.6, 0.6) * 0.85, FAMRGB.l, 22, 0.18, 300);
  sceneFields(t, win(t, A(21.8), A(47.5), 1.5, 2.5));
  sceneTower(t, win(t, A(44.4), A(58.0), 1.0, 1.4));
  // the golden landscape of the quarks
  const qa = win(t, A(56.0), A(153.5), 2.0, 2.4); ribbons(t, FAMC.q, qa * 0.9); motes(t, ['gold', 'amber', 'hgold'], qa * 0.7, 110, 4);
  const set = ['u', 'd', 'c', 's', 't', 'b'];
  sceneQuarkGrid(t, win(t, A(56.9), A(64.6), 1.2, 0.8), { cam: t => gridCam(t, 'q', A(57), A(63.6), -1.3, 0.55, 5.2),
    content: (k, i) => ss(A(59.63) + i * 0.6, A(60.3) + i * 0.6, t), glow: (k, i) => 0.25 + 0.75 * (i < 2 ? ss(A(62.6), A(63.6), t) : 0), gen: ss(A(60), A(61), t) });
  card(t, 'u', { a: win(t, A(64.0), A(73.1), 0.9, 0.7), props: ss(A(68.0), A(71.0), t) });
  sceneHadronCard(t, win(t, A(72.6), A(78.0), 0.8, 0.7), 'p');
  card(t, 'd', { a: win(t, A(77.6), A(85.6), 0.8, 0.7), props: ss(A(80.0), A(83.0), t) });
  sceneHadronCard(t, win(t, A(85.2), A(91.0), 0.8, 0.8), 'n');
  sceneNucleus(t, win(t, A(90.5), A(96.0), 0.9, 0.8));
  sceneQuarkGrid(t, win(t, A(95.6), A(98.4), 0.8, 0.7), { cam: t => gridCam(t, 'q', A(95.6), A(98.4), 0.3, -0.5, 5.6), content: () => 1, glow: (k, i) => i >= 2 ? 0.9 : 0.15, gen: 1 });
  card(t, 'c', { a: win(t, A(97.8), A(102.8), 0.8, 0.7), props: ss(A(99.8), A(101.8), t) });
  const col = win(t, A(102.4), A(108.0), 0.7, 0.7); miniHead('c', col); sceneCollision(t, col, A(102.6));
  const sk = ease((t - A(110.0)) / 1.2); card(t, 's', { a: win(t, A(107.7), A(114.8), 0.8, 0.7), props: ss(A(108.6), A(109.8), t), sc: lerp(1, 0.56, sk), cy: lerp(760, 560, sk) });
  const hk = win(t, A(110.6), A(114.8), 0.8, 0.7); hadron(t, 300, 1180, 92, [{ s: 'u' }, { s: 's', bar: 1 }], hk, { rot: 0.3 }); hadron(t, 780, 1180, 92, ['u', 'd', 's'], hk, { rot: 0.3 });
  fml(300, 1345, ['KAON  ', { s: 'K', sup: '+' }, ' = ', { s: 'u' }, { s: 's', bar: 1 }], 46, FAMRGB.q, hk, 6); fml(780, 1345, ['HYPERON  ', { s: 'Λ', sup: '0' }, ' = ', { s: 'u' }, { s: 'd' }, { s: 's' }], 46, FAMRGB.q, hk, 6);
  const cc = win(t, A(114.3), A(120.7), 0.8, 0.8); miniHead('s', cc); sceneCloudChamber(t, cc, A(114.4));
  card(t, 't', { a: win(t, A(120.3), A(125.0), 0.8, 0.7), props: ss(A(122.4), A(124.2), t) });
  const ml = win(t, A(124.6), A(128.1), 0.6, 0.6); miniHead('t', Math.max(ml, win(t, A(127.6), A(133.8), 0.6, 0.7))); sceneMassLadder(t, ml, A(124.8));
  sceneTopDecay(t, win(t, A(127.7), A(133.8), 0.6, 0.7), A(127.9));
  card(t, 'b', { a: win(t, A(133.4), A(138.6), 0.8, 0.7), props: ss(A(135.6), A(137.4), t) });
  const mi = win(t, A(138.0), A(145.8), 0.8, 0.8); miniHead('b', mi, 250); sceneMirror(t, mi, A(138.3));
  const rc = win(t, A(145.2), A(152.6), 1.0, 2.0); sceneQuarkGrid(t, rc, { cam: t => gridCam(t, 'q', A(145.2), A(152.6), -0.2, 0.25, 6.0), content: () => 1, glow: () => 0.6 + 0.4 * Math.sin(t * 2), detail: () => 0, gen: 1,
    fa: (k, i) => 1 - ss(A(150.6) + i * 0.15, A(152.0) + i * 0.15, t) });
}
