import { getPrisma } from './client';

export const DEFAULT_USER_ID = 'default';

export function normalizePhoneE164(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/[^\d+]/g, '');
  if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

export async function getUser() {
  const prisma = await getPrisma();
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: { id: DEFAULT_USER_ID },
    update: {},
  });
}

export async function updateUserPhone(phoneE164: string | null) {
  const prisma = await getPrisma();
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: { id: DEFAULT_USER_ID, phoneE164 },
    update: { phoneE164 },
  });
}
