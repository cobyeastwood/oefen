import { readNumber } from '@oefen/utils';

import type { WellnessDayPayload } from './types';

function positive(value: number | null | undefined): number | null {
  return value != null && value > 0 ? value : null;
}

type HeartRateFields = {
  restingHeartRate?: unknown;
  minHeartRate?: unknown;
  maxHeartRate?: unknown;
};

/** Normalize raw Garmin day payloads into persisted Wellness fields. */
export function normalizeWellnessDay(input: {
  calendarDate: Date;
  steps: number | null;
  sleepData: unknown;
  sleepSecondsFallback: number | null;
  heartRate: unknown;
  weightPounds: number | null;
  hydrationOz: number | null;
}): WellnessDayPayload {
  const sleepDto =
    input.sleepData && typeof input.sleepData === 'object'
      ? (input.sleepData as { dailySleepDTO?: Record<string, unknown> })
          .dailySleepDTO
      : undefined;

  const sleepFromDto = readNumber(sleepDto?.['sleepTimeSeconds']);
  const sleepSeconds =
    sleepFromDto != null && sleepFromDto > 0
      ? sleepFromDto
      : input.sleepSecondsFallback;

  const hr =
    input.heartRate && typeof input.heartRate === 'object'
      ? (input.heartRate as HeartRateFields)
      : null;

  return {
    calendarDate: input.calendarDate,
    steps:
      input.steps != null && input.steps > 0 ? Math.round(input.steps) : null,
    sleepSeconds: positive(sleepSeconds),
    deepSleepSeconds: positive(readNumber(sleepDto?.['deepSleepSeconds'])),
    lightSleepSeconds: positive(readNumber(sleepDto?.['lightSleepSeconds'])),
    remSleepSeconds: positive(readNumber(sleepDto?.['remSleepSeconds'])),
    awakeSleepSeconds: positive(readNumber(sleepDto?.['awakeSleepSeconds'])),
    restingHeartRate: positive(readNumber(hr?.restingHeartRate)),
    minHeartRate: positive(readNumber(hr?.minHeartRate)),
    maxHeartRate: positive(readNumber(hr?.maxHeartRate)),
    weightPounds: positive(input.weightPounds),
    hydrationOz: positive(input.hydrationOz),
  };
}

/** Convert Garmin sleep duration hours/minutes into seconds. */
export function sleepDurationToSeconds(duration: {
  hours?: unknown;
  minutes?: unknown;
}): number | null {
  const hours = readNumber(duration.hours) ?? 0;
  const minutes = readNumber(duration.minutes) ?? 0;
  return positive(Math.round(hours * 3600 + minutes * 60));
}
