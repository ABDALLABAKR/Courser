import { defineConfig } from 'tsup';
export default defineConfig({
  entry: ['src/index.ts', 'src/scripts/hash-password.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  splitting: false,
  removeNodeProtocol: false, // node:sqlite only resolves with the node: prefix
  noExternal: ['@wene/shared'], // workspace TS source is bundled into the server build
});
