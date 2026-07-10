import type { PrismaClient } from '@oefen/database';

import type { GarminConnectClient } from './garmin-connect-client';
import { syncActivities } from './sync-activities';
import { syncDailySummary } from './sync-daily-summaries';

export async function syncGarminToDatabase(
  prisma: PrismaClient,
  client: GarminConnectClient
) {
  const activities = await syncActivities(prisma, client);
  const summaries = await syncDailySummary(prisma, client);

  return { activities, summaries };
}
