import type { WellnessAverages, WellnessReading } from '@oefen/shared/types';

export type { WellnessAverages, WellnessReading } from '@oefen/shared/types';

/** Calendar days in `[periodStart, periodEnd)` using UTC dates. */
export function daysInPeriod(
  periodStart: Date,
  periodEnd: Date,
): number {
  const start = Date.UTC(
    periodStart.getUTCFullYear(),
    periodStart.getUTCMonth(),
    periodStart.getUTCDate(),
  );
  const end = Date.UTC(
    periodEnd.getUTCFullYear(),
    periodEnd.getUTCMonth(),
    periodEnd.getUTCDate(),
  );
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

function meanPositive(values: Array<number | null | undefined>): {
  avg: number | null;
  count: number;
} {
  const eligible = values.filter(
    (value): value is number => value != null && value > 0,
  );
  if (eligible.length === 0) {
    return { avg: null, count: 0 };
  }
  const sum = eligible.reduce((acc, value) => acc + value, 0);
  return { avg: sum / eligible.length, count: eligible.length };
}

/**
 * Period means for wellness metrics over `[periodStart, periodEnd)`.
 * Only non-null values `> 0` enter each mean; coverage counts include sparsity.
 */
export function wellnessAverages(input: {
  periodStart: Date;
  periodEnd: Date;
  rows: WellnessReading[];
}): WellnessAverages {
  const dayCount = daysInPeriod(input.periodStart, input.periodEnd);
  const steps = meanPositive(input.rows.map((row) => row.steps));
  const sleep = meanPositive(input.rows.map((row) => row.sleepSeconds));
  const rhr = meanPositive(input.rows.map((row) => row.restingHeartRate));
  const hydration = meanPositive(input.rows.map((row) => row.hydrationOz));

  return {
    avgSteps: steps.avg,
    avgSleepSeconds: sleep.avg,
    avgRestingHeartRate: rhr.avg,
    avgHydrationOz: hydration.avg,
    daysWithSteps: steps.count,
    daysWithSleep: sleep.count,
    daysWithRhr: rhr.count,
    daysWithHydration: hydration.count,
    dayCount,
  };
}
