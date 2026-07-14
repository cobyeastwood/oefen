import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname),
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
      '@oefen/tracker': resolve(__dirname, './src/index.ts'),
      '@oefen/summarizer': resolve(__dirname, '../summarizer/src/index.ts'),
    },
  },
});
