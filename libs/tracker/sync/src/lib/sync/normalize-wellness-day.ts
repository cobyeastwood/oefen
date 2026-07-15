import { readNumber } from '@oefen/shared/utils';

import type { WellnessDayPayload } from './types';

function positive(value: number | null | undefined): number | null {
  return value != null && value > 0 ? value : null;
}

type HeartRateFields = {
  restingHeartRate?: unknown;
  minHeartRate?: unknown;
  maxHeartRate?: unknown;
};

function extractDailySleepDto(
  sleepData: unknown,
): Record<string, unknown> | undefined {
  if (!sleepData || typeof sleepData !== 'object') {
    return undefined;
  }
  return (sleepData as { dailySleepDTO?: Record<string, unknown> })
    .dailySleepDTO;
}

function extractHeartRateFields(
  heartRate: unknown,
): HeartRateFields | null {
  if (!heartRate || typeof heartRate !== 'object') {
    return null;
  }
  return heartRate as HeartRateFields;
}

/** Prefer sleepTimeSeconds; else derive from sleep start/end GMT timestamps. */
function sleepSecondsFromDto(
  sleepDto: Record<string, unknown> | undefined,
): number | null {
  const sleepFromDto = readNumber(sleepDto?.['sleepTimeSeconds']);
  if (sleepFromDto != null && sleepFromDto > 0) {
    return sleepFromDto;
  }

  const start = readNumber(sleepDto?.['sleepStartTimestampGMT']);
  const end = readNumber(sleepDto?.['sleepEndTimestampGMT']);
  if (start == null || end == null || end <= start) {
    return null;
  }

  return positive(Math.round((end - start) / 1000));
}

function normalizeSteps(steps: number | null): number | null {
  return steps != null && steps > 0 ? Math.round(steps) : null;
}

/** Normalize raw Garmin day payloads into persisted Wellness fields. */
export function normalizeWellnessDay(input: {
  calendarDate: Date;
  steps: number | null;
  sleepData: unknown;
  heartRate: unknown;
  weightPounds: number | null;
  hydrationOz: number | null;
}): WellnessDayPayload {
  const sleepDto = extractDailySleepDto(input.sleepData);
  const hr = extractHeartRateFields(input.heartRate);

  return {
    calendarDate: input.calendarDate,
    steps: normalizeSteps(input.steps),
    sleepSeconds: sleepSecondsFromDto(sleepDto),
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
