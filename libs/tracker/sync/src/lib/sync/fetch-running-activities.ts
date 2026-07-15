import { listKnownActivityIds } from '@oefen/shared/database';
import { pullActivities, type GarminConnectClient } from '@oefen/garmin';

import { filterPulledActivities } from './filter-pulled-activities';
import { isRunningActivity, mapActivityDraft } from './to-activity-draft';
import type { ActivityDraft } from './types';

type FetchRunningActivitiesResult = {
  activities: ActivityDraft[];
  knownActivityIds: Set<number>;
};

/** Pull Garmin activities and keep only mapped running sessions. */
export async function fetchRunningActivities(
  client: GarminConnectClient,
  since: Date,
): Promise<FetchRunningActivitiesResult> {
  const knownActivityIds = await listKnownActivityIds();
  const rawActivities = await pullActivities(client);
  const filteredActivities = filterPulledActivities(rawActivities, {
    knownActivityIds,
    since,
  });

  return {
    activities: filteredActivities.flatMap((activity) => {
      if (!isRunningActivity(activity)) {
        return [];
      }
      const draft = mapActivityDraft(activity);
      return draft ? [draft] : [];
    }),
    knownActivityIds,
  };
}
