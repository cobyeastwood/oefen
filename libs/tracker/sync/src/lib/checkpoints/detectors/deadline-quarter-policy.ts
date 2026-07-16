import type { DeadlineProgress } from '@oefen/shared/utils';

import type { DeadlineMilestone } from '../metrics';

/** Remaining-ratio thresholds that trigger deadline_quarter freezes (earliest→latest). */
export const DEADLINE_MILESTONES = [0.75, 0.5, 0.25] as const satisfies readonly DeadlineMilestone[];

/** Milestones crossed by current remaining ratio that have not already fired. */
export function crossedDeadlineMilestones(
  progress: DeadlineProgress | null,
  alreadyFired: Iterable<number> = [],
): DeadlineMilestone[] {
  if (!progress) {
    return [];
  }
  const fired = new Set(alreadyFired);
  return DEADLINE_MILESTONES.filter(
    (milestone) =>
      progress.remainingRatio <= milestone && !fired.has(milestone),
  );
}

/**
 * When a sync gap crosses multiple thresholds, freeze only the latest
 * (lowest remaining-ratio) milestone.
 */
export function selectDeadlineMilestone(
  progress: DeadlineProgress | null,
  alreadyFired: Iterable<number> = [],
): DeadlineMilestone | null {
  const crossed = crossedDeadlineMilestones(progress, alreadyFired);
  return crossed.length > 0 ? crossed[crossed.length - 1]! : null;
}

/** @deprecated Prefer selectDeadlineMilestone — kept for call-site clarity. */
export function shouldDetectDeadlineQuarter(
  progress: DeadlineProgress | null,
  alreadyFired: Iterable<number> = [],
): boolean {
  return selectDeadlineMilestone(progress, alreadyFired) != null;
}

/** Period start for a deadline-quarter freeze from last checkpoint watermark. */
export function deadlineQuarterPeriodStart(
  lastEnd: Date,
  effectiveFrom: Date,
  now: Date,
): Date {
  return lastEnd < now ? lastEnd : effectiveFrom;
}
