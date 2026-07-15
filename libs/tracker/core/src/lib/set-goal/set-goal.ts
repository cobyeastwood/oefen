import { getActiveGoalTip, updateGoalStatus } from '@oefen/shared/database';

import { abandonOtherActiveTips } from './abandon-other-active-tips';
import { createGoalFromInput } from './create-goal-from-input';
import type { SetGoalInput } from './types';

export type { GoalRevision, SetGoalInput } from './types';

async function createActiveTip(input: SetGoalInput, effectiveFrom: Date) {
  await abandonOtherActiveTips();
  return createGoalFromInput(input, effectiveFrom);
}

/** Create or revise the active goal tip. */
export async function setGoal(input: SetGoalInput) {
  const activeGoal = await getActiveGoalTip();
  const effectiveFrom = new Date();

  if (!activeGoal) {
    return { goal: await createActiveTip(input, effectiveFrom) };
  }

  if (!input.revision) {
    throw new Error('revision is required when an active goal exists');
  }

  if (input.revision === 'replace') {
    await updateGoalStatus(activeGoal.id, 'abandoned');
    return { goal: await createActiveTip(input, effectiveFrom) };
  }

  if (input.revision === 'update') {
    const goal = await createGoalFromInput(input, effectiveFrom, {
      continuesId: activeGoal.id,
    });
    await abandonOtherActiveTips(goal.id);
    return { goal };
  }

  throw new Error(`Unknown revision: ${String(input.revision)}`);
}
