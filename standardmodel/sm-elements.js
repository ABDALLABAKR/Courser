'use strict';
/* =====================================================================
   Reusable visual elements: particle data, the 17-frame chart, particle
   close-up cards, hadrons, Feynman diagrams, field sheets.
   ===================================================================== */
const P = {
  u:  { sym: { s: 'u' }, name: 'UP QUARK', short: 'UP', fam: 'q', q: '+2/3 e', m: '≈ 2.2 MeV/c²', spin: '1/2', gen: 'I', pat: [3, 0.10, 0.6] },
  d:  { sym: { s: 'd' }, name: 'DOWN QUARK', short: 'DOWN', fam: 'q', q: '−1/3 e', m: '≈ 4.7 MeV/c²', spin: '1/2', gen: 'I', pat: [4, 0.09, -0.5] },
  c:  { sym: { s: 'c' }, name: 'CHARM QUARK', short: 'CHARM', fam: 'q', q: '+2/3 e', m: '≈ 1.27 GeV/c²', spin: '1/2', gen: 'II', pat: [5, 0.08, 0.8] },
  s:  { sym: { s: 's' }, name: 'STRANGE QUARK', short: 'STRANGE', fam: 'q', q: '−1/3 e', m: '≈ 93 MeV/c²', spin: '1/2', gen: 'II', pat: [6, 0.075, -0.7] },
  t:  { sym: { s: 't' }, name: 'TOP QUARK', short: 'TOP', fam: 'q', q: '+2/3 e', m: '≈ 173 GeV/c²', spin: '1/2', gen: 'III', pat: [7, 0.07, 1.0] },
  b:  { sym: { s: 'b' }, name: 'BOTTOM QUARK', short: 'BOTTOM', fam: 'q', q: '−1/3 e', m: '≈ 4.18 GeV/c²', spin: '1/2', gen: 'III', pat: [8, 0.065, -0.9] },
  e:  { sym: { s: 'e', sup: '−' }, name: 'ELECTRON', short: 'ELECTRON', fam: 'l', q: '−1 e', m: '≈ 0.511 MeV/c²', spin: '1/2', gen: 'I', pat: [2, 0.1, 0.5] },
  ve: { sym: { s: 'ν', sub: 'e' }, name: 'ELECTRON NEUTRINO', short: 'e NEUTRINO', fam: 'l', q: '0', m: '< 1 eV/c²', spin: '1/2', gen: 'I', pat: [3, 0.05, 0.3], ghost: 1 },
  mu: { sym: { s: 'μ', sup: '−' }, name: 'MUON', short: 'MUON', fam: 'l', q: '−1 e', m: '≈ 105.7 MeV/c²', spin: '1/2', gen: 'II', pat: [4, 0.09, -0.6] },
  vm: { sym: { s: 'ν', sub: 'μ' }, name: 'MUON NEUTRINO', short: 'μ NEUTRINO', fam: 'l', q: '0', m: '< 1 eV/c²', spin: '1/2', gen: 'II', pat: [5, 0.05, -0.3], ghost: 1 },
  ta: { sym: { s: 'τ', sup: '−' }, name: 'TAU', short: 'TAU', fam: 'l', q: '−1 e', m: '≈ 1.777 GeV/c²', spin: '1/2', gen: 'III', pat: [6, 0.08, 0.7] },
  vt: { sym: { s: 'ν', sub: 'τ' }, name: 'TAU NEUTRINO', short: 'τ NEUTRINO', fam: 'l', q: '0', m: '< 1 eV/c²', spin: '1/2', gen: 'III', pat: [7, 0.05, 0.4], ghost: 1 },
  ga: { sym: { s: 'γ' }, name: 'PHOTON', short: 'PHOTON', fam: 'b', q: '0', m: '0', spin: '1', force: 'ELECTROMAGNETIC', pat: [2, 0.12, 0.9] },
  gl: { sym: { s: 'g' }, name: 'GLUON', short: 'GLUON', fam: 'b', q: '0', m: '0', spin: '1', force: 'STRONG', pat: [3, 0.12, -0.8] },
  W:  { sym: { s: 'W', sup: '±' }, name: 'W BOSONS', short: 'W BOSONS', fam: 'b', q: '±1 e', m: '≈ 80.4 GeV/c²', spin: '1', force: 'WEAK', pat: [4, 0.1, 0.6] },
  Z:  { sym: { s: 'Z', sup: '0' }, name: 'Z BOSON', short: 'Z BOSON', fam: 'b', q: '0', m: '≈ 91.2 GeV/c²', spin: '1', force: 'WEAK', pat: [5, 0.1, -0.6] },
  Wp: { sym: { s: 'W', sup: '+' }, name: 'W⁺ BOSON', short: 'W+', fam: 'b', q: '+1 e', m: '≈ 80.4 GeV/c²', spin: '1', force: 'WEAK', pat: [4, 0.1, 0.6] },
  Wm: { sym: { s: 'W', sup: '−' }, name: 'W⁻ BOSON', short: 'W−', fam: 'b', q: '−1 e', m: '≈ 80.4 GeV/c²', spin: '1', force: 'WEAK', pat: [4, 0.1, -0.6] },
  H:  { sym: { s: 'H' }, name: 'HIGGS BOSON', short: 'HIGGS', fam: 'h', q: '0', m: '≈ 125 GeV/c²', spin: '0', pat: [6, 0.08, 0.5] },
};
const FAMRGB = { q: [255, 205, 120], l: [140, 230, 255], b: [200, 160, 255], h: [240, 245, 235] };
const KEYS = ['u', 'd', 'c', 's', 't', 'b', 'e', 've', 'mu', 'vm', 'ta', 'vt', 'ga', 'gl', 'W', 'Z', 'H'];

