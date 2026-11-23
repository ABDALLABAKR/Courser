/**
 * Builds a single-file claude.ai Artifact: no backend. Rooms are hosted by a player's page
 * (src/artifact/*) and every asset (JS, CSS, fonts) is inlined by scripts/inline-artifact.mjs.
 */
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const art = (f: string) => resolve(here, 'src/artifact', f);

/** Swap Node/server-only modules for browser versions. */
function swaps(): Plugin {
  return {
    name: 'artifact-swaps',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source === 'socket.io-client') return art('clientSocket.ts');
      if (!importer) return null;
      const norm = importer.replace(/\\/g, '/');
      if (norm.includes('/server/src/') && /^\.\.?\/util$/.test(source)) return art('browserUtil.ts');
      if (norm.includes('/client/src/') && /\/lib\/api$|^\.\/api$/.test(source) && !norm.includes('/artifact/')) return art('api.ts');
      return null;
    },
  };
}

export default defineConfig({
  plugins: [swaps(), react(), tailwindcss()],
  define: {
    'import.meta.env.VITE_ARTIFACT': JSON.stringify('true'),
    'import.meta.env.VITE_ARTIFACT_URL': JSON.stringify(process.env.ARTIFACT_URL ?? ''),
    'import.meta.env.VITE_SERVER_URL': JSON.stringify(''),
  },
  build: {
    outDir: 'dist-artifact',
    emptyOutDir: true,
    target: 'es2020',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
