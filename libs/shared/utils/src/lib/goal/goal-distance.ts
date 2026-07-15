import type { DistancePeriod, DistancePreset, DistanceUnit } from '@oefen/shared/types';

import {
  DISTANCE_PERIODS,
  DISTANCE_PRESETS,
  METERS_PER_KM,
  METERS_PER_MILE,
} from './goal-constants';

export function toMeters(
  unit: DistanceUnit,
  value: number,
): number {
  return unit === 'km'
    ? Math.round(value * METERS_PER_KM)
    : Math.round(value * METERS_PER_MILE);
}

export function fromMeters(
  unit: DistanceUnit,
  distanceM: number,
): number {
  const value =
    unit === 'km' ? distanceM / METERS_PER_KM : distanceM / METERS_PER_MILE;
  return Math.round(value * 100) / 100;
}

export function presetToDistanceM(preset: DistancePreset): number {
  return toMeters(preset.unit, preset.value);
}

export function presetsForUnit(unit: DistanceUnit): DistancePreset[] {
  return DISTANCE_PRESETS.filter((preset) => preset.unit === unit);
}

export function getDistancePreset(id: string): DistancePreset | undefined {
  return DISTANCE_PRESETS.find((preset) => preset.id === id);
}

export function getDistancePeriod(id: DistancePeriod) {
  return DISTANCE_PERIODS.find((period) => period.id === id);
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
