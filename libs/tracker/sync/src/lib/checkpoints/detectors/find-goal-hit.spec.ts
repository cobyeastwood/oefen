import { describe, expect, it } from 'vitest';

import { findGoalHit } from './find-goal-hit';

describe('findGoalHit', () => {
  it('delegates race goals to race hit detection', () => {
    const watermark = new Date('2026-01-01T00:00:00Z');
    const hit = findGoalHit({
      goal: {
        targetMetric: '5k_time',
        targetValue: 1250,
        effectiveFrom: watermark,
      },
      watermark,
      now: new Date('2026-01-10T00:00:00Z'),
      sessions: [
        {
          id: 's1',
          durationS: 1200,
          distanceM: 5000,
          occurredAt: new Date('2026-01-03T08:00:00Z'),
        },
      ],
    });
    expect(hit?.sessionId).toBe('s1');
    expect(hit?.periodStart).toEqual(watermark);
  });

  it('delegates volume goals to volume window detection', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const hit = findGoalHit({
      goal: {
        targetMetric: 'weekly_distance',
        targetValue: 5000,
        effectiveFrom: start,
      },
      watermark: start,
      now: new Date('2026-01-10T00:00:00Z'),
      sessions: [
        {
          id: 's1',
          durationS: 600,
          distanceM: 6000,
          occurredAt: new Date('2026-01-02T08:00:00Z'),
        },
      ],
    });
    expect(hit?.sessionId).toBeNull();
    expect(hit?.periodStart.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(hit?.periodEnd.toISOString()).toBe('2026-01-08T00:00:00.000Z');
  });
});
