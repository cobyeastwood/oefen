import type { GarminConnectClient } from '@oefen/garmin';

import { collectWellnessDates } from './collect-wellness-dates';
import { fetchWellnessForDay } from './fetch-wellness-day';
import { persistWellnessDay } from './persist-wellness-day';
import type { ActivityDraft } from './types';

export type SyncWellnessResult = {
  days: number;
  upserted: number;
};

/** Sync day-level Garmin wellness and attach sessions by UTC calendar date. */
export async function syncWellness(
  client: GarminConnectClient,
  activities: ActivityDraft[],
  now = new Date(),
): Promise<SyncWellnessResult> {
  const dates = collectWellnessDates(activities, now);
  let upserted = 0;

  for (const calendarDate of dates) {
    const payload = await fetchWellnessForDay(client, calendarDate);
    await persistWellnessDay(payload);
    upserted += 1;
  }

  return { days: dates.length, upserted };
}
