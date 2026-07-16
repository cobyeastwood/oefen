import type { WellnessAverages } from '@oefen/shared/utils';

import type { SummaryContext } from './load-summary-context';

function iso(date: Date) {
  return date.toISOString();
}

function readMetricsObject(metricsJson: unknown) {
  if (!metricsJson || typeof metricsJson !== 'object') {
    return null;
  }
  return metricsJson as Record<string, unknown>;
}

/** Serialize period wellness averages for the summary prompt. */
export function serializeWellness(wellness: WellnessAverages) {
  return {
    avgSteps: wellness.avgSteps,
    avgSleepSeconds: wellness.avgSleepSeconds,
    avgRestingHeartRate: wellness.avgRestingHeartRate,
    avgHydrationOz: wellness.avgHydrationOz,
    daysWithSteps: wellness.daysWithSteps,
    daysWithSleep: wellness.daysWithSleep,
    daysWithRhr: wellness.daysWithRhr,
    daysWithHydration: wellness.daysWithHydration,
    dayCount: wellness.dayCount,
  };
}

/** Serialize the current checkpoint for the summary prompt. */
export function serializeCheckpoint(
  checkpoint: SummaryContext['checkpoint'],
) {
  const metrics = readMetricsObject(checkpoint.metricsJson);
  return {
    type: checkpoint.type,
    periodStart: iso(checkpoint.periodStart),
    periodEnd: iso(checkpoint.periodEnd),
    sessionCount: checkpoint.sessionCount,
    durationS: checkpoint.durationS,
    distanceM: checkpoint.distanceM,
    metricsJson: checkpoint.metricsJson,
    pace: metrics?.['pace'] ?? null,
    milestone: metrics?.['milestone'] ?? null,
    volumeDelta: metrics?.['volumeDelta'] ?? null,
    goalSnapshot: checkpoint.goalSnapshot,
  };
}

/** Serialize a prior checkpoint for the summary prompt. */
export function serializePrior(
  prior: NonNullable<SummaryContext['prior']>,
) {
  const metrics = readMetricsObject(prior.metricsJson);
  return {
    type: prior.type,
    periodStart: iso(prior.periodStart),
    periodEnd: iso(prior.periodEnd),
    metricsJson: prior.metricsJson,
    pace: metrics?.['pace'] ?? null,
    milestone: metrics?.['milestone'] ?? null,
    volumeDelta: metrics?.['volumeDelta'] ?? null,
    goalSnapshot: prior.goalSnapshot,
  };
}
