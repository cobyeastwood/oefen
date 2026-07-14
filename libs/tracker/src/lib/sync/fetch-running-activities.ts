import { listKnownActivityIds } from '@oefen/database';
import {
  pullGarminActivities,
  type GarminConnectClient,
} from '@oefen/garmin';

import { toActivityDraft } from './to-activity-draft';
import type { ActivityDraft, SyncGarminOptions } from './types';

export type FetchRunningActivitiesResult = {
  activities: ActivityDraft[];
  knownActivityIds: Set<number>;
};

/** Pull Garmin activities and keep only mapped running sessions. */
export async function fetchRunningActivities(
  client: GarminConnectClient,
  options: SyncGarminOptions = {},
): Promise<FetchRunningActivitiesResult> {
  // DB-known ids only — pull clones this set internally so ingest can still
  // tell "already persisted" apart from "just fetched".
  const knownActivityIds = await listKnownActivityIds();
  const rawActivities = await pullGarminActivities(client, {
    backfillCap: options.backfillCap,
    knownActivityIds,
  });

  return {
    activities: rawActivities.flatMap((activity) => {
      const draft = toActivityDraft(activity);
      return draft ? [draft] : [];
    }),
    knownActivityIds,
  };
}
