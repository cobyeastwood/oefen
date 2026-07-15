import { deadlineProgress } from '@oefen/shared/utils';

import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import {
  deadlineQuarterPeriodStart,
  shouldDetectDeadlineQuarter,
} from './deadline-quarter-policy';
import type { Detector, DetectorContext } from './detector';
import { checkpointWatermark } from './watermark';

type DeadlineQuarterDecision = {
  periodStart: Date;
  periodEnd: Date;
};

/** Pure decision: whether deadline-quarter should freeze, and over which window. */
export function decideDeadlineQuarter(
  ctx: DetectorContext,
): DeadlineQuarterDecision | null {
  const { now, goal, checkpoints } = ctx;
  if (!goal?.deadline) {
    return null;
  }

  if (checkpoints.some((checkpoint) => checkpoint.type === 'deadline_quarter')) {
    return null;
  }

  const progress = deadlineProgress(goal.effectiveFrom, goal.deadline, now);
  if (!shouldDetectDeadlineQuarter(progress)) {
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
  };
}

/**
 * Fires once when remaining time to deadline first drops to ≤ 25% of total span.
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
        invokeSummarizer: ctx.invokeSummarizer,
      },
    ),
  ];
}

export const deadlineQuarterDetector: Detector = {
  id: 'deadlineQuarter',
  detect,
};
