'use strict';
/* =====================================================================
   THE COMPLEX PLANE WORLD — shared by scenes 2, 3 and 5.
   World coordinates: X = Re(s) = σ,  Y = Im(s)/10 = t/10,  Z = relief height.
   ζ values come from rh-data.js (mpmath): log10|ζ| and arg ζ on
   σ ∈ [−2, 3.5] (step 0.05), t ∈ [0, 50] (step 0.1).
   ===================================================================== */
const LD = RHD.LAND, NSg = LD.sig[2], NTt = LD.t[2];
const ZER = RHD.ZEROS; // imaginary parts of the first 400 nontrivial zeros
const TY = 0.1; // world Y per unit of t
// cyclic phase palette (brief colours): gold → emerald → turquoise → sapphire → violet → crimson
const PHC = [[255, 200, 90], [40, 215, 140], [50, 225, 210], [55, 115, 255], [150, 90, 255], [235, 45, 70]];
function phaseRGB(arg) { const f = ((arg + Math.PI) / TAU) * 6, i = Math.floor(f) % 6, k = f - Math.floor(f); return mixc(PHC[i], PHC[(i + 1) % 6], k * k * (3 - 2 * k)); }
const NH = 12; for (let i = 0; i < NH; i++) COL['h' + i] = phaseRGB(-Math.PI + (i + 0.5) / NH * TAU);
const hueKey = arg => 'h' + (Math.floor(((arg + Math.PI) / TAU) * NH) % NH + NH) % NH;

/* ---------- domain-coloured image of ζ (built once, bilinear in the complex values) ---------- */
let DOMI = null;
function buildDomain() {
  const sc = 4, w = (NSg - 1) * sc + 1, h = (NTt - 1) * sc + 1; const [c, g] = mk(); c.width = w; c.height = h; const id = g.createImageData(w, h), d = id.data;
  const RE = new Float32Array(NSg * NTt), IM = new Float32Array(NSg * NTt);
  for (let j = 0; j < NTt; j++) for (let i = 0; i < NSg; i++) { const m = Math.pow(10, LD.mag[j][i]), a = LD.arg[j][i]; RE[j * NSg + i] = m * Math.cos(a); IM[j * NSg + i] = m * Math.sin(a); }
  for (let y = 0; y < h; y++) { const jj = (h - 1 - y) / sc, j0 = Math.min(NTt - 2, Math.floor(jj)), kj = jj - j0;
    for (let x = 0; x < w; x++) { const ii = x / sc, i0 = Math.min(NSg - 2, Math.floor(ii)), ki = ii - i0;
      const bl = (A) => lerp(lerp(A[j0 * NSg + i0], A[j0 * NSg + i0 + 1], ki), lerp(A[(j0 + 1) * NSg + i0], A[(j0 + 1) * NSg + i0 + 1], ki), kj);
      const re = bl(RE), im = bl(IM), mag = Math.hypot(re, im), arg = Math.atan2(im, re), lm = Math.log10(mag + 1e-9);
      const col = phaseRGB(arg); const dark = 1 - Math.exp(-mag * 2.2); const cont = 0.78 + 0.22 * Math.pow(frac(lm * 3), 0.6);
      const k = (0.12 + 0.5 * dark) * cont, o = (y * w + x) * 4; d[o] = col[0] * k; d[o + 1] = col[1] * k; d[o + 2] = col[2] * k; d[o + 3] = 255; } }
  g.putImageData(id, 0, 0); DOMI = c;
}
function drawDomain(a, sigFrom) { // only valid for a camera facing the plane (yaw = pitch = 0)
  if (a <= 0.003) return; if (!DOMI) buildDomain();
  const s0 = LD.sig[0], s1 = s0 + LD.sig[1] * (NSg - 1), t1 = LD.t[1] * (NTt - 1) * TY;
  project(s0, t1, 0); const x0 = PX, y0 = PY; project(s1, 0, 0); const x1 = PX, y1 = PY;
  const cut = clamp((sigFrom - s0) / (s1 - s0)); const sx = cut * DOMI.width, dx = lerp(x0, x1, cut);
  C.save(); C.globalCompositeOperation = 'lighter'; C.globalAlpha = a; C.imageSmoothingQuality = 'high';
  C.drawImage(DOMI, sx, 0, DOMI.width - sx, DOMI.height, dx, y0, x1 - dx, y1 - y0);
  // soft reveal edge
  if (cut > 0.001) { const gr = C.createLinearGradient(dx - 40 * S, 0, dx + 6 * S, 0); gr.addColorStop(0, 'rgba(255,220,150,0)'); gr.addColorStop(1, `rgba(255,220,150,${(0.22 * a).toFixed(3)})`); C.fillStyle = gr; C.fillRect(dx - 40 * S, y0, 46 * S, y1 - y0); }
  C.restore();
}