/* ---------- chart layout (world units) ---------- */
const FW = 2.0, FH = 0.9, CX = 1.12, PITCH = 1.04, GAP = 0.62;
const CHART = {}; (() => { let y = 0; const rows = [['u', 'd'], ['c', 's'], ['t', 'b'], null, ['e', 've'], ['mu', 'vm'], ['ta', 'vt'], null, ['ga', 'gl'], ['W', 'Z'], null, ['H']];
  for (const r of rows) { if (!r) { y -= GAP; continue; } if (r.length === 2) { CHART[r[0]] = [-CX, y]; CHART[r[1]] = [CX, y]; } else CHART[r[0]] = [0, y]; y -= PITCH; }
  const top = 0 + FH / 2, bot = CHART.H[1] - FH / 2, mid = (top + bot) / 2; for (const k in CHART) CHART[k][1] -= mid; CHART.__h = top - bot; })();
const SECT = { q: (CHART.u[1] + CHART.t[1]) / 2, l: (CHART.e[1] + CHART.ta[1]) / 2, b: (CHART.ga[1] + CHART.W[1]) / 2, h: CHART.H[1] };

function rrect3(cx, cy, cz, w, h, yaw, r = 0.12, n = 5) { // rounded rectangle in a vertical plane rotated by yaw
  const pts = [], cs = Math.cos(yaw), sn = Math.sin(yaw); const corners = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI], [w / 2 - r, -h / 2 + r, 1.5 * Math.PI]];
  for (const [x0, y0, a0] of corners) for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2, lx = x0 + r * Math.cos(a), ly = y0 + r * Math.sin(a); pts.push([cx + lx * cs, cy + ly, cz + lx * sn]); }
  return pts; }
