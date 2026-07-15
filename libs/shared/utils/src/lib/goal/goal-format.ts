import type { DistancePeriod, DistanceUnit, GoalType } from '@oefen/shared/types';

import {
  DEFAULT_DISTANCE_PERIOD,
  DEFAULT_GOAL_DISTANCE_M,
  GOAL_TYPES,
  METERS_PER_KM,
  METERS_PER_MILE,
} from './goal-constants';
import {
  findPresetForDistanceM,
  getDistancePeriod,
  getDistancePreset,
  fromMeters,
} from './goal-distance';
import {
  distanceMFromGoalMetric,
  distancePeriodFromMetric,
  goalTypeFromMetric,
} from './goal-metric';
import { formatMmSs } from './goal-time';

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
  const value = fromMeters(unit, distanceM);
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
    return `${formatMmSs(goal.targetValue)} · ${formatGoalDistanceLabel(distanceM)}`;
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
