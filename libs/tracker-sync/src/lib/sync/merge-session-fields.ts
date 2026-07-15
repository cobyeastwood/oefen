import type { ActivityDraft } from './types';

export type SessionFields = Omit<ActivityDraft, 'externalId' | 'typeKey'>;

/** Duration-weighted average HR across parts that have avgHr. */
export function durationWeightedAvgHr(
  a: Pick<ActivityDraft, 'avgHr' | 'durationS'>,
  b: Pick<ActivityDraft, 'avgHr' | 'durationS'>,
): number | null {
  let weighted = 0;
  let duration = 0;
  for (const part of [a, b]) {
    if (part.avgHr == null) continue;
    weighted += part.avgHr * part.durationS;
    duration += part.durationS;
  }
  return duration === 0 ? null : Math.round(weighted / duration);
}

/** Merge two activity drafts into combined session field values. */
export function mergeSessionFields(
  existing: SessionFields,
  incoming: ActivityDraft,
): SessionFields {
  return {
    sport: existing.sport,
    occurredAt:
      incoming.occurredAt < existing.occurredAt
        ? incoming.occurredAt
        : existing.occurredAt,
    durationS: existing.durationS + incoming.durationS,
    distanceM: existing.distanceM + incoming.distanceM,
    avgHr: durationWeightedAvgHr(existing, incoming),
    maxHr: Math.max(existing.maxHr ?? 0, incoming.maxHr ?? 0) || null,
    rpe: incoming.rpe ?? existing.rpe,
    feel: incoming.feel ?? existing.feel,
    title: existing.title ?? incoming.title,
  };
}

/** Pick session-persisted fields from an activity draft or merge result. */
export function toSessionFields(activity: SessionFields): SessionFields {
  return {
    sport: activity.sport,
    occurredAt: activity.occurredAt,
    durationS: activity.durationS,
    distanceM: activity.distanceM,
    avgHr: activity.avgHr,
    maxHr: activity.maxHr,
    rpe: activity.rpe,
    feel: activity.feel,
    title: activity.title,
  };
}
