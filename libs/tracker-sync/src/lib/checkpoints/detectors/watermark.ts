import type { Goal } from '@prisma/client';

/** Watermark after the latest checkpoint for a goal, or the goal start. */
export function checkpointWatermark(
  prior: { periodEnd: Date }[],
  goal: Pick<Goal, 'effectiveFrom'>,
): Date {
  return prior.length ? prior[prior.length - 1]!.periodEnd : goal.effectiveFrom;
}
