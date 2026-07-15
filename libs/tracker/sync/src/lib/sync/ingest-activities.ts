import { findMergeCandidate } from '@oefen/shared/database';

import { filterUnknownActivities } from './filter-unknown-activities';
import {
  createNewSession,
  mergeIntoExistingSession,
} from './link-activity-session';
import { toSessionFields } from './merge-session-fields';
import type { ActivityDraft } from './types';

async function ingestActivity(
  activity: ActivityDraft,
  knownIds: Set<number>,
): Promise<boolean> {
  if (knownIds.has(activity.externalId)) {
    return false;
  }

  const candidate = await findMergeCandidate({
    sport: activity.sport,
    occurredAt: activity.occurredAt,
    durationS: activity.durationS,
  });

  if (candidate) {
    await mergeIntoExistingSession(
      candidate.id,
      toSessionFields(candidate),
      activity,
      knownIds,
    );
    return true;
  }

  await createNewSession(activity, knownIds);
  return true;
}

type IngestActivitiesResult = {
  ingested: number;
  skipped: number;
};

/** Persist fetched activities as Activity rows linked to new or merged sessions. */
export async function ingestActivities(
  activities: ActivityDraft[],
  knownActivityIds: Set<number>,
): Promise<IngestActivitiesResult> {
  const unknown = filterUnknownActivities(activities, knownActivityIds);
  let ingested = 0;

  for (const activity of unknown) {
    if (await ingestActivity(activity, knownActivityIds)) {
      ingested += 1;
    }
  }

  return {
    ingested,
    skipped: activities.length - ingested,
  };
}
