import { resolve } from 'node:path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: resolve(__dirname),
  cacheDir: resolve(__dirname, '../../../node_modules/.vite/libs/tracker/core'),
  plugins: [nxViteTsPaths()],
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
});
