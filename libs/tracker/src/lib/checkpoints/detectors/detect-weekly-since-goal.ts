import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import { closedWeeklyPeriods } from './closed-weekly-periods';
import type { Detector, DetectorContext } from './detector';

/**
 * For the active goal tip, freeze each closed 7-day window since effectiveFrom.
 */
async function detect({
  now,
  goal,
}: DetectorContext): Promise<FreezeResult[]> {
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

export const weeklySinceGoalDetector: Detector = {
  id: 'weeklySinceGoal',
  detect,
};
