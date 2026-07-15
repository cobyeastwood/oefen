import type { UserStatus } from '@prisma/client';

import { getPrisma } from './client';

export const DEFAULT_USER_ID = 'default';

export type { UserStatus };

export function isUserSyncEnabled(status: UserStatus): boolean {
  return status === 'active';
}

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

export async function updateUserStatus(status: UserStatus) {
  const prisma = await getPrisma();
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: { id: DEFAULT_USER_ID, status },
    update: { status },
  });
}

export async function updateUser(data: {
  phoneE164?: string | null;
  status?: UserStatus;
}) {
  const prisma = await getPrisma();
  return prisma.user.upsert({
    where: { id: DEFAULT_USER_ID },
    create: {
      id: DEFAULT_USER_ID,
      phoneE164: data.phoneE164,
      status: data.status ?? 'active',
    },
    update: {
      ...(data.phoneE164 !== undefined ? { phoneE164: data.phoneE164 } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}