/* draw one chart frame. o: {a, fill, content, glow, detail, yaw, key} */
function chartFrame(key, pos, o, L, t) {
  const pa = P[key], cols = FAMC[pa.fam]; const [x, y] = pos; const z = o.z || 0; const a = o.a; if (a <= 0.003) return;
  const yaw = o.yaw || 0; const pts = rrect3(x, y, z, FW, FH, yaw, 0.12);
  L.poly3(pts, a * (0.55 + 0.45 * (o.glow || 0)), cols[0], true);
  const inner = rrect3(x, y, z, FW - 0.1, FH - 0.1, yaw, 0.08, 3); L.poly3(inner, a * 0.18, cols[2], true);
  // a small standing-wave signature unique to each field
  const [m, amp, tw] = pa.pat; const sig = []; for (let i = 0; i <= 40; i++) { const u = i / 40, lx = (u - 0.5) * (FW - 0.3), ly = -FH * 0.32 + Math.sin(u * Math.PI * m + t * 1.4 * tw) * amp * 0.7 * Math.sin(u * Math.PI);
    sig.push([x + lx * Math.cos(yaw), y + ly, z + lx * Math.sin(yaw)]); }
  L.poly3(sig, a * 0.4 * (o.content ?? 1), cols[1]);
  if (o.glow > 0.01 && project(x, y, z)) glowPx(PX, PY, FOCAL / PD * 1.1, 0.22 * o.glow * a, cols[0]);
  const ca = (o.content ?? 0) * a * clamp(Math.cos(yaw) * 2 - 0.6);
  if (ca > 0.01 && project(x, y, z)) { const sc = FOCAL / PD / S; const cx = PX / S, cy = PY / S; const fc = FAMRGB[pa.fam];
    fml(cx - (o.detail ? 0.5 : 0) * sc, cy - 0.06 * sc, [pa.sym], 0.42 * sc, fc, ca, 10);
    const det = o.detail || 0;
    if (sc > 60) { label(cx + (det ? 0.32 * sc : 0), cy + 0.32 * sc - det * 0.6 * sc, pa.short, ca * 0.9, [240, 240, 250], 0.105 * sc, 0.2, 400);
      if (det > 0.01) { label(cx + 0.32 * sc, cy - 0.08 * sc, pa.m, ca * det * 0.85, fc, 0.085 * sc, 0.08, 300); label(cx + 0.32 * sc, cy + 0.07 * sc, 'CHARGE ' + pa.q, ca * det * 0.75, [230, 230, 240], 0.075 * sc, 0.1, 300); label(cx + 0.32 * sc, cy + 0.2 * sc, 'SPIN ' + pa.spin, ca * det * 0.65, [230, 230, 240], 0.075 * sc, 0.1, 300); } }
  }
}
/* the full chart: f(key) → frame options; also optional scaffold lines */
function drawChart(t, f) { const L = new Lines(); for (const k of KEYS) { const o = f(k); if (o && o.a > 0.003) chartFrame(k, [CHART[k][0] + (o.dx || 0), CHART[k][1] + (o.dy || 0)], o, L, t); } L.flush(GLW); }

/* ---------- particle close-up card (logical coords) ---------- */
function fieldRosette(cx, cy, R, pa, t, a, key3, L) { // symbolic field excitation: concentric modulated rings + a radiating packet
  const [m, amp, tw] = pa.pat; const cols = key3;
  for (let k = 0; k < 7; k++) { const pts = [], r0 = R * (0.3 + 0.1 * k), ph = k * 0.7 + t * 0.5 * tw;
    for (let i = 0; i <= 140; i++) { const th = i / 140 * TAU; const r = r0 * (1 + amp * Math.sin(m * th + ph) * (0.6 + 0.4 * Math.sin(t * 0.8 + k))); pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]); }
    L.polyL(pts, a * (0.5 - k * 0.05), cols[k % 3], false); }
  // radial excitation lines
  for (let i = 0; i < m * 6; i++) { const th = i / (m * 6) * TAU + t * 0.05 * tw; const r1 = R * 0.26, r2 = R * (0.9 + 0.08 * Math.sin(t * 1.3 + i)); L.addL(cx + r1 * Math.cos(th), cy + r1 * Math.sin(th), cx + r2 * Math.cos(th), cy + r2 * Math.sin(th), a * 0.12, cols[1]); }
  // the packet: an outgoing ripple
  const ph = frac(t * 0.35); const rr = R * (0.25 + 0.75 * ph); const pts = []; for (let i = 0; i <= 120; i++) { const th = i / 120 * TAU; pts.push([cx + rr * Math.cos(th), cy + rr * Math.sin(th)]); } L.polyL(pts, a * 0.4 * (1 - ph), 'white');
  glowL(cx, cy, R * 0.75, a * 0.32, cols[0]); glowL(cx, cy, R * 0.28, a * 0.35, 'white');
}
function frame2(cx, cy, w, h, a, key, L, r = 26) { const pts = []; const cs = [[w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, 0.5], [-w / 2 + r, -h / 2 + r, 1], [w / 2 - r, -h / 2 + r, 1.5]];
  for (const [x0, y0, a0] of cs) for (let i = 0; i <= 6; i++) { const an = (a0 + i / 12) * Math.PI; pts.push([cx + x0 + r * Math.cos(an), cy + y0 + r * Math.sin(an)]); } L.polyL(pts, a, key, true); }
