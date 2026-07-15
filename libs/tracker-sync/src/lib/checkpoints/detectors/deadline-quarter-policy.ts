import type { DeadlineProgress } from '@oefen/utils';

/** True when remaining deadline time is ≤ 25% of the full goal span. */
export function shouldDetectDeadlineQuarter(
  progress: DeadlineProgress | null,
): boolean {
  return progress != null && progress.remainingRatio <= 0.25;
}

/** Period start for a deadline-quarter freeze from last checkpoint watermark. */
export function deadlineQuarterPeriodStart(
  lastEnd: Date,
  effectiveFrom: Date,
  now: Date,
): Date {
  return lastEnd < now ? lastEnd : effectiveFrom;
}
