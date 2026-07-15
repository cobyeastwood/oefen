import type { FreezeResult } from '../freeze';
import { freezeCheckpoint } from '../freeze';
import { closedWeeklyPeriods } from './closed-weekly-periods';
import type { Detector, DetectorContext } from './detector';

/** Pure decision: closed weekly windows to freeze for the active goal. */
export function decideWeeklySinceGoal(ctx: DetectorContext) {
  if (!ctx.goal) {
    return [];
  }
  return closedWeeklyPeriods(ctx.goal.effectiveFrom, ctx.now);
}

/**
 * For the active goal tip, freeze each closed 7-day window since effectiveFrom.
 */
async function detect(ctx: DetectorContext): Promise<FreezeResult[]> {
  if (!ctx.goal) {
    return [];
  }

  const results: FreezeResult[] = [];

  for (const { periodStart, periodEnd } of decideWeeklySinceGoal(ctx)) {
    const result = await freezeCheckpoint(
      'weekly_since_goal',
      periodStart,
      periodEnd,
      {
        goalId: ctx.goal.id,
        goal: ctx.goal,
        invokeSummarizer: ctx.invokeSummarizer,
      },
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
