import {
  attachSessionsToWellness,
  upsertWellness,
} from '@oefen/shared/database';

import type { WellnessDayPayload } from './types';

/** Upsert a Wellness row and attach same-day sessions that lack a link. */
export async function persistWellnessDay(payload: WellnessDayPayload) {
  const row = await upsertWellness(payload);
  await attachSessionsToWellness(payload.calendarDate, row.id);
  return row;
}
