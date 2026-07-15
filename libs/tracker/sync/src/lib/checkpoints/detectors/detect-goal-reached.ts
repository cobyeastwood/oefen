import { updateGoalStatus } from '@oefen/shared/database';

import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import type { Detector, DetectorContext } from './detector';
import { findGoalHit } from './find-goal-hit';
import { checkpointWatermark } from './watermark';

/**
 * Fires when the active goal’s target is actually met (race time or volume).
 */
async function detect({
  now,
  goal,
  checkpoints,
  sessions,
  invokeSummarizer,
}: DetectorContext): Promise<FreezeResult[]> {
  if (!goal) {
    return [];
  }

  if (checkpoints.some((checkpoint) => checkpoint.type === 'goal_reached')) {
    return [];
  }

  const watermark = checkpointWatermark(checkpoints, goal);
  const hit = findGoalHit({ goal, watermark, now, sessions });
  if (!hit) {
    return [];
  }

  const result = await freezeCheckpoint(
    'goal_reached',
    hit.periodStart,
    hit.periodEnd,
    {
      goalId: goal.id,
      goal,
      sessionId: hit.sessionId,
      invokeSummarizer,
    },
  );

  await updateGoalStatus(goal.id, 'achieved');
  return [result];
}

export const goalReachedDetector: Detector = {
  id: 'goalReached',
  detect,
};
