'use strict';
/* =====================================================================
   Orchestration: colour moods, the five scenes, captions, finishing.
   Everything below works in narration time u = t − VO0.
   ===================================================================== */
const MOODS = [[-99, 'dark'], [19.6, 'night'], [33.2, 'sapph'], [58.2, 'violet'], [81.6, 'emer'], [93.6, 'night'], [111.8, 'dark'], [122.0, 'night'], [130.5, 'dark']];
function bgWeights(u) {
  const w = { night: 0, sapph: 0, violet: 0, emer: 0, dark: 0 };
  let i = 0; while (i < MOODS.length - 1 && u >= MOODS[i + 1][0]) i++;
  const k = i > 0 ? ss(MOODS[i][0], MOODS[i][0] + 2.2, u) : 1; w[MOODS[i][1]] += k; if (i > 0) w[MOODS[i - 1][1]] += 1 - k; return w;
}
function bgFade(u) { return chan([[0, 0], [6, 0.06], [12, 0.22], [20, 0.3], [22.5, 0.5], [110, 0.5], [115.5, 0.16], [122, 0.2], [125, 0.42], [130, 0.42], [136, 0.14], [142, 0.04]], u, sm5); }

function renderFrame(t) {
  const u = t - VO0; TXT = [];
  background(t, bgWeights(u), bgFade(u));
  C.setTransform(1, 0, 0, 1, 0, 0); C.globalCompositeOperation = 'source-over'; C.globalAlpha = 1; C.clearRect(0, 0, W, H); C.globalCompositeOperation = 'lighter';
  if (u < 40) part1(u);
  if (u > 33 && u < 62) part2(u);
  sceneZeros(u); sceneRhythm(u); sceneMystery(u);
  C.setTransform(1, 0, 0, 1, 0, 0);
  // bloom + composite
  bAc.globalCompositeOperation = 'copy'; bAc.filter = 'blur(5px)'; bAc.drawImage(fg, 0, 0, bA.width, bA.height); bAc.filter = 'none';
  bBc.globalCompositeOperation = 'copy'; bBc.filter = 'blur(5px)'; bBc.drawImage(bA, 0, 0, bB.width, bB.height); bBc.filter = 'none';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(fg, 0, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45; ctx.drawImage(bA, 0, 0, W, H); ctx.globalAlpha = 0.38; ctx.drawImage(bB, 0, 0, W, H); ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.55); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 18 * S; for (const f of TXT) f(); ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  for (const c of CAPS) if (u > c.t0 - 0.1 && u < c.t1 + 0.1) caption(u, c);
  const fi = Math.floor(t * 24); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.014; const ns = 256 * S * 0.75, R = rng(fi * 7 + 3), ox = -R() * ns, oy = -R() * ns;
  for (let yy = oy; yy < H; yy += ns) for (let xx = ox; xx < W; xx += ns) ctx.drawImage(NOISE, xx, yy, ns, ns);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const blk = Math.max(1 - ss(0, 0.6, t), ss(DURATION - 1.6, DURATION - 0.2, t)); if (blk > 0) { ctx.fillStyle = `rgba(0,0,0,${blk})`; ctx.fillRect(0, 0, W, H); }
}
/* ---------- boot ---------- */
function resize(w, h) {
  W = canvas.width = fg.width = Math.round(w); H = canvas.height = fg.height = Math.round(h); S = W / LW; FOCAL = (W * 0.5) / Math.tan(25 * Math.PI / 180);
  bA.width = Math.max(2, Math.round(W / 4)); bA.height = Math.max(2, Math.round(H / 4)); bB.width = Math.max(2, Math.round(W / 16)); bB.height = Math.max(2, Math.round(H / 16)); bgM.width = 540; bgM.height = 960;
  const sp = Math.max(32, Math.min(128, Math.round(64 * S))); GLOW = {}; for (const k in COL) { GLOW[k] = makeGlow(COL[k], sp); GLOW[k + '_h'] = makeGlow(COL[k], sp, true); }
}
function fitWindow() { const dpr = Math.min(2, devicePixelRatio || 1); let vw = innerWidth, vh = innerHeight, w = vw, h = vw * 16 / 9; if (h > vh) { h = vh; w = vh * 9 / 16; }
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; resize(w * dpr, h * dpr); }
async function boot() {
  const faces = ['200 40px Inter', '300 40px Inter', '400 40px Inter', 'italic 400 40px "EB Garamond"', '400 40px "EB Garamond"'];
  try { await Promise.race([Promise.all(faces.map(f => document.fonts.load(f, 'ζρπσγ'))), new Promise(r => setTimeout(r, 5000))]); } catch (e) {}
  window.__fontsOk = document.fonts.check('300 40px Inter') && document.fonts.check('italic 400 40px "EB Garamond"');
  NOISE = makeNoise(); initPart4();
  if (RENDER) { document.body.classList.add('render'); const w = +params.get('w') || 2160, h = +params.get('h') || Math.round(w * 16 / 9); canvas.style.width = '100%'; canvas.style.height = 'auto'; resize(w, h);
    window.__renderFrame = (t, type = 'image/png', qq) => { renderFrame(t); return canvas.toDataURL(type, qq); }; window.__ready = true; return; }
  fitWindow(); addEventListener('resize', fitWindow);
  const play = document.getElementById('play'), scrub = document.getElementById('scrub'), time = document.getElementById('time'), ui = document.getElementById('ui'), au = document.getElementById('snd');
  scrub.max = DURATION; let playing = false, t = +params.get('t') || 0, last = performance.now(), dragging = false;
  const sync = () => { try { if (Math.abs(au.currentTime - t) > 0.15) au.currentTime = t; } catch (e) {} };
  play.onclick = () => { playing = !playing; if (playing && t >= DURATION) t = 0; play.textContent = playing ? '❚❚' : '▶'; if (playing) { sync(); au.play().catch(() => {}); } else au.pause(); };
  scrub.oninput = () => { t = +scrub.value; dragging = true; sync(); }; scrub.onchange = () => { dragging = false; };
  addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); play.onclick(); } if (e.code === 'ArrowRight') { t = Math.min(DURATION, t + 5); sync(); } if (e.code === 'ArrowLeft') { t = Math.max(0, t - 5); sync(); } });
  let idle; const wake = () => { ui.classList.remove('hidden'); clearTimeout(idle); idle = setTimeout(() => playing && ui.classList.add('hidden'), 2200); };
  addEventListener('mousemove', wake); addEventListener('touchstart', wake); wake();
  const tick = now => { const dt = Math.min(0.1, (now - last) / 1000); last = now;
    if (playing && !dragging) { t = au.duration && !au.paused ? au.currentTime : t + dt; if (t >= DURATION) { t = DURATION; playing = false; play.textContent = '▶'; } }
    renderFrame(t); scrub.value = t; time.textContent = `${t.toFixed(1).padStart(5, '0')} / ${DURATION.toFixed(1)}`; requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}
boot();
