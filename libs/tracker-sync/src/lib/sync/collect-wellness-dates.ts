import { toUtcCalendarDate } from '@oefen/database';

import type { ActivityDraft } from './types';

function utcDayKey(date: Date): string {
  return toUtcCalendarDate(date).toISOString().slice(0, 10);
}

/** Unique UTC calendar days for today, yesterday, and each activity day. */
export function collectWellnessDates(
  activities: ActivityDraft[],
  now = new Date(),
): Date[] {
  const dates = new Map<string, Date>();
  const today = toUtcCalendarDate(now);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  dates.set(utcDayKey(today), today);
  dates.set(utcDayKey(yesterday), yesterday);

  for (const activity of activities) {
    const day = toUtcCalendarDate(activity.occurredAt);
    dates.set(utcDayKey(day), day);
  }

  return [...dates.values()].sort((a, b) => a.getTime() - b.getTime());
}
