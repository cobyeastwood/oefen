import { deadlineProgress } from '@oefen/shared/utils';

import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import type { DeadlineMilestone } from '../metrics';
import { readCheckpointMetrics } from '../metrics';
import {
  deadlineQuarterPeriodStart,
  selectDeadlineMilestone,
} from './deadline-quarter-policy';
import type { Detector, DetectorContext } from './detector';
import { checkpointWatermark } from './watermark';

type DeadlineQuarterDecision = {
  periodStart: Date;
  periodEnd: Date;
  milestone: DeadlineMilestone;
};

/** Collect remaining-ratio milestones already frozen for this goal. */
export function firedDeadlineMilestones(
  checkpoints: DetectorContext['checkpoints'],
): number[] {
  const fired: number[] = [];
  for (const checkpoint of checkpoints) {
    if (checkpoint.type !== 'deadline_quarter') {
      continue;
    }
    const metrics = readCheckpointMetrics(checkpoint.metricsJson);
    if (metrics?.milestone != null) {
      fired.push(metrics.milestone);
      continue;
    }
    // Legacy rows without milestone count as the original 25% remaining fire.
    fired.push(0.25);
  }
  return fired;
}

/** Pure decision: next deadline milestone to freeze, if any. */
export function decideDeadlineQuarter(
  ctx: DetectorContext,
): DeadlineQuarterDecision | null {
  const { now, goal, checkpoints } = ctx;
  if (!goal?.deadline) {
    return null;
  }

  const progress = deadlineProgress(goal.effectiveFrom, goal.deadline, now);
  const milestone = selectDeadlineMilestone(
    progress,
    firedDeadlineMilestones(checkpoints),
  );
  if (!milestone) {
    return null;
  }

  const lastEnd = checkpointWatermark(checkpoints, goal);
  return {
    periodStart: deadlineQuarterPeriodStart(
      lastEnd,
      goal.effectiveFrom,
      now,
    ),
    periodEnd: now,
    milestone,
  };
}

/**
 * Fires at remaining-ratio milestones 0.75 / 0.5 / 0.25 (25% / 50% / 75% elapsed).
 * Sync gaps that cross multiple thresholds freeze only the latest milestone.
 */
async function detect(ctx: DetectorContext): Promise<FreezeResult[]> {
  const decision = decideDeadlineQuarter(ctx);
  if (!decision || !ctx.goal) {
    return [];
  }

  return [
    await freezeCheckpoint(
      'deadline_quarter',
      decision.periodStart,
      decision.periodEnd,
      {
        goalId: ctx.goal.id,
        goal: ctx.goal,
        milestone: decision.milestone,
        invokeSummary: ctx.invokeSummary,
      },
    ),
  ];
}

export const deadlineQuarterDetector: Detector = {
  id: 'deadlineQuarter',
  detect,
};
