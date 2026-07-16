export type CheckpointPace = {
  /** Fraction of goal→deadline span elapsed; null when there is no deadline. */
  elapsedRatio: number | null;
  /** goalProgress.ratio when present. */
  progressRatio: number | null;
  /**
   * Race: bestAttempt − target (sec). Volume: target − current window (m).
   * Null when the attempt/current value is unavailable.
   */
  gapToTarget: number | null;
  /** Volume goals: how many of the recent weekly windows met target. */
  weeksMeetingTarget: { hit: number; of: number } | null;
};

export type DeadlineMilestone = 0.75 | 0.5 | 0.25;

export type CheckpointMetrics = {
  totalDistanceM: number;
  sessionCount: number;
  avgPaceSecPerKm: number | null;
  avgHrBpm: number | null;
  /** Best implied mile time from session average pace (sessions ≥ 1 mile). */
  fastestMileSec: number | null;
  /** Best race-equivalent attempt (seconds) or volume in window (meters). */
  bestAttemptValue: number | null;
  bestAttemptKind: 'race_time_sec' | 'distance_m' | null;
  goalProgress: {
    targetMetric: string;
    targetValue: number;
    currentValue: number;
    ratio: number | null;
    remaining: number | null;
  } | null;
  deadline: {
    deadlineAt: string;
    totalSpanMs: number;
    remainingMs: number;
    remainingRatio: number;
    elapsedRatio: number;
  } | null;
  /** Side-by-side elapsed vs progress and gap-to-target for summaries. */
  pace: CheckpointPace | null;
  /** Remaining-ratio threshold that triggered a deadline_quarter freeze. */
  milestone?: DeadlineMilestone;
};
