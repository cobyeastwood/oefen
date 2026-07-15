import type { DeadlineProgress } from '@oefen/shared/types';

import { DEADLINE_MONTH_OPTIONS, MS_DAY } from './goal-constants';

export function isValidDeadlineMonths(months: number): boolean {
  return Number.isInteger(months) && months >= 1 && months <= 18;
}

/** Add calendar months keeping the day-of-month when possible. */
export function addMonths(anchor: Date, months: number): Date {
  const result = new Date(anchor.getTime());
  const day = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months, 1);
  const maxDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, maxDay));
  return result;
}

export function deadlineFromMonths(
  months: number,
  anchor: Date = new Date(),
): Date {
  if (!isValidDeadlineMonths(months)) {
    throw new Error('Deadline must be 1–18 months from the start day');
  }
  return addMonths(anchor, months);
}

export function monthsBetweenDeadlines(
  anchor: Date,
  deadline: Date,
): number | null {
  for (const option of DEADLINE_MONTH_OPTIONS) {
    const candidate = addMonths(anchor, option.months);
    if (Math.abs(candidate.getTime() - deadline.getTime()) < MS_DAY) {
      return option.months;
    }
  }
  return null;
}

export function isValidGoalDeadline(
  deadline: Date,
  anchor: Date = new Date(),
): boolean {
  return monthsBetweenDeadlines(anchor, deadline) != null;
}

/** Remaining time relative to the full goal→deadline span. */
export function deadlineProgress(
  effectiveFrom: Date,
  deadline: Date,
  now: Date = new Date(),
): DeadlineProgress | null {
  const totalSpanMs = deadline.getTime() - effectiveFrom.getTime();
  if (totalSpanMs <= 0) {
    return null;
  }

  const remainingMs = Math.max(0, deadline.getTime() - now.getTime());
  return {
    deadlineAt: deadline.toISOString(),
    totalSpanMs,
    remainingMs,
    remainingRatio: remainingMs / totalSpanMs,
  };
}
