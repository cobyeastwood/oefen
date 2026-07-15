export type DistanceUnit = 'km' | 'mi';
export type GoalType = 'race_time' | 'distance';
export type DistancePeriod = 'week' | 'month' | 'year';

export type DistancePeriodMetric =
  | 'weekly_distance'
  | 'monthly_distance'
  | 'yearly_distance';

export type DistancePreset = {
  id: string;
  label: string;
  unit: DistanceUnit;
  value: number;
};

export type DistancePeriodOption = {
  id: DistancePeriod;
  label: string;
  shortLabel: string;
  metric: DistancePeriodMetric;
};

export type DeadlineMonthOption = {
  months: number;
  label: string;
};

export type DeadlineProgress = {
  deadlineAt: string;
  totalSpanMs: number;
  remainingMs: number;
  remainingRatio: number;
};

export type GoalRevision = 'update' | 'replace';

export type SetGoalInput = {
  type: GoalType;
  /** Required when type is distance */
  period?: DistancePeriod;
  /** Race distance in meters (race_time only) */
  distanceM?: number;
  /**
   * Race time in seconds, or volume distance in meters for distance goals.
   */
  targetValue: number;
  /** Whole months from now (1–18). Preferred over arbitrary deadline dates. */
  deadlineMonths?: number | null;
  deadline?: Date | null;
  note?: string | null;
  revision?: GoalRevision;
};
