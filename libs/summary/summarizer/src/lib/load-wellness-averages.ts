import {
  listWellnessInPeriod,
} from '@oefen/shared/database';
import {
  wellnessAverages,
  type WellnessAverages,
} from '@oefen/shared/utils';

/** Load Wellness rows for a checkpoint period and compute period averages. */
export async function loadWellnessAverages(
  periodStart: Date,
  periodEnd: Date,
): Promise<WellnessAverages> {
  const rows = await listWellnessInPeriod(periodStart, periodEnd);
  return wellnessAverages({ periodStart, periodEnd, rows });
}
