import type { GarminConnectClient } from '@oefen/garmin';
import { parseGarminStartTime } from '@oefen/garmin';
import { readNumber, readString } from '@oefen/shared/utils';

import type { ActivityDraft } from './types';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

const RUNNING_TYPE_KEYS = new Set([
  'running',
  'indoor_running',
  'obstacle_course_racing',
  'street_running',
  'track_running',
  'trail_running',
  'treadmill_running',
  'ultra_running',
  'virtual_running',
]);

/** Map a Garmin activity payload to a running ActivityDraft, or null if skipped. */
export function toActivityDraft(
  activity: GarminActivityPayload,
): ActivityDraft | null {
  const typeKey = activity.activityType?.typeKey;
  if (!typeKey || !RUNNING_TYPE_KEYS.has(typeKey)) {
    return null;
  }

  const occurredAt = parseGarminStartTime(activity.startTimeGMT);
  if (!occurredAt) {
    return null;
  }

  const raw = activity as unknown as Record<string, unknown>;
  const title = activity.activityName ?? null;

  return {
    externalId: activity.activityId,
    typeKey,
    sport: 'run',
    occurredAt,
    durationS: Math.round(activity.movingDuration ?? activity.duration ?? 0),
    distanceM: activity.distance ?? 0,
    avgHr: activity.averageHR ?? null,
    maxHr: activity.maxHR ?? null,
    rpe: readNumber(raw['selfEvaluationRPE'] ?? raw['rpe']),
    feel: readString(raw['selfEvaluationFeel'] ?? raw['feel']),
    title,
  };
}
