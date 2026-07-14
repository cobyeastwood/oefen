import { Hono } from 'hono';

import { getUser, normalizePhoneE164, updateUserPhone } from '@oefen/database';

export const userRoutes = new Hono();

userRoutes.get('/', async (c) => {
  const user = await getUser();
  return c.json({
    user: {
      id: user.id,
      phoneE164: user.phoneE164,
    },
  });
});

userRoutes.put('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));
  const parsed = parsePhoneE164(body['phoneE164']);
  if ('error' in parsed) {
    return c.json({ error: parsed.error }, 400);
  }

  const user = await updateUserPhone(parsed.phoneE164);
  return c.json({
    user: {
      id: user.id,
      phoneE164: user.phoneE164,
    },
  });
});

function parsePhoneE164(
  rawPhone: unknown,
): { phoneE164: string | null } | { error: string } {
  if (rawPhone == null || rawPhone === '') {
    return { phoneE164: null };
  }
  if (typeof rawPhone !== 'string') {
    return { error: 'phoneE164 must be a string' };
  }

  const phoneE164 = normalizePhoneE164(rawPhone);
  if (!phoneE164) {
    return { error: 'Phone must be in E.164 format, e.g. +15551234567' };
  }
  return { phoneE164 };
}
