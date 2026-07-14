import { config } from 'dotenv';
import { resolve } from 'node:path';

// Vercel injects env vars; skip dotenv there.
if (!process.env['VERCEL']) {
  const root = process.cwd();
  config({ path: resolve(root, '.env') });
  config({ path: resolve(root, '.env.local'), override: true });
}
