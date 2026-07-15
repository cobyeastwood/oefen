import type {
  DistancePeriod,
  DistancePeriodMetric,
  GoalType,
} from '@oefen/shared/types';

import {
  DEFAULT_DISTANCE_PERIOD,
  DISTANCE_PERIODS,
  METERS_PER_KM,
} from './goal-constants';
import { getDistancePeriod } from './goal-distance';

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
