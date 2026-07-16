import type { VolumeDelta } from './types';

/**
 * Compare this week's volume to the mean of prior weekly windows.
 * Needs ≥2 prior weeks with a positive trailing mean; otherwise null.
 */
export function volumeDelta(
  weekDistanceM: number,
  priorWeeks: Array<{ distanceM: number }>,
): VolumeDelta | null {
  if (priorWeeks.length < 2) {
    return null;
  }

  const trailingMeanM =
    priorWeeks.reduce((sum, week) => sum + week.distanceM, 0) /
    priorWeeks.length;
  if (trailingMeanM <= 0) {
    return null;
  }

  return {
    weekDistanceM,
    trailingMeanM,
    pctChange: (weekDistanceM - trailingMeanM) / trailingMeanM,
    basisWeeks: priorWeeks.length,
    loadRatio: weekDistanceM / trailingMeanM,
  };
}
