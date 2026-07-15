import type {
  DeadlineMonthOption,
  DistancePeriod,
  DistancePeriodOption,
  DistancePreset,
  DistanceUnit,
  GoalType,
} from '@oefen/shared/types';

export type {
  DeadlineMonthOption,
  DeadlineProgress,
  DistancePeriod,
  DistancePeriodMetric,
  DistancePeriodOption,
  DistancePreset,
  DistanceUnit,
  GoalType,
} from '@oefen/shared/types';

export const METERS_PER_KM = 1000;
export const METERS_PER_MILE = 1609.344;
export const MS_DAY = 24 * 60 * 60 * 1000;
export const MS_WEEK = 7 * MS_DAY;

export const DISTANCE_PRESETS: DistancePreset[] = [
  { id: '5km', label: '5 km', unit: 'km', value: 5 },
  { id: '10km', label: '10 km', unit: 'km', value: 10 },
  { id: 'half-km', label: 'Half marathon', unit: 'km', value: 21.097 },
  { id: 'marathon-km', label: 'Marathon', unit: 'km', value: 42.195 },
  { id: '1mi', label: '1 mile', unit: 'mi', value: 1 },
  { id: '5mi', label: '5 miles', unit: 'mi', value: 5 },
  { id: '10mi', label: '10 miles', unit: 'mi', value: 10 },
  { id: 'half-mi', label: 'Half marathon', unit: 'mi', value: 13.1 },
  { id: 'marathon-mi', label: 'Marathon', unit: 'mi', value: 26.2 },
];

export const GOAL_TYPES: Array<{ id: GoalType; label: string }> = [
  { id: 'race_time', label: 'Race time' },
  { id: 'distance', label: 'Distance' },
];

export const DISTANCE_PERIODS: DistancePeriodOption[] = [
  { id: 'week', label: 'Week', shortLabel: 'week', metric: 'weekly_distance' },
  {
    id: 'month',
    label: 'Month',
    shortLabel: 'month',
    metric: 'monthly_distance',
  },
  { id: 'year', label: 'Year', shortLabel: 'year', metric: 'yearly_distance' },
];

/** Allowed deadline offsets: 1–18 months from the anchor day. */
export const DEADLINE_MONTH_OPTIONS: DeadlineMonthOption[] = Array.from(
  { length: 18 },
  (_, index) => {
    const months = index + 1;
    return {
      months,
      label: months === 1 ? '1 month' : `${months} months`,
    };
  },
);

export const DEFAULT_GOAL_DISTANCE_M = 5000;
export const DEFAULT_DISTANCE_UNIT: DistanceUnit = 'km';
export const DEFAULT_DISTANCE_PRESET_ID = '5km';
export const DEFAULT_GOAL_TYPE: GoalType = 'race_time';
export const DEFAULT_DISTANCE_PERIOD: DistancePeriod = 'week';
export const DEFAULT_VOLUME_DISTANCE = 40;
export const DEFAULT_DEADLINE_MONTHS = 3;
