import type { Goal } from '@prisma/client';
import { getActiveGoalAt, serializeGoalSnapshot } from '@oefen/shared/database';

import type { FreezeAttachments } from './types';

type ResolvedFreezeGoal = {
  goal: Goal | null;
  goalId: string | null;
  goalSnapshot: ReturnType<typeof serializeGoalSnapshot> | null;
};

/** Resolve the goal to attach when freezing a checkpoint. */
export async function resolveFreezeGoal(
  periodEnd: Date,
  attachments: FreezeAttachments,
): Promise<ResolvedFreezeGoal> {
  const goal = attachments.goal ?? (await getActiveGoalAt(periodEnd));
  return {
    goal,
    goalId: attachments.goalId ?? goal?.id ?? null,
    goalSnapshot: goal ? serializeGoalSnapshot(goal) : null,
  };
}
