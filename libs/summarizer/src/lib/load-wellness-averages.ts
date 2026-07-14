import {
  listWellnessInPeriod,
} from '@oefen/database';
import {
  computeWellnessAverages,
  type WellnessAverages,
} from '@oefen/utils';

/** Load Wellness rows for a checkpoint period and compute period averages. */
export async function loadWellnessAveragesForPeriod(
  periodStart: Date,
  periodEnd: Date,
): Promise<WellnessAverages> {
  const rows = await listWellnessInPeriod(periodStart, periodEnd);
  return computeWellnessAverages({ periodStart, periodEnd, rows });
}
