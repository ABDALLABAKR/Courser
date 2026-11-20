'use strict';
/* =====================================================================
   Orchestration: background moods, the four acts, captions, finishing
   ===================================================================== */
function bgWeights(t) {
  const w = { intro: 0, quark: 0, lepton: 0, boson: 0, higgs: 0, dark: 0 };
  const xf = (k1, k2, t0, d) => { const k = ss(t0, t0 + d, t); w[k1] += 1 - k; w[k2] += k; };
  if (t < A(14)) w.dark = 1;
  else if (t < A(44.6)) xf('dark', 'intro', A(14), 4);
  else if (t < A(56.0)) { const c = (t - A(44.6)) / 11.4; w.intro = 1 - 0.6 * Math.sin(c * Math.PI); w.boson = 0.35 * Math.sin(c * Math.PI) * (1 - c); w.quark = 0.6 * c * c; }
  else if (t < B(-1.5)) xf('intro', 'quark', A(56.0), 1.8);
  else if (t < G(-1.5)) xf('quark', 'lepton', B(-1.5), 3);
  else if (t < Hg(-2.0)) xf('lepton', 'boson', G(-1.5), 3);
  else if (t < Hg(52)) xf('boson', 'higgs', Hg(-2.0), 3.5);
  else if (t < Hg(90)) { const k = ss(Hg(52), Hg(57), t); w.higgs = 1 - k; w.intro = k; }
  else xf('intro', 'dark', Hg(90), 8);
  return w;
}
function bgFade(t) { if (t < A(14)) return 0.5 * (1 - ss(A(3.6), A(4.6), t));
  return 0.62 * ss(A(13.8), A(16), t) * (1 - 0.35 * win(t, Hg(52), Hg(90), 3, 3)) * (1 - 0.7 * ss(Hg(97), Hg(106), t)); }


function renderFrame(t) {
  TXT = [];
  background(t, bgWeights(t), bgFade(t));
  C.setTransform(1, 0, 0, 1, 0, 0); C.globalCompositeOperation = 'source-over'; C.globalAlpha = 1; C.clearRect(0, 0, W, H); C.globalCompositeOperation = 'lighter';
  if (t < B(0)) part1(t);
  if (t > A(150) && t < G(0.5)) part2(t);
  if (t > B(124) && t < Hg(0.5)) part3(t);
  if (t > G(99)) part4(t);
  // bloom + composite
  bAc.globalCompositeOperation = 'copy'; bAc.filter = 'blur(5px)'; bAc.drawImage(fg, 0, 0, bA.width, bA.height); bAc.filter = 'none';
  bBc.globalCompositeOperation = 'copy'; bBc.filter = 'blur(5px)'; bBc.drawImage(bA, 0, 0, bB.width, bB.height); bBc.filter = 'none';
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(fg, 0, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.45; ctx.drawImage(bA, 0, 0, W, H); ctx.globalAlpha = 0.38; ctx.drawImage(bB, 0, 0, W, H); ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.55); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  ctx.shadowColor = 'rgba(0,0,0,0.65)'; ctx.shadowBlur = 18 * S; for (const f of TXT) f(); ctx.shadowBlur = 0; ctx.shadowColor = 'rgba(0,0,0,0)';
  for (const c of CAPS) if (t > c.t0 - 0.1 && t < c.t1 + 0.1) caption(t, c);
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
  try { await Promise.race([Promise.all(faces.map(f => document.fonts.load(f, 'uνμτγ'))), new Promise(r => setTimeout(r, 5000))]); } catch (e) {}
  window.__fontsOk = document.fonts.check('300 40px Inter') && document.fonts.check('italic 400 40px "EB Garamond"');
  NOISE = makeNoise(); initPart1(); if (typeof initPart2 === 'function') initPart2(); if (typeof initPart3 === 'function') initPart3(); if (typeof initPart4 === 'function') initPart4();
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
