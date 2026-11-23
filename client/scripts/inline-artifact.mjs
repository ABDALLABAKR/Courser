// Turns dist-artifact/index.html into one self-contained artifact page body:
// <title>, inline <style>, root div and an inline module script.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../dist-artifact/', import.meta.url).pathname;
const assets = join(dir, 'assets');
const files = readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(assets, f), 'utf8'));
const css = files.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(assets, f), 'utf8'));
if (js.length !== 1) throw new Error(`expected one JS bundle, got ${js.length}`);
const safeJs = js[0].replace(/<\/script/gi, '<\\/script');
const page = `<title>وێنە بکێشە · Wêne Bikêşe</title>
<meta name="description" content="Kurdish multiplayer draw and guess game">
<meta name="theme-color" content="#20C5C5">
<style>${css.join('\n')}</style>
<div id="root"></div>
<script type="module">${safeJs}</script>
`;
const out = join(dir, 'wene-bikeshe.html');
writeFileSync(out, page);
console.log(`wrote ${out} (${(page.length / 1024).toFixed(0)} KB)`);
