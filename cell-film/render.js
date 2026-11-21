// Renders the film frame-by-frame with headless Chromium (WebGL2) and pipes
// the frames into ffmpeg.
//
//   node render.js stills <width> <out-dir> t1 t2 ...   -> PNG stills for review
//   node render.js film <width> <out.mp4> [start] [end] -> encoded video segment
//
// Full-quality film: node render.js film 2160 the-invisible-universe.mp4
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const FPS = 24, DURATION = 30;

async function open(width){
  const height = Math.round(width * 16 / 9);
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
           '--disable-gpu-watchdog', '--disable-features=GpuWatchdog'],
  });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const shader = fs.readFileSync(process.env.SHADER_FILE || path.join(__dirname, 'shader.frag'), 'utf8');
  await page.addInitScript(src => { window.SHADER = src; }, shader);
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.waitForFunction(() => window.READY || window.SHADER_ERROR, null, { timeout: 600000 });
  const err = await page.evaluate(() => window.SHADER_ERROR);
  if (err) { console.error(err); process.exit(1); }
  await page.evaluate(() => document.fonts.ready);
  return { browser, page, width, height };
}

async function main(){
  const [mode, w, out, ...rest] = process.argv.slice(2);
  const { browser, page, width, height } = await open(parseInt(w, 10));
  if (mode === 'stills'){
    fs.mkdirSync(out, { recursive: true });
    for (const ts of rest){
      const t = parseFloat(ts); const t0 = Date.now();
      await page.evaluate(t => window.renderFrame(t), t);
      await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(5, '0')}.png`) });
      console.log(`t=${t} ${Date.now() - t0}ms`);
    }
  } else {
    const start = rest[0] ? parseInt(rest[0], 10) : 0;
    const end = rest[1] ? parseInt(rest[1], 10) : FPS * DURATION;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS),
      '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-tune', 'film', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
      '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const tStart = Date.now();
    for (let f = start; f < end; f++){
      const t = f / FPS;
      await page.evaluate(t => window.renderFrame(t), t);
      const png = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - start) % 12 === 0){
        const el = (Date.now() - tStart) / 1000, done = f - start + 1;
        console.log(`frame ${f}/${end}  ${(el / done).toFixed(2)}s/frame  eta ${((end - f) * el / done / 60).toFixed(1)}min`);
      }
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
