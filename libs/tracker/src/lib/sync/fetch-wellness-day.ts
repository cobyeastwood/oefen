import type { GarminConnectClient } from '@oefen/garmin';

import {
  normalizeWellnessDay,
  sleepDurationToSeconds,
} from './normalize-wellness-day';
import type { WellnessDayPayload } from './types';

export type { WellnessDayPayload } from './types';

async function readOptional<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.warn(
      `Wellness ${label} failed:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function sleepSecondsFromDuration(
  client: GarminConnectClient,
  calendarDate: Date,
): Promise<number | null> {
  const duration = await readOptional('sleepDuration', () =>
    client.getSleepDuration(calendarDate),
  );
  if (!duration || typeof duration !== 'object') {
    return null;
  }
  return sleepDurationToSeconds(
    duration as { hours?: unknown; minutes?: unknown },
  );
}

/** Fetch and normalize Garmin wellness fields for one UTC calendar day. */
export async function fetchWellnessForDay(
  client: GarminConnectClient,
  calendarDate: Date,
): Promise<WellnessDayPayload> {
  const [steps, sleepData, heartRate, weightPounds, hydrationOz] =
    await Promise.all([
      readOptional('steps', () => client.getSteps(calendarDate)),
      readOptional('sleep', () => client.getSleepData(calendarDate)),
      readOptional('heartRate', () => client.getHeartRate(calendarDate)),
      readOptional('weight', () => client.getDailyWeightInPounds(calendarDate)),
      readOptional('hydration', () => client.getDailyHydration(calendarDate)),
    ]);

  const sleepSecondsFallback = await sleepSecondsFromDuration(
    client,
    calendarDate,
  );

  return normalizeWellnessDay({
    calendarDate,
    steps: typeof steps === 'number' ? steps : null,
    sleepData,
    sleepSecondsFallback,
    heartRate,
    weightPounds: typeof weightPounds === 'number' ? weightPounds : null,
    hydrationOz: typeof hydrationOz === 'number' ? hydrationOz : null,
  });
}
