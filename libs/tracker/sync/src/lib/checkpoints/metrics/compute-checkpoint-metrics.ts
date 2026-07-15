import type { Goal, Session } from '@prisma/client';
import {
  DEFAULT_GOAL_DISTANCE_M,
  deadlineProgress,
  distanceMFromGoalMetric,
  goalTypeFromMetric,
} from '@oefen/shared/utils';

import { aggregateSessionTotals } from './aggregate-session-totals';
import {
  raceEquivalentSec,
  sessionImpliedMilePaceSec,
} from './race-equivalent-sec';
import type { CheckpointMetrics } from './types';

const METERS_PER_KM = 1000;

type SessionSlice = Pick<Session, 'durationS' | 'distanceM' | 'avgHr'>;
type GoalSlice = Pick<
  Goal,
  'targetMetric' | 'targetValue' | 'deadline' | 'effectiveFrom'
>;

type GoalAttempt = Pick<
  CheckpointMetrics,
  'bestAttemptValue' | 'bestAttemptKind' | 'goalProgress'
>;

export function avgPacePerKm(totals: {
  durationS: number;
  distanceM: number;
}): number | null {
  if (totals.distanceM <= 0) {
    return null;
  }
  return (totals.durationS / totals.distanceM) * METERS_PER_KM;
}

/** Duration-weighted average HR; null readings and zero-duration parts are skipped. */
export function weightedAvgHr(
  sessions: Array<Pick<SessionSlice, 'avgHr' | 'durationS'>>,
): number | null {
  let weighted = 0;
  let duration = 0;
  for (const session of sessions) {
    if (session.avgHr == null) {
      continue;
    }
    weighted += session.avgHr * session.durationS;
    duration += session.durationS;
  }
  return duration > 0 ? weighted / duration : null;
}

export function fastestMile(
  sessions: Array<Pick<SessionSlice, 'durationS' | 'distanceM'>>,
): number | null {
  const milePaces = sessions
    .map((session) => sessionImpliedMilePaceSec(session))
    .filter((value): value is number => value != null);
  return milePaces.length > 0 ? Math.min(...milePaces) : null;
}

function buildRaceTimeGoalMetrics(
  sessions: SessionSlice[],
  goal: GoalSlice,
): GoalAttempt {
  const raceDistanceM =
    distanceMFromGoalMetric(goal.targetMetric) ?? DEFAULT_GOAL_DISTANCE_M;
  const attempts = sessions
    .map((session) => raceEquivalentSec(session, raceDistanceM))
    .filter((value): value is number => value != null);
  const bestAttemptValue = attempts.length > 0 ? Math.min(...attempts) : null;

  return {
    bestAttemptValue,
    bestAttemptKind: 'race_time_sec',
    goalProgress: {
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue,
      currentValue: bestAttemptValue ?? 0,
      ratio:
        bestAttemptValue != null && bestAttemptValue > 0
          ? goal.targetValue / bestAttemptValue
          : null,
      remaining:
        bestAttemptValue == null ? null : bestAttemptValue - goal.targetValue,
    },
  };
}

function buildVolumeGoalMetrics(
  totals: { distanceM: number },
  goal: GoalSlice,
): GoalAttempt {
  return {
    bestAttemptValue: totals.distanceM,
    bestAttemptKind: 'distance_m',
    goalProgress: {
      targetMetric: goal.targetMetric,
      targetValue: goal.targetValue,
      currentValue: totals.distanceM,
      ratio: goal.targetValue > 0 ? totals.distanceM / goal.targetValue : null,
      remaining: goal.targetValue - totals.distanceM,
    },
  };
}

function buildGoalAttempt(
  sessions: SessionSlice[],
  totals: { distanceM: number },
  goal: GoalSlice | null | undefined,
): GoalAttempt {
  if (!goal) {
    return {
      bestAttemptValue: null,
      bestAttemptKind: null,
      goalProgress: null,
    };
  }

  return goalTypeFromMetric(goal.targetMetric) === 'race_time'
    ? buildRaceTimeGoalMetrics(sessions, goal)
    : buildVolumeGoalMetrics(totals, goal);
}

/** Compute frozen checkpoint metrics from period sessions and optional goal. */
export function checkpointMetrics(input: {
  sessions: SessionSlice[];
  goal?: GoalSlice | null;
  now?: Date;
}): CheckpointMetrics {
  const { sessions, goal } = input;
  const now = input.now ?? new Date();
  const totals = aggregateSessionTotals(sessions);
  const attempt = buildGoalAttempt(sessions, totals, goal);

  return {
    totalDistanceM: totals.distanceM,
    sessionCount: totals.sessionCount,
    avgPaceSecPerKm: avgPacePerKm(totals),
    avgHrBpm: weightedAvgHr(sessions),
    fastestMileSec: fastestMile(sessions),
    bestAttemptValue: attempt.bestAttemptValue,
    bestAttemptKind: attempt.bestAttemptKind,
    goalProgress: attempt.goalProgress,
    deadline: goal?.deadline
      ? deadlineProgress(goal.effectiveFrom, goal.deadline, now)
      : null,
  };
}