/* o: {cx, cy, sc, a, props, t0} */
function card(t, key, o) { const a = o.a; if (a <= 0.003) return; const pa = P[key]; const cols = FAMC[pa.fam]; const sc = o.sc ?? 1, cx = o.cx ?? 540, cy = o.cy ?? 760;
  const L = new Lines(); const R = 330 * sc;
  frame2(cx, cy + 40 * sc, 840 * sc, 1000 * sc, a * 0.6, cols[0], L, 34 * sc); frame2(cx, cy + 40 * sc, 812 * sc, 972 * sc, a * 0.2, cols[2], L, 28 * sc);
  // corner ticks
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const x = cx + sx * 446 * sc, y = cy + 40 * sc + sy * 526 * sc; L.addL(x, y, x - sx * 60 * sc, y, a * 0.6, 'white'); L.addL(x, y, x, y - sy * 60 * sc, a * 0.6, 'white'); }
  if (o.cloud) { L.flush(GLW); electronCloud(cx, cy - 40 * sc, R * 0.95, t, a, o.cloud); } else fieldRosette(cx, cy - 40 * sc, R, pa, t, a * (pa.ghost ? 0.55 : 1), cols, L);
  L.flush(GLW);
  const fc = FAMRGB[pa.fam];
  fml(cx, cy - 40 * sc, [pa.sym], 250 * sc, [255, 255, 255], a, 30);
  const pr = o.props ?? 1;
  label(cx, cy + 370 * sc, pa.name, a, fc, 54 * sc, 0.22, 300);
  label(cx, cy + 440 * sc, 'CHARGE ' + pa.q + '   ·   SPIN ' + pa.spin, a * clamp(pr * 2), [235, 235, 245], 30 * sc, 0.14, 300);
  label(cx, cy + 486 * sc, 'MASS ' + pa.m + (pa.gen ? '   ·   GENERATION ' + pa.gen : pa.force ? '   ·   ' + pa.force : ''), a * clamp(pr * 2 - 1), [235, 235, 245], 30 * sc, 0.14, 300);
}

/* ---------- hadrons: three valence quarks bound by gluon fields ---------- */
const CC = ['crimson', 'gold', 'violet']; // symbolic colour charges
function hadron(t, cx, cy, r, qs, a, o = {}) { if (a <= 0.003) return; const L = new Lines(); const n = qs.length; const pos = [];
  const rot = (o.rot ?? 0.25) * t; const swap = Math.floor(t * 1.2);
  for (let i = 0; i < n; i++) { const th = rot + i / n * TAU - Math.PI / 2 + (n === 2 ? Math.PI / 2 : 0); const jit = 0.06 * r * Math.sin(t * 3.1 + i * 2);
    pos.push([cx + (r + jit) * Math.cos(th) * (o.sx ?? 1), cy + (r + jit) * Math.sin(th)]); }
  // gluon field: springs between every pair + inner haze
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const [x1, y1] = pos[i], [x2, y2] = pos[j]; const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len; const pts = [];
    for (let k = 0; k <= 60; k++) { const u = k / 60, w = Math.sin(u * TAU * (len / 26) - t * 6 + i) * 9 * Math.sin(Math.PI * u) * (r / 120); pts.push([x1 + dx * u + nx * w, y1 + dy * u + ny * w]); }
    L.polyL(pts, a * 0.55, 'hgold'); }
  for (let k = 0; k < 6; k++) { const th = t * 0.7 + k; glowL(cx + Math.cos(th) * r * 0.35, cy + Math.sin(th * 1.3) * r * 0.35, r * 0.9, a * 0.07, 'amber'); }
  L.flush(FINE);
  for (let i = 0; i < n; i++) { const ck = CC[(((i + swap) % 3) + 3) % 3]; const [x, y] = pos[i]; glowL(x, y, r * 0.62, a * 0.5, ck); glowL(x, y, r * 0.22, a * 0.75, 'white'); }
  for (let i = 0; i < n; i++) { const [x, y] = pos[i]; const tk = typeof qs[i] === 'string' ? { s: qs[i] } : qs[i]; fml(x, y + 2, [tk], r * 0.5, [255, 255, 255], a, 14); }
  return pos;
}

