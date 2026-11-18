#!/usr/bin/env node
/*
 * Frame-exact renderer for "The Illusion of Free Will".
 * Drives index.html in headless Chromium (Playwright), captures every frame
 * as lossless PNG and pipes them, in order, into ffmpeg (H.264, yuv420p).
 *
 *   node render.cjs [--width 3840] [--fps 30] [--workers 3] [--crf 14] [--out electron-4k.mp4]
 */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = arg('page', 'index.html'), AUDIO = arg('audio', null);
const WIDTH = +arg('width', 3840), HEIGHT = +arg('height', Math.round(WIDTH * 9 / 16));
const START = +arg('start', 0), END_S = arg('end', null);
const FPS = +arg('fps', 30), WORKERS = +arg('workers', 3), CRF = arg('crf', '14');
let DURATION = 40, FRAMES = Math.round(DURATION * FPS);
const OUT = path.resolve(arg('out', `freewill-${WIDTH >= 3840 ? "4k" : HEIGHT + "p"}.mp4`));
const URL = 'file://' + path.join(__dirname, PAGE) + `?render&w=${WIDTH}&h=${HEIGHT}`;

(async () => {
  const browser = await chromium.launch();
  const pages = await Promise.all(Array.from({ length: WORKERS }, async () => {
    const p = await browser.newPage();
    p.on('pageerror', e => console.error('page error:', e.message));
    await p.goto(URL); await p.waitForFunction('window.__ready === true', null, { timeout: 120000 });
    return p;
  }));
  DURATION = await pages[0].evaluate(() => window.__DURATION || 30); FRAMES = Math.round((END_S ? +END_S : DURATION) * FPS);

  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    ...(AUDIO ? ['-i', path.resolve(AUDIO), '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF, '-tune', 'film',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart', OUT], { stdio: ['pipe', 'inherit', 'inherit'] });

  // each worker renders frames f ≡ k (mod WORKERS); the writer consumes them in order
  const slots = new Array(FRAMES);
  const ready = Array.from({ length: FRAMES }, () => { let r; const pr = new Promise(res => (r = res)); return { pr, r }; });
  const t0 = Date.now();
  let written = START;
  pages.forEach(async (p, k) => {
    for (let f = START + k; f < FRAMES; f += WORKERS) {
      while (f - written > WORKERS * 6) await new Promise(r => setTimeout(r, 20)); // bound memory
      const d = await p.evaluate(t => window.__renderFrame(t), f / FPS);
      slots[f] = Buffer.from(d.slice(d.indexOf(',') + 1), 'base64'); ready[f].r();
    }
  });
  for (let f = START; f < FRAMES; f++) {
    await ready[f].pr;
    if (!ff.stdin.write(slots[f])) await new Promise(r => ff.stdin.once('drain', r));
    slots[f] = null; written = f + 1;
    if (f % FPS === 0 || f === FRAMES - 1) {
      const el = (Date.now() - t0) / 1000, eta = el / (f + 1) * (FRAMES - f - 1);
      process.stdout.write(`frame ${f + 1}/${FRAMES}  ${el.toFixed(0)}s elapsed  ~${eta.toFixed(0)}s left\n`);
    }
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
  await browser.close();
  console.log('wrote', OUT);
})().catch(e => { console.error(e); process.exit(1); });
