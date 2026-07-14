import { serve } from '@hono/node-server';

import './env';
import { app } from './app';

const PORT = Number(process.env['API_PORT'] ?? 3001);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
