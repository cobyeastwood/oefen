import { Hono } from 'hono';
import type { UserStatus } from '@oefen/shared/database';
import {
  getUser,
  normalizePhoneE164,
  updateUser,
} from '@oefen/shared/database';

export const userRoutes = new Hono();

const USER_STATUSES = new Set<UserStatus>(['active', 'paused', 'disabled']);

userRoutes.get('/', async (c) => {
  const user = await getUser();
  return c.json({
    user: {
      id: user.id,
      phoneE164: user.phoneE164,
      status: user.status,
    },
  });
});

userRoutes.put('/', async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}));

  const hasPhone = 'phoneE164' in body;
  const hasStatus = 'status' in body;
  if (!hasPhone && !hasStatus) {
    return c.json({ error: 'Provide phoneE164 and/or status' }, 400);
  }

  let phoneE164: string | null | undefined;
  if (hasPhone) {
    const parsed = parsePhoneE164(body['phoneE164']);
    if ('error' in parsed) {
      return c.json({ error: parsed.error }, 400);
    }
    phoneE164 = parsed.phoneE164;
  }

  let status: UserStatus | undefined;
  if (hasStatus) {
    const parsed = parseStatus(body['status']);
    if ('error' in parsed) {
      return c.json({ error: parsed.error }, 400);
    }
    status = parsed.status;
  }

  const user = await updateUser({ phoneE164, status });
  return c.json({
    user: {
      id: user.id,
      phoneE164: user.phoneE164,
      status: user.status,
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

function parseStatus(
  rawStatus: unknown,
): { status: UserStatus } | { error: string } {
  if (typeof rawStatus !== 'string' || !USER_STATUSES.has(rawStatus as UserStatus)) {
    return { error: 'status must be one of active, paused, disabled' };
  }
  return { status: rawStatus as UserStatus };
}
