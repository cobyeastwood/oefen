import type { Goal, Session } from '@prisma/client';
import {
  DEFAULT_GOAL_DISTANCE_M,
  deadlineProgress,
  distanceMFromGoalMetric,
  goalTypeFromMetric,
} from '@oefen/utils';

import { aggregateSessionTotals } from './aggregate-session-totals';
import {
  raceEquivalentSec,
  sessionImpliedMilePaceSec,
} from './race-equivalent-sec';
import type { CheckpointMetrics } from './types';

const METERS_PER_KM = 1000;

/** Compute frozen checkpoint metrics from period sessions and optional goal. */
export function computeCheckpointMetrics(input: {
  sessions: Pick<Session, 'durationS' | 'distanceM' | 'avgHr'>[];
  goal?: Pick<
    Goal,
    'targetMetric' | 'targetValue' | 'deadline' | 'effectiveFrom'
  > | null;
  now?: Date;
}): CheckpointMetrics {
  const { sessions, goal } = input;
  const now = input.now ?? new Date();
  const totals = aggregateSessionTotals(sessions);

  const avgPaceSecPerKm =
    totals.distanceM > 0
      ? (totals.durationS / totals.distanceM) * METERS_PER_KM
      : null;

  const hrWeighted = sessions.reduce(
    (acc, session) => {
      if (session.avgHr == null) {
        return acc;
      }
      return {
        weighted: acc.weighted + session.avgHr * session.durationS,
        duration: acc.duration + session.durationS,
      };
    },
    { weighted: 0, duration: 0 },
  );

  const avgHrBpm =
    hrWeighted.duration > 0 ? hrWeighted.weighted / hrWeighted.duration : null;

  const milePaces = sessions
    .map((session) => sessionImpliedMilePaceSec(session))
    .filter((value): value is number => value != null);
  const fastestMileSec = milePaces.length > 0 ? Math.min(...milePaces) : null;

  let bestAttemptValue: number | null = null;
  let bestAttemptKind: CheckpointMetrics['bestAttemptKind'] = null;
  let goalProgress: CheckpointMetrics['goalProgress'] = null;

  if (goal) {
    const type = goalTypeFromMetric(goal.targetMetric);

    if (type === 'race_time') {
      const raceDistanceM =
        distanceMFromGoalMetric(goal.targetMetric) ?? DEFAULT_GOAL_DISTANCE_M;
      const attempts = sessions
        .map((session) => raceEquivalentSec(session, raceDistanceM))
        .filter((value): value is number => value != null);
      bestAttemptValue = attempts.length > 0 ? Math.min(...attempts) : null;
      bestAttemptKind = 'race_time_sec';

      const remaining =
        bestAttemptValue == null ? null : bestAttemptValue - goal.targetValue;
      goalProgress = {
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        currentValue: bestAttemptValue ?? 0,
        ratio:
          bestAttemptValue != null && bestAttemptValue > 0
            ? goal.targetValue / bestAttemptValue
            : null,
        remaining,
      };
    } else {
      bestAttemptValue = totals.distanceM;
      bestAttemptKind = 'distance_m';
      goalProgress = {
        targetMetric: goal.targetMetric,
        targetValue: goal.targetValue,
        currentValue: totals.distanceM,
        ratio:
          goal.targetValue > 0 ? totals.distanceM / goal.targetValue : null,
        remaining: goal.targetValue - totals.distanceM,
      };
    }
  }

  let deadline: CheckpointMetrics['deadline'] = null;
  if (goal?.deadline) {
    deadline = deadlineProgress(goal.effectiveFrom, goal.deadline, now);
  }

  return {
    totalDistanceM: totals.distanceM,
    sessionCount: totals.sessionCount,
    avgPaceSecPerKm,
    avgHrBpm,
    fastestMileSec,
    bestAttemptValue,
    bestAttemptKind,
    goalProgress,
    deadline,
  };
}
