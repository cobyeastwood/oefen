import type { GarminConnectClient } from './garmin-connect-client';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

export type PullActivitiesOptions = {
  knownActivityIds?: Set<number>;
  /** Lower bound on activity startTimeGMT (typically user.createdAt). */
  since?: Date;
};

const PAGE_SIZE = 20;

/** Parse Garmin startTimeGMT (UTC wall time, often without a Z suffix). */
function activityStartTime(activity: GarminActivityPayload): Date | null {
  const raw = activity.startTimeGMT;
  if (typeof raw === 'number') {
    const startedAt = new Date(raw);
    return Number.isNaN(startedAt.getTime()) ? null : startedAt;
  }
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }

  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
    ? raw
    : `${raw.replace(' ', 'T')}Z`;
  const startedAt = new Date(normalized);
  return Number.isNaN(startedAt.getTime()) ? null : startedAt;
}

/** Fetch one page of recent Garmin activities, filtered by known IDs and since. */
export async function pullGarminActivities(
  client: GarminConnectClient,
  options: PullActivitiesOptions = {},
): Promise<GarminActivityPayload[]> {
  const knownActivityIds = options.knownActivityIds ?? new Set<number>();
  const since = options.since;
  const page = await client.getActivities(0, PAGE_SIZE);
  const collected: GarminActivityPayload[] = [];

  for (const activity of page) {
    if (since) {
      const startedAt = activityStartTime(activity);
      if (!startedAt || startedAt < since) {
        // Newest-first: remaining page entries are older than user.createdAt.
        break;
      }
    }

    if (knownActivityIds.has(activity.activityId)) {
      continue;
    }

    collected.push(activity);
  }

  return collected;
}
