import { listActiveGoals, updateGoalStatus } from '@oefen/shared/database';

/** Ensure at most one tip remains active by abandoning any sibling tips. */
export async function abandonOtherActiveTips(keepId?: string) {
  const tips = await listActiveGoals();
  for (const tip of tips) {
    if (tip.id === keepId) continue;
    await updateGoalStatus(tip.id, 'abandoned');
  }
}
