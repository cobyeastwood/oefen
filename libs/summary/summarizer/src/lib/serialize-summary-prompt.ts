import type { WellnessAverages } from '@oefen/shared/utils';

import type { SummaryContext } from './load-summary-context';

function iso(date: Date) {
  return date.toISOString();
}

/** Serialize period wellness averages for the summarizer prompt. */
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

/** Serialize the current checkpoint for the summarizer prompt. */
export function serializeCheckpoint(
  checkpoint: SummaryContext['checkpoint'],
) {
  return {
    type: checkpoint.type,
    periodStart: iso(checkpoint.periodStart),
    periodEnd: iso(checkpoint.periodEnd),
    sessionCount: checkpoint.sessionCount,
    durationS: checkpoint.durationS,
    distanceM: checkpoint.distanceM,
    metricsJson: checkpoint.metricsJson,
    goalSnapshot: checkpoint.goalSnapshot,
  };
}

/** Serialize a prior checkpoint for the summarizer prompt. */
export function serializePrior(
  prior: NonNullable<SummaryContext['prior']>,
) {
  return {
    type: prior.type,
    periodStart: iso(prior.periodStart),
    periodEnd: iso(prior.periodEnd),
    metricsJson: prior.metricsJson,
    goalSnapshot: prior.goalSnapshot,
  };
}
