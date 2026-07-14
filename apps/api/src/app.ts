import { Hono } from 'hono';

import { goalsRoutes } from './routes/goals';
import { userRoutes } from './routes/user';

export const app = new Hono();

app.route('/api/goals', goalsRoutes);
app.route('/api/user', userRoutes);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((error, c) => {
  console.error('API error:', error);
  return c.json(
    {
      error: error instanceof Error ? error.message : 'Internal server error',
    },
    500,
  );
});
