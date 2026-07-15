import type { ActivityDraft } from './types';

/** Keep only activities whose externalId is not already known. */
export function filterUnknownActivities(
  activities: ActivityDraft[],
  knownActivityIds: Set<number>,
): ActivityDraft[] {
  return activities.filter(
    (activity) => !knownActivityIds.has(activity.externalId),
  );
}
