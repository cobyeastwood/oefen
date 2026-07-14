import { detectDeadlineQuarter } from './detect-deadline-quarter';
import { detectGoalReached } from './detect-goal-reached';
import { detectWeeklySinceGoal } from './detect-weekly-since-goal';

export async function runDetectors(now = new Date()) {
  const weeklySinceGoal = await detectWeeklySinceGoal(now);
  const deadlineQuarter = await detectDeadlineQuarter(now);
  const goalReached = await detectGoalReached(now);

  return {
    weeklySinceGoal,
    deadlineQuarter,
    goalReached,
    createdCount:
      weeklySinceGoal.filter((r) => r.created).length +
      deadlineQuarter.filter((r) => r.created).length +
      goalReached.filter((r) => r.created).length,
  };
}
