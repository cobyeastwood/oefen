import {
  createSession,
  updateSession,
  upsertActivity,
} from '@oefen/shared/database';

import {
  mergeSessionFields,
  toSessionFields,
  type SessionFields,
} from './merge-session-fields';
import type { ActivityDraft } from './types';

/** Upsert an Activity row linked to a session. */
export async function linkActivity(
  activity: ActivityDraft,
  sessionId: string,
) {
  await upsertActivity({
    garminActivityId: activity.externalId,
    typeKey: activity.typeKey,
    name: activity.title,
    startTimeGmt: activity.occurredAt,
    durationS: activity.durationS,
    distanceM: activity.distanceM,
    avgHr: activity.avgHr,
    maxHr: activity.maxHr,
    sessionId,
  });
}

/** Merge an incoming activity into an existing session and link the Activity. */
export async function mergeIntoExistingSession(
  sessionId: string,
  existing: SessionFields,
  incoming: ActivityDraft,
  knownIds: Set<number>,
) {
  const merged = mergeSessionFields(existing, incoming);
  await updateSession(sessionId, {
    ...toSessionFields(merged),
    source: 'merged',
  });
  await linkActivity(incoming, sessionId);
  knownIds.add(incoming.externalId);
}

/** Create a new session from an activity and link the Activity row. */
export async function createNewSession(
  activity: ActivityDraft,
  knownIds: Set<number>,
) {
  const session = await createSession({
    ...toSessionFields(activity),
    source: 'garmin',
  });
  await linkActivity(activity, session.id);
  knownIds.add(activity.externalId);
}
