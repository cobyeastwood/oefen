import { Hono } from 'hono';

import { getActiveGoalTip } from '@oefen/shared/database';
import { parseSetGoalInput, setGoal } from '@oefen/tracker/core';

export const goalsRoutes = new Hono();

goalsRoutes.get('/', async (c) => {
  const tip = await getActiveGoalTip();
  return c.json({
    goals: tip
      ? [
          {
            ...tip,
            createdAt: tip.createdAt.toISOString(),
            effectiveFrom: tip.effectiveFrom.toISOString(),
            deadline: tip.deadline?.toISOString() ?? null,
          },
        ]
      : [],
  });
});

goalsRoutes.post('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const parsed = parseSetGoalInput(body);
  if (parsed.ok === false) {
    return c.json({ error: parsed.error }, 400);
  }

  return c.json(await setGoal(parsed.input), 201);
});
