import { MS_WEEK } from '@oefen/shared/utils';

export type WeeklyPeriod = {
  periodStart: Date;
  periodEnd: Date;
};

/** Closed 7-day windows since the goal anchor that end at or before `now`. */
export function closedWeeklyPeriods(
  effectiveFrom: Date,
  now: Date,
  maxWeeks = 520,
): WeeklyPeriod[] {
  const periods: WeeklyPeriod[] = [];
  const anchorMs = effectiveFrom.getTime();

  for (let weekIndex = 0; weekIndex <= maxWeeks; weekIndex += 1) {
    const periodStart = new Date(anchorMs + weekIndex * MS_WEEK);
    const periodEnd = new Date(periodStart.getTime() + MS_WEEK);
    if (periodEnd > now) {
      break;
    }
    periods.push({ periodStart, periodEnd });
  }

  return periods;
}
