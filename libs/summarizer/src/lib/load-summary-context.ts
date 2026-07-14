import {
  getActiveGoalAt,
  getCheckpointById,
  findPriorCheckpoint,
} from '@oefen/database';
import type { WellnessAverages } from '@oefen/utils';

import { goalTargetFromSnapshot } from './goal-target-from-snapshot';
import { loadWellnessAveragesForPeriod } from './load-wellness-averages';

export type SummaryContext = {
  checkpoint: NonNullable<Awaited<ReturnType<typeof getCheckpointById>>>;
  prior: Awaited<ReturnType<typeof findPriorCheckpoint>>;
  goalTarget: number | null;
  wellness: WellnessAverages;
  priorWellness: WellnessAverages | null;
};

/** Load checkpoint, prior period, goal target, and period wellness averages. */
export async function loadSummaryContext(
  checkpointId: string,
): Promise<SummaryContext> {
  const checkpoint = await getCheckpointById(checkpointId);
  if (!checkpoint) {
    throw new Error('Checkpoint not found');
  }

  const [prior, activeGoal, wellness] = await Promise.all([
    findPriorCheckpoint(checkpoint.type, checkpoint.periodEnd),
    getActiveGoalAt(checkpoint.periodEnd),
    loadWellnessAveragesForPeriod(
      checkpoint.periodStart,
      checkpoint.periodEnd,
    ),
  ]);

  const priorWellness = prior
    ? await loadWellnessAveragesForPeriod(prior.periodStart, prior.periodEnd)
    : null;

  return {
    checkpoint,
    prior,
    goalTarget:
      goalTargetFromSnapshot(checkpoint.goalSnapshot) ??
      activeGoal?.targetValue ??
      null,
    wellness,
    priorWellness,
  };
}