/* ---------- Feynman-diagram lines (logical coords) ---------- */
function fLine(L, x1, y1, x2, y2, type, prog, a, key, t = 0) { if (prog <= 0 || a <= 0.003) return; const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len; const pts = []; const N = Math.max(8, Math.round(len / 3));
  for (let k = 0; k <= N * prog; k++) { const u = k / N; let ox = 0, oy = 0;
    if (type === 'wave') { const w = Math.sin(u * len / 14 * Math.PI - t * 5) * 9; ox = nx * w; oy = ny * w; }
    else if (type === 'curl') { const ph = u * len / 16 * TAU - t * 4; ox = nx * 10 * Math.sin(ph) + dx / len * 9 * Math.cos(ph); oy = ny * 10 * Math.sin(ph) + dy / len * 9 * Math.cos(ph); }
    pts.push([x1 + dx * u + ox, y1 + dy * u + oy]); }
  if (type === 'dash') { for (let i = 0; i + 1 < pts.length; i += 2) L.polyL([pts[i], pts[i + 1]], a, key); } else L.polyL(pts, a, key);
  if (type === 'f' && prog > 0.55) { const mx = x1 + dx * 0.55, my = y1 + dy * 0.55, ux = dx / len, uy = dy / len; L.addL(mx, my, mx - ux * 18 + nx * 10, my - uy * 18 + ny * 10, a, key); L.addL(mx, my, mx - ux * 18 - nx * 10, my - uy * 18 - ny * 10, a, key); }
}
function vertex(x, y, a, key = 'white') { glowL(x, y, 40, a * 0.5, key); dotL(x, y, 9, a, 'white'); }

/* ---------- quantum field sheet (3D wireframe heightmap) ---------- */
function fieldSheet(L, t, y0, key, a, packets, o = {}) { if (a <= 0.003) return; const N = o.n ?? 34, ext = o.ext ?? 7, z0 = o.z0 ?? 0;
  const hgt = (x, z) => { let h = 0.035 * Math.sin(x * 1.7 + t * 0.9 + y0 * 3) * Math.sin(z * 1.3 - t * 0.7) + 0.02 * Math.sin(x * 3.1 - z * 2.3 + t * 1.6);
    for (const p of packets) { if (p.a <= 0) continue; const dx = x - p.x, dz = z - p.z, r2 = dx * dx + dz * dz; h += p.a * p.h * Math.exp(-r2 / (p.w * p.w)) * Math.cos(Math.sqrt(r2) * p.k - t * 4); } return h; };
  for (let i = 0; i <= N; i++) { const pts = [], pts2 = []; const u = -ext + 2 * ext * i / N;
    for (let j = 0; j <= N; j++) { const v = -ext + 2 * ext * j / N; pts.push([u, y0 + hgt(u, v + z0), v + z0]); pts2.push([v, y0 + hgt(v, u + z0), u + z0]); }
    const fa = j => a * (0.55 - 0.45 * Math.abs(-ext + 2 * ext * j / N) / ext); L.poly3(pts, fa, key); L.poly3(pts2, a * (0.55 - 0.45 * Math.abs(u) / ext), key); }
}