/* ---------- |ζ| relief: mesh lines coloured by phase, with moving phase streams ---------- */
const reliefZ = m => 0.42 * clamp(m + 1.3, 0, 3.1);
function drawRelief(u, a, hk, opt = {}) {
  if (a <= 0.003) return; const si = opt.si ?? 2, tj = opt.tj ?? 3; const Ls = new Lines(), St = new Lines();
  const ni = Math.floor((NSg - 1) / si) + 1, nj = Math.floor((NTt - 1) / tj) + 1; const PXs = new Float32Array(ni * nj), PYs = new Float32Array(ni * nj), PDs = new Float32Array(ni * nj);
  for (let J = 0; J < nj; J++) for (let I = 0; I < ni; I++) { const i = I * si, j = J * tj; const m = LD.mag[j][i];
    const ok = project(LD.sig[0] + i * LD.sig[1], j * LD.t[1] * TY, reliefZ(m) * hk); const o = J * ni + I; PXs[o] = ok ? PX : NaN; PYs[o] = PY; PDs[o] = PD; }
  const fogD = opt.fog ?? 9;
  const seg = (o1, o2, i, j) => { if (isNaN(PXs[o1]) || isNaN(PXs[o2])) return; const arg = LD.arg[j][i]; const f = Math.exp(-PDs[o1] / fogD);
    Ls.add(PXs[o1], PYs[o1], PXs[o2], PYs[o2], a * f * 0.55, hueKey(arg));
    const b = frac((arg + Math.PI) / TAU * 2 - 0.45 * u); if (b < 0.07) St.add(PXs[o1], PYs[o1], PXs[o2], PYs[o2], a * f * (1 - b / 0.07), (Math.floor((arg + Math.PI) / Math.PI) % 2) ? 'gold' : 'turq'); };
  for (let J = 0; J < nj; J++) for (let I = 0; I < ni; I++) { const o = J * ni + I; if (I < ni - 1) seg(o, o + 1, I * si, J * tj); if (J < nj - 1 && I % 2 === 0) seg(o, o + ni, I * si, J * tj); }
  Ls.flush(FINE); St.flush(GLW);
}

/* ---------- the plane itself: grid, axes, strip, line, zeros ---------- */
function planeView() { // visible world rectangle (approximate, for culling)
  return { yLo: cam.ty - cam.dist * 1.2 - 2, yHi: cam.ty + cam.dist * 1.2 + 2 + (cam.sp < -0.3 ? 400 : 0) };
}
function drawPlane(u, P) {
  const v = planeView(); const Ls = new Lines(), Lb = new Lines();
  const yTop = Math.min(P.lineTop ?? 1e9, v.yHi);
  if (P.grid > 0.003) {
    for (let s = -8; s <= 4; s++) if (s !== 0) Ls.add3([s, Math.max(0, v.yLo), 0], [s, Math.max(0, yTop), 0], P.grid * 0.16, 'silver');
    for (let k = Math.max(1, Math.floor(v.yLo)); k <= Math.min(yTop, 900); k++) Ls.add3([-8, k, 0], [4, k, 0], P.grid * (k % 5 === 0 ? 0.22 : 0.12), 'silver');
  }
  if (P.axes > 0.003) {
    Lb.add3([-8.5, 0, 0], [4.5, 0, 0], P.axes * 0.75, 'pearl'); Lb.add3([0, Math.max(-0.4, v.yLo), 0], [0, Math.max(0, yTop), 0], P.axes * 0.6, 'pearl');
  }
  if (P.strip > 0.003) { // critical strip 0 < σ < 1 : translucent violet
    const yb = Math.max(0, v.yLo), yt = Math.max(yb, yTop); const pts = [[0, yb], [1, yb], [1, yt], [0, yt]].map(p => { project(p[0], p[1], 0); return [PX, PY]; });
    C.globalCompositeOperation = 'lighter'; C.globalAlpha = 1; const gr = C.createLinearGradient(pts[0][0], 0, pts[1][0], 0);
    gr.addColorStop(0, rgba(COL.violet, 0.2 * P.strip)); gr.addColorStop(0.5, rgba([110, 60, 220], 0.09 * P.strip)); gr.addColorStop(1, rgba(COL.violet, 0.2 * P.strip));
    C.fillStyle = gr; C.beginPath(); C.moveTo(...pts[0]); for (let i = 1; i < 4; i++) C.lineTo(...pts[i]); C.closePath(); C.fill();
    Lb.add3([0, yb, 0], [0, yt, 0], P.strip * 0.5, 'violet'); Lb.add3([1, yb, 0], [1, yt, 0], P.strip * 0.5, 'violet');
  }
  Ls.flush(FINE); Lb.flush(GLW);
  if (P.line > 0.003) { const Lg = new Lines(); const y0 = P.lineFrom ?? 0, y1 = Math.max(y0, P.lineGrow !== undefined ? lerp(y0, yTop, P.lineGrow) : yTop);
    const n = 40; for (let i = 0; i < n; i++) { const ya = lerp(y0, y1, Math.pow(i / n, cam.sp < -0.3 ? 3 : 1)), yb = lerp(y0, y1, Math.pow((i + 1) / n, cam.sp < -0.3 ? 3 : 1)); Lg.add3([0.5, ya, 0], [0.5, yb, 0], P.line, 'gold'); }
    Lg.flush(BOLD, 1); }
  if (P.zeros > 0.003) {
    for (let k = 0; k < ZER.length; k++) { const y = ZER[k] * TY; if (y < v.yLo - 1 || y > Math.min(v.yHi, P.zTop ?? 1e9)) continue;
      const ak = P.zeros * (P.zA ? P.zA(k) : 1); if (ak <= 0.003 || !project(0.5, y, 0)) continue; const r = (P.zR ?? 0.06) * FOCAL / PD / S;
      glowL(PX / S, PY / S, r * 5, 0.42 * ak, 'gold'); dotL(PX / S, PY / S, Math.max(2.2, r), ak, 'hgold'); }
  }
}
// world → logical screen
function wl(x, y, z = 0) { if (!project(x, y, z)) return null; return [PX / S, PY / S]; }
