import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname),
  cacheDir: resolve(__dirname, '../../node_modules/.vite/libs/tracker-sync'),
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@oefen/database': resolve(__dirname, '../database/src/index.ts'),
      '@oefen/utils': resolve(__dirname, '../utils/src/index.ts'),
      '@oefen/garmin': resolve(__dirname, '../garmin/src/index.ts'),
      '@oefen/summarizer': resolve(__dirname, '../summarizer/src/index.ts'),
    },
  },
});
