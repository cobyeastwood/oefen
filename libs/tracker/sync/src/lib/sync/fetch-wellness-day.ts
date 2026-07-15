import type { GarminConnectClient } from '@oefen/garmin';

import { normalizeWellnessDay } from './normalize-wellness-day';
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

/** Fetch and normalize Garmin wellness fields for one UTC calendar day. */
export async function fetchWellnessForDay(
  client: GarminConnectClient,
  calendarDate: Date,
): Promise<WellnessDayPayload> {
  // Sequential on purpose — Garmin rate-limits bursts (Promise.all stampedes).
  const steps = await readOptional('steps', () => client.getSteps(calendarDate));
  const sleepData = await readOptional('sleep', () =>
    client.getSleepData(calendarDate),
  );
  const heartRate = await readOptional('heartRate', () =>
    client.getHeartRate(calendarDate),
  );
  const weightPounds = await readOptional('weight', () =>
    client.getDailyWeightInPounds(calendarDate),
  );
  const hydrationOz = await readOptional('hydration', () =>
    client.getDailyHydration(calendarDate),
  );

  return normalizeWellnessDay({
    calendarDate,
    steps: typeof steps === 'number' ? steps : null,
    sleepData,
    heartRate,
    weightPounds: typeof weightPounds === 'number' ? weightPounds : null,
    hydrationOz: typeof hydrationOz === 'number' ? hydrationOz : null,
  });
}
