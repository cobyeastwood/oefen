import { listKnownActivityIds } from '@oefen/database';
import {
  pullGarminActivities,
  type GarminConnectClient,
} from '@oefen/garmin';

import { toActivityDraft } from './to-activity-draft';
import type { ActivityDraft } from './types';

export type FetchRunningActivitiesResult = {
  activities: ActivityDraft[];
  knownActivityIds: Set<number>;
};

/** Pull Garmin activities and keep only mapped running sessions. */
export async function fetchRunningActivities(
  client: GarminConnectClient,
  since: Date,
): Promise<FetchRunningActivitiesResult> {
  const knownActivityIds = await listKnownActivityIds();
  const rawActivities = await pullGarminActivities(client, {
    knownActivityIds,
    since,
  });

  return {
    activities: rawActivities.flatMap((activity) => {
      const draft = toActivityDraft(activity);
      return draft ? [draft] : [];
    }),
    knownActivityIds,
  };
}
