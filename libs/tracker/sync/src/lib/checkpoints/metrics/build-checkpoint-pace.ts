import type { CheckpointMetrics, CheckpointPace } from './types';

/** Build pace fields from already-computed goal/deadline metrics. */
export function buildCheckpointPace(input: {
  deadline: CheckpointMetrics['deadline'];
  goalProgress: CheckpointMetrics['goalProgress'];
  weeksMeetingTarget?: CheckpointPace['weeksMeetingTarget'];
}): CheckpointPace | null {
  const { deadline, goalProgress } = input;
  const weeksMeetingTarget = input.weeksMeetingTarget ?? null;

  if (!deadline && !goalProgress && !weeksMeetingTarget) {
    return null;
  }

  return {
    elapsedRatio: deadline?.elapsedRatio ?? null,
    progressRatio: goalProgress?.ratio ?? null,
    gapToTarget: goalProgress?.remaining ?? null,
    weeksMeetingTarget,
  };
}

type MetricsLike = {
  goalProgress?: {
    ratio: number | null;
  } | null;
};

function weekMetTarget(metrics: MetricsLike | null | undefined): boolean {
  const ratio = metrics?.goalProgress?.ratio;
  return ratio != null && ratio >= 1;
}

/**
 * Count how many of the recent weekly windows met the volume target.
 * `current` is included when freezing a weekly window; priors are oldest→newest
 * or newest-first — order does not matter for the count.
 */
export function countWeeksMeetingTarget(
  priorWeeklyMetrics: Array<MetricsLike | null | undefined>,
  current?: MetricsLike | null,
): CheckpointPace['weeksMeetingTarget'] {
  const weeks: Array<MetricsLike | null | undefined> = [];
  if (current) {
    weeks.push(current);
  }
  for (const prior of priorWeeklyMetrics) {
    if (weeks.length >= 4) {
      break;
    }
    weeks.push(prior);
  }

  if (weeks.length === 0) {
    return null;
  }

  let hit = 0;
  for (const week of weeks) {
    if (weekMetTarget(week)) {
      hit += 1;
    }
  }
  return { hit, of: weeks.length };
}

/** Parse frozen metrics JSON into a typed metrics object when possible. */
export function readCheckpointMetrics(
  metricsJson: unknown,
): CheckpointMetrics | null {
  if (!metricsJson || typeof metricsJson !== 'object') {
    return null;
  }
  return metricsJson as CheckpointMetrics;
}
