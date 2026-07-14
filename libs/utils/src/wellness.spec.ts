import { describe, expect, it } from 'vitest';

import {
  calendarDaysInPeriod,
  computeWellnessAverages,
} from './wellness';

describe('calendarDaysInPeriod', () => {
  it('counts UTC calendar days in a half-open range', () => {
    expect(
      calendarDaysInPeriod(
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-08T00:00:00Z'),
      ),
    ).toBe(7);
  });
});

describe('computeWellnessAverages', () => {
  const periodStart = new Date('2026-01-01T00:00:00Z');
  const periodEnd = new Date('2026-01-04T00:00:00Z');

  it('averages only positive readings and reports coverage', () => {
    const averages = computeWellnessAverages({
      periodStart,
      periodEnd,
      rows: [
        { steps: 1000, sleepSeconds: 28800, restingHeartRate: 155, hydrationOz: 40 },
        { steps: 2000, sleepSeconds: 0, restingHeartRate: 165, hydrationOz: null },
        { steps: null, sleepSeconds: 25200, restingHeartRate: 0, hydrationOz: 60 },
      ],
    });

    expect(averages.dayCount).toBe(3);
    expect(averages.avgSteps).toBe(1500);
    expect(averages.daysWithSteps).toBe(2);
    expect(averages.avgSleepSeconds).toBe(27000);
    expect(averages.daysWithSleep).toBe(2);
    expect(averages.avgRestingHeartRate).toBe(160);
    expect(averages.daysWithRhr).toBe(2);
    expect(averages.avgHydrationOz).toBe(50);
    expect(averages.daysWithHydration).toBe(2);
  });

  it('returns null averages when no eligible readings exist', () => {
    const averages = computeWellnessAverages({
      periodStart,
      periodEnd,
      rows: [{ steps: 0, sleepSeconds: null, restingHeartRate: 0 }],
    });
    expect(averages.avgSteps).toBeNull();
    expect(averages.avgSleepSeconds).toBeNull();
    expect(averages.avgRestingHeartRate).toBeNull();
    expect(averages.avgHydrationOz).toBeNull();
  });
});
