import type { PrismaClient } from '@oefen/database';

import type { GarminConnectClient } from './garmin-connect-client';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

function mapActivity(activity: GarminActivityPayload) {
  return {
    garminActivityId: BigInt(activity.activityId),
    activityName: activity.activityName,
    activityTypeKey: activity.activityType.typeKey,
    startTimeLocal: new Date(activity.startTimeLocal),
    startTimeGmt: new Date(activity.startTimeGMT),
    distance: activity.distance ?? null,
    duration: activity.duration ?? null,
    averageSpeed: activity.averageSpeed ?? null,
    elevationGain: activity.elevationGain ?? null,
    raw: activity as unknown as object,
    syncedAt: new Date(),
  };
}

export async function syncActivities(
  prisma: PrismaClient,
  client: GarminConnectClient,
) {
  const activities = await client.getActivities(0, 20);

  if (activities.length === 0) {
    return { fetched: 0, upserted: 0 };
  }

  await prisma.$transaction(
    activities.map((activity) => {
      const data = mapActivity(activity);
      return prisma.garminActivity.upsert({
        where: { garminActivityId: data.garminActivityId },
        create: data,
        update: data,
      });
    }),
  );

  return { fetched: activities.length, upserted: activities.length };
}
