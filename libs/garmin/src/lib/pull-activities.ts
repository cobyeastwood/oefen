import type { GarminConnectClient } from './garmin-connect-client';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

export type PullActivitiesOptions = {
  backfillCap?: number;
  pageSize?: number;
  knownActivityIds?: Set<number>;
};

export async function pullGarminActivities(
  client: GarminConnectClient,
  options: PullActivitiesOptions = {},
): Promise<GarminActivityPayload[]> {
  const backfillCap = options.backfillCap ?? 200;
  const pageSize = options.pageSize ?? 20;
  // Local copy so pagination can mark seen ids without mutating the caller's
  // DB-known set (ingest still needs that set to decide create vs skip).
  const knownActivityIds = new Set(options.knownActivityIds ?? []);
  const collected: GarminActivityPayload[] = [];
  let start = 0;

  while (collected.length < backfillCap) {
    const page = await client.getActivities(start, pageSize);
    if (page.length === 0) {
      break;
    }

    if (page.every((activity) => knownActivityIds.has(activity.activityId))) {
      break;
    }

    for (const activity of page) {
      if (knownActivityIds.has(activity.activityId)) {
        continue;
      }
      collected.push(activity);
      knownActivityIds.add(activity.activityId);
      if (collected.length >= backfillCap) {
        return collected;
      }
    }

    if (page.length < pageSize) {
      break;
    }
    start += pageSize;
  }

  return collected;
}
