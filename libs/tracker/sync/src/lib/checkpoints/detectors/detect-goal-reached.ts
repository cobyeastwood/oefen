import { updateGoalStatus } from '@oefen/shared/database';

import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import type { Detector, DetectorContext } from './detector';
import { findGoalHit } from './find-goal-hit';
import { checkpointWatermark } from './watermark';

/** Pure decision: whether the active goal has been met and where. */
export function decideGoalReached(ctx: DetectorContext) {
  const { now, goal, checkpoints, sessions } = ctx;
  if (!goal) {
    return null;
  }

  if (checkpoints.some((checkpoint) => checkpoint.type === 'goal_reached')) {
    return null;
  }

  const watermark = checkpointWatermark(checkpoints, goal);
  return findGoalHit({ goal, watermark, now, sessions });
}

/**
 * Fires when the active goal’s target is actually met (race time or volume).
 */
async function detect(ctx: DetectorContext): Promise<FreezeResult[]> {
  const hit = decideGoalReached(ctx);
  if (!hit || !ctx.goal) {
    return [];
  }

  const result = await freezeCheckpoint(
    'goal_reached',
    hit.periodStart,
    hit.periodEnd,
    {
      goalId: ctx.goal.id,
      goal: ctx.goal,
      sessionId: hit.sessionId,
      invokeSummarizer: ctx.invokeSummarizer,
    },
  );

  await updateGoalStatus(ctx.goal.id, 'achieved');
  return [result];
}

export const goalReachedDetector: Detector = {
  id: 'goalReached',
  detect,
};
