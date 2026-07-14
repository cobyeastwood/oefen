import {
  findCheckpointByGoalAndType,
  getActiveGoalTip,
  listCheckpointsForGoal,
  listSessions,
  updateGoalStatus,
} from '@oefen/database';

import { freezeCheckpoint, type FreezeResult } from '../freeze';
import { findGoalHit } from './find-goal-hit';
import { checkpointWatermark } from './watermark';

/**
 * Fires when the active goal’s target is actually met (race time or volume).
 */
export async function detectGoalReached(
  now = new Date(),
): Promise<FreezeResult[]> {
  const goal = await getActiveGoalTip();
  if (!goal) {
    return [];
  }

  const existing = await findCheckpointByGoalAndType(goal.id, 'goal_reached');
  if (existing) {
    return [];
  }

  const prior = await listCheckpointsForGoal(goal.id);
  const watermark = checkpointWatermark(prior, goal);
  const sessions = (await listSessions()).filter(
    (session) =>
      session.occurredAt.getTime() >= goal.effectiveFrom.getTime() &&
      session.occurredAt.getTime() <= now.getTime(),
  );

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
    },
  );

  await updateGoalStatus(goal.id, 'achieved');
  return [result];
}
