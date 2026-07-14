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
  } | null;
};
