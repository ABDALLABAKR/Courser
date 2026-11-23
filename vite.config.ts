/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

/** Emits sw.js with every built file precached → full offline play. */
function serviceWorker(): Plugin {
  return {
    name: 'wusha-service-worker',
    apply: 'build',
    generateBundle(_opts, bundle) {
      const files = Object.keys(bundle).filter((f) => !f.endsWith('.map') && !f.endsWith('.woff'));
      const statics = ['manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'];
      const assets = ['./', './index.html', ...[...files, ...statics].map((f) => `./${f}`)];
      const template = readFileSync(new URL('./scripts/sw-template.js', import.meta.url), 'utf8');
      const version = `${pkg.version}-${Date.now().toString(36)}`;
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template.replace('__VERSION__', version).replace('__ASSETS__', JSON.stringify([...new Set(assets)], null, 2)),
      });
    },
  };
}

// `base: './'` makes the build work from any sub-path (GitHub Pages project
// sites, Netlify, Cloudflare Pages, a plain folder on a server…).
// Override with VITE_BASE=/some/path/ if you need absolute asset URLs.
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react(), tailwindcss(), serviceWorker()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  build: { target: 'es2020', sourcemap: false },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
