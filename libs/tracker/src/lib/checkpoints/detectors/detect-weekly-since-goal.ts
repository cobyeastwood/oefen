import { getActiveGoalTip } from '@oefen/database';

import { freezeCheckpoint, type FreezeResult } from '../freeze';
import { closedWeeklyPeriods } from './closed-weekly-periods';

/**
 * For the active goal tip, freeze each closed 7-day window since effectiveFrom.
 */
export async function detectWeeklySinceGoal(
  now = new Date(),
): Promise<FreezeResult[]> {
  const goal = await getActiveGoalTip();
  if (!goal) {
    return [];
  }

  const results: FreezeResult[] = [];

  for (const { periodStart, periodEnd } of closedWeeklyPeriods(
    goal.effectiveFrom,
    now,
  )) {
    const result = await freezeCheckpoint(
      'weekly_since_goal',
      periodStart,
      periodEnd,
      { goalId: goal.id, goal },
    );
    if (result.created) {
      results.push(result);
    }
  }

  return results;
}
