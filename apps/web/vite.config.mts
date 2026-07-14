import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/web',
  appType: 'spa',
  server: {
    port: 4200,
    host: 'localhost',
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths()],
  build: {
    outDir: '../../dist/apps/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
