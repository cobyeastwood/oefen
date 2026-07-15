import type { CheckpointType, Goal, Session } from '@prisma/client';
import {
  createCheckpoint,
  findCheckpointByPeriod,
  isUniqueViolation,
  type GoalSnapshot,
} from '@oefen/shared/database';

import {
  aggregateSessionTotals,
  checkpointMetrics,
} from '../metrics';
import type { FreezeResult } from './types';

type CreateFrozenCheckpointInput = {
  type: CheckpointType;
  periodStart: Date;
  periodEnd: Date;
  sessions: Pick<Session, 'durationS' | 'distanceM' | 'avgHr'>[];
  goal: Goal | null;
  goalId: string | null;
  goalSnapshot: GoalSnapshot | null;
  sessionId?: string | null;
};

/** Create the checkpoint row with computed metrics; recover from unique races. */
export async function createFrozenCheckpoint(
  input: CreateFrozenCheckpointInput,
): Promise<FreezeResult> {
  const totals = aggregateSessionTotals(input.sessions);
  const metrics = checkpointMetrics({
    sessions: input.sessions,
    goal: input.goal,
    now: input.periodEnd,
  });

  try {
    const checkpoint = await createCheckpoint({
      type: input.type,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      sessionCount: totals.sessionCount,
      durationS: totals.durationS,
      distanceM: totals.distanceM,
      metricsJson: metrics,
      goalId: input.goalId,
      goalSnapshot: input.goalSnapshot,
      sessionId: input.sessionId ?? null,
    });
    return { created: true, checkpointId: checkpoint.id };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }
    const raced = await findCheckpointByPeriod(
      input.type,
      input.periodStart,
      input.periodEnd,
    );
    return { created: false, checkpointId: raced?.id };
  }
}
