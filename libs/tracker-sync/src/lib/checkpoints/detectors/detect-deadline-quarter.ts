import { deadlineProgress } from '@oefen/utils';

import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import {
  deadlineQuarterPeriodStart,
  shouldDetectDeadlineQuarter,
} from './deadline-quarter-policy';
import type { Detector, DetectorContext } from './detector';
import { checkpointWatermark } from './watermark';

/**
 * Fires once when remaining time to deadline first drops to ≤ 25% of total span.
 */
async function detect({
  now,
  goal,
  checkpoints,
}: DetectorContext): Promise<FreezeResult[]> {
  if (!goal?.deadline) {
    return [];
  }

  if (checkpoints.some((checkpoint) => checkpoint.type === 'deadline_quarter')) {
    return [];
  }

  const progress = deadlineProgress(goal.effectiveFrom, goal.deadline, now);
  if (!shouldDetectDeadlineQuarter(progress)) {
    return [];
  }

  const lastEnd = checkpointWatermark(checkpoints, goal);
  const periodStart = deadlineQuarterPeriodStart(
    lastEnd,
    goal.effectiveFrom,
    now,
  );

  return [
    await freezeCheckpoint('deadline_quarter', periodStart, now, {
      goalId: goal.id,
      goal,
    }),
  ];
}

export const deadlineQuarterDetector: Detector = {
  id: 'deadlineQuarter',
  detect,
};
