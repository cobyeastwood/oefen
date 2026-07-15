export type DistanceUnit = 'km' | 'mi';
export type GoalType = 'race_time' | 'distance';
export type DistancePeriod = 'week' | 'month' | 'year';

export type DistancePeriodMetric =
  | 'weekly_distance'
  | 'monthly_distance'
  | 'yearly_distance';

const METERS_PER_KM = 1000;
const METERS_PER_MILE = 1609.344;
export const MS_DAY = 24 * 60 * 60 * 1000;
export const MS_WEEK = 7 * MS_DAY;

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

export function distanceMFromUnitValue(
  unit: DistanceUnit,
  value: number,
): number {
  return unit === 'km'
    ? Math.round(value * METERS_PER_KM)
    : Math.round(value * METERS_PER_MILE);
}

export function unitValueFromDistanceM(
  unit: DistanceUnit,
  distanceM: number,
): number {
  const value =
    unit === 'km' ? distanceM / METERS_PER_KM : distanceM / METERS_PER_MILE;
  return Math.round(value * 100) / 100;
}

export function presetToDistanceM(preset: DistancePreset): number {
  return distanceMFromUnitValue(preset.unit, preset.value);
}

export function presetsForUnit(unit: DistanceUnit): DistancePreset[] {
  return DISTANCE_PRESETS.filter((preset) => preset.unit === unit);
}

export function getDistancePreset(id: string): DistancePreset | undefined {
  return DISTANCE_PRESETS.find((preset) => preset.id === id);
}

export function getDistancePeriod(
  id: DistancePeriod,
): DistancePeriodOption | undefined {
  return DISTANCE_PERIODS.find((period) => period.id === id);
}

export function goalMetricFromDistanceM(distanceM: number): string {
  return `${Math.round(distanceM)}m_time`;
}

export function isVolumeMetric(metric: string): metric is DistancePeriodMetric {
  return DISTANCE_PERIODS.some((period) => period.metric === metric);
}

export function distancePeriodFromMetric(
  metric: string,
): DistancePeriod | null {
  const match = DISTANCE_PERIODS.find((period) => period.metric === metric);
  return match?.id ?? null;
}

export function goalTypeFromMetric(metric: string): GoalType {
  return isVolumeMetric(metric) ? 'distance' : 'race_time';
}

export function goalMetricForGoal(input: {
  type: GoalType;
  period?: DistancePeriod;
  distanceM?: number;
}): string {
  if (input.type === 'race_time') {
    if (input.distanceM == null) {
      throw new Error('distanceM is required for race_time goals');
    }
    return goalMetricFromDistanceM(input.distanceM);
  }

  const period = input.period ?? DEFAULT_DISTANCE_PERIOD;
  const option = getDistancePeriod(period);
  if (!option) {
    throw new Error(`Unknown distance period: ${period}`);
  }
  return option.metric;
}

export function unitForGoalType(type: GoalType): string {
  return type === 'race_time' ? 'seconds' : 'meters';
}

export function distanceMFromGoalMetric(metric: string): number | null {
  if (isVolumeMetric(metric)) {
    return null;
  }

  const metersMatch = metric.match(/^(\d+)m_time$/);
  if (metersMatch) {
    return Number(metersMatch[1]);
  }

  if (metric === '5k_time') {
    return 5000;
  }

  const kmMatch = metric.match(/^(\d+(?:\.\d+)?)k_time$/);
  if (kmMatch) {
    return Math.round(Number(kmMatch[1]) * METERS_PER_KM);
  }

  return null;
}

export function findPresetForDistanceM(
  distanceM: number,
): { unit: DistanceUnit; presetId: string } | null {
  for (const preset of DISTANCE_PRESETS) {
    if (Math.abs(presetToDistanceM(preset) - distanceM) <= 100) {
      return { unit: preset.unit, presetId: preset.id };
    }
  }
  return null;
}

export function formatGoalDistanceLabel(distanceM: number): string {
  const match = findPresetForDistanceM(distanceM);
  if (match) {
    const preset = getDistancePreset(match.presetId);
    if (preset) {
      return preset.label;
    }
  }

  const km = distanceM / METERS_PER_KM;
  if (Math.abs(km - Math.round(km)) < 0.05) {
    return `${Math.round(km)} km`;
  }

  const miles = distanceM / METERS_PER_MILE;
  if (Math.abs(miles - Math.round(miles * 10) / 10) < 0.05) {
    return `${miles.toFixed(1)} mi`;
  }

  return `${km.toFixed(1)} km`;
}

