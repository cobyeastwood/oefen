import { parseGarminStartTime } from '@oefen/garmin';

type FilterPulledActivitiesOptions = {
  knownActivityIds?: Set<number>;
  /** Lower bound on activity startTimeGMT (typically user.createdAt). */
  since?: Date;
};

type PulledActivity = {
  activityId: number;
  startTimeGMT?: unknown;
};

/** Filter pulled Garmin activities by known IDs and since (newest-first). */
export function filterPulledActivities<T extends PulledActivity>(
  activities: T[],
  options: FilterPulledActivitiesOptions = {},
): T[] {
  const knownActivityIds = options.knownActivityIds ?? new Set<number>();
  const since = options.since;
  const collected: T[] = [];

  for (const activity of activities) {
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
