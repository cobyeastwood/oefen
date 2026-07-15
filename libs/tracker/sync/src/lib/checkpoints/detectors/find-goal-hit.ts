import {
  DEFAULT_GOAL_DISTANCE_M,
  distanceMFromGoalMetric,
  distancePeriodFromMetric,
  goalTypeFromMetric,
} from '@oefen/shared/utils';

import { findRaceGoalHit } from './find-race-goal-hit';
import { findVolumeGoalHit } from './find-volume-goal-hit';

type GoalHit = {
  periodStart: Date;
  periodEnd: Date;
  sessionId: string | null;
};

/** Resolve the first race-time or volume window that meets the active goal. */
export function findGoalHit(input: {
  goal: {
    targetMetric: string;
    targetValue: number;
    effectiveFrom: Date;
  };
  watermark: Date;
  now: Date;
  sessions: {
    id: string;
    durationS: number;
    distanceM: number;
    occurredAt: Date;
  }[];
}): GoalHit | null {
  const { goal, watermark, now, sessions } = input;
  const type = goalTypeFromMetric(goal.targetMetric);

  if (type === 'race_time') {
    const raceDistanceM =
      distanceMFromGoalMetric(goal.targetMetric) ?? DEFAULT_GOAL_DISTANCE_M;
    const relevant = sessions.filter(
      (session) => session.occurredAt.getTime() >= watermark.getTime(),
    );
    const hit = findRaceGoalHit(relevant, raceDistanceM, goal.targetValue);
    return hit
      ? {
          periodStart: watermark,
          periodEnd: hit.periodEnd,
          sessionId: hit.sessionId,
        }
      : null;
  }

  const period = distancePeriodFromMetric(goal.targetMetric) ?? 'week';
  const window = findVolumeGoalHit(
    period,
    goal.effectiveFrom,
    now,
    sessions,
    goal.targetValue,
  );
  return window
    ? {
        periodStart: window.periodStart,
        periodEnd: window.periodEnd,
        sessionId: null,
      }
    : null;
}
