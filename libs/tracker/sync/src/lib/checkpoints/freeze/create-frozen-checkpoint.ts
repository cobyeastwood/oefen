import type { CheckpointType, Goal, Session } from '@prisma/client';
import {
  createCheckpoint,
  findCheckpointByPeriod,
  isUniqueViolation,
  listPriorCheckpoints,
  type GoalSnapshot,
} from '@oefen/shared/database';
import { goalTypeFromMetric } from '@oefen/shared/utils';

import {
  aggregateSessionTotals,
  buildCheckpointPace,
  checkpointMetrics,
  countWeeksMeetingTarget,
  readCheckpointMetrics,
  volumeDelta,
  type DeadlineMilestone,
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
  milestone?: DeadlineMilestone;
};

function weeksMeetingTargetFromPriors(input: {
  type: CheckpointType;
  goal: Goal | null;
  draftMetrics: ReturnType<typeof checkpointMetrics>;
  priorWeekly: Awaited<ReturnType<typeof listPriorCheckpoints>>;
}) {
  if (!input.goal || goalTypeFromMetric(input.goal.targetMetric) !== 'distance') {
    return null;
  }

  const priorMetrics = input.priorWeekly.map((checkpoint) =>
    readCheckpointMetrics(checkpoint.metricsJson),
  );

  return countWeeksMeetingTarget(
    priorMetrics,
    input.type === 'weekly_since_goal' ? input.draftMetrics : null,
  );
}

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

  const priorWeekly = await listPriorCheckpoints(
    'weekly_since_goal',
    input.periodEnd,
    4,
    input.goalId,
  );

  const weeksMeetingTarget = weeksMeetingTargetFromPriors({
    type: input.type,
    goal: input.goal,
    draftMetrics: metrics,
    priorWeekly,
  });
  if (weeksMeetingTarget || metrics.pace) {
    metrics.pace = buildCheckpointPace({
      deadline: metrics.deadline,
      goalProgress: metrics.goalProgress,
      weeksMeetingTarget,
    });
  }
  if (input.milestone != null) {
    metrics.milestone = input.milestone;
  }
  if (input.type === 'weekly_since_goal') {
    metrics.volumeDelta = volumeDelta(
      totals.distanceM,
      priorWeekly.map((checkpoint) => ({ distanceM: checkpoint.distanceM })),
    );
  }

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
