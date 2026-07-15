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
    },
  },
});
