import {
  findCheckpointByGoalAndType,
  getActiveGoalTip,
  listCheckpointsForGoal,
} from '@oefen/database';
import { deadlineProgress } from '@oefen/utils';

import { freezeCheckpoint, type FreezeResult } from '../freeze';
import {
  deadlineQuarterPeriodStart,
  shouldDetectDeadlineQuarter,
} from './deadline-quarter-policy';
import { checkpointWatermark } from './watermark';

/**
 * Fires once when remaining time to deadline first drops to ≤ 25% of total span.
 */
export async function detectDeadlineQuarter(
  now = new Date(),
): Promise<FreezeResult[]> {
  const goal = await getActiveGoalTip();
  if (!goal?.deadline) {
    return [];
  }

  const existing = await findCheckpointByGoalAndType(
    goal.id,
    'deadline_quarter',
  );
  if (existing) {
    return [];
  }

  const progress = deadlineProgress(goal.effectiveFrom, goal.deadline, now);
  if (!shouldDetectDeadlineQuarter(progress)) {
    return [];
  }

  const prior = await listCheckpointsForGoal(goal.id);
  const lastEnd = checkpointWatermark(prior, goal);
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