export function formatVolumeTargetLabel(
  distanceM: number,
  unit: DistanceUnit,
  period: DistancePeriod,
): string {
  const value = unitValueFromDistanceM(unit, distanceM);
  const option = getDistancePeriod(period);
  const periodLabel = option?.shortLabel ?? period;
  const rounded =
    Math.abs(value - Math.round(value)) < 0.05
      ? String(Math.round(value))
      : value.toFixed(1);
  return `${rounded} ${unit} / ${periodLabel}`;
}

export function formatGoalTargetLabel(
  goal: {
    targetMetric: string;
    targetValue: number;
  },
  preferUnit: DistanceUnit = 'km',
): string {
  const type = goalTypeFromMetric(goal.targetMetric);

  if (type === 'race_time') {
    const distanceM =
      distanceMFromGoalMetric(goal.targetMetric) ?? DEFAULT_GOAL_DISTANCE_M;
    return `${formatSecondsAsMmSs(goal.targetValue)} · ${formatGoalDistanceLabel(distanceM)}`;
  }

  const period =
    distancePeriodFromMetric(goal.targetMetric) ?? DEFAULT_DISTANCE_PERIOD;
  return formatVolumeTargetLabel(goal.targetValue, preferUnit, period);
}

export function formatGoalDeadlineLabel(
  deadline: Date | string | null | undefined,
): string | null {
  if (!deadline) return null;
  const date = typeof deadline === 'string' ? new Date(deadline) : deadline;
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function goalTypeLabel(type: GoalType): string {
  return GOAL_TYPES.find((item) => item.id === type)?.label ?? type;
}

export function parseMmSsToSeconds(value: string): number | null {
  const match = value.trim().match(/^(\d+):(\d{2})$/);
  if (!match) {
    return null;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);

  if (seconds >= 60) {
    return null;
  }

  return minutes * 60 + seconds;
}

export function formatSecondsAsMmSs(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function isValidRaceDistanceM(distanceM: number): boolean {
  return Number.isFinite(distanceM) && distanceM >= 400 && distanceM <= 100_000;
}

export function isValidVolumeDistanceM(distanceM: number): boolean {
  return (
    Number.isFinite(distanceM) && distanceM >= 1000 && distanceM <= 1_000_000
  );
}

export function isValidDistancePeriod(
  period: string,
): period is DistancePeriod {
  return DISTANCE_PERIODS.some((item) => item.id === period);
}

export function isValidDeadlineMonths(months: number): boolean {
  return Number.isInteger(months) && months >= 1 && months <= 18;
}

/** Add calendar months keeping the day-of-month when possible. */
export function addMonths(anchor: Date, months: number): Date {
  const result = new Date(anchor.getTime());
  const day = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months, 1);
  const maxDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, maxDay));
  return result;
}

export function deadlineFromMonths(
  months: number,
  anchor: Date = new Date(),
): Date {
  if (!isValidDeadlineMonths(months)) {
    throw new Error('Deadline must be 1–18 months from the start day');
  }
  return addMonths(anchor, months);
}

export function monthsBetweenDeadlines(
  anchor: Date,
  deadline: Date,
): number | null {
  for (const option of DEADLINE_MONTH_OPTIONS) {
    const candidate = addMonths(anchor, option.months);
    if (Math.abs(candidate.getTime() - deadline.getTime()) < MS_DAY) {
      return option.months;
    }
  }
  return null;
}

export function isValidGoalDeadline(
  deadline: Date,
  anchor: Date = new Date(),
): boolean {
  return monthsBetweenDeadlines(anchor, deadline) != null;
}

export type DeadlineProgress = {
  deadlineAt: string;
  totalSpanMs: number;
  remainingMs: number;
  remainingRatio: number;
};

/** Remaining time relative to the full goal→deadline span. */
export function deadlineProgress(
  effectiveFrom: Date,
  deadline: Date,
  now: Date = new Date(),
): DeadlineProgress | null {
  const totalSpanMs = deadline.getTime() - effectiveFrom.getTime();
  if (totalSpanMs <= 0) {
    return null;
  }

  const remainingMs = Math.max(0, deadline.getTime() - now.getTime());
  return {
    deadlineAt: deadline.toISOString(),
    totalSpanMs,
    remainingMs,
    remainingRatio: remainingMs / totalSpanMs,
  };
}
