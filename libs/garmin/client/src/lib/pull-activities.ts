import type { GarminConnectClient } from './garmin-connect-client';
import { parseGarminStartTime } from './parse-garmin-start-time';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

export type PullActivitiesOptions = {
  knownActivityIds?: Set<number>;
  /** Lower bound on activity startTimeGMT (typically user.createdAt). */
  since?: Date;
};

const PAGE_SIZE = 20;

/** Fetch one page of recent Garmin activities, filtered by known IDs and since. */
export async function pullActivities(
  client: GarminConnectClient,
  options: PullActivitiesOptions = {},
): Promise<GarminActivityPayload[]> {
  const knownActivityIds = options.knownActivityIds ?? new Set<number>();
  const since = options.since;
  const page = await client.getActivities(0, PAGE_SIZE);
  const collected: GarminActivityPayload[] = [];

  for (const activity of page) {
    if (since) {
      const startedAt = parseGarminStartTime(activity.startTimeGMT);
      if (!startedAt || startedAt < since) {
        // Newest-first: remaining page entries are older than since.
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
