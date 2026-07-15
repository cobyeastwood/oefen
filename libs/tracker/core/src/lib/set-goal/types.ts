import type { DistancePeriod, GoalType } from '@oefen/shared/utils';

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
