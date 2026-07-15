import { describe, expect, it } from 'vitest';

import { findVolumeGoalHit } from './find-volume-goal-hit';

describe('findVolumeGoalHit', () => {
  const start = new Date('2026-01-01T00:00:00Z');

  it('finds the first weekly window that reaches the target', () => {
    const hit = findVolumeGoalHit(
      'week',
      start,
      new Date('2026-01-20T00:00:00Z'),
      [
        { distanceM: 2000, occurredAt: new Date('2026-01-02T12:00:00Z') },
        { distanceM: 3000, occurredAt: new Date('2026-01-03T12:00:00Z') },
        { distanceM: 8000, occurredAt: new Date('2026-01-10T12:00:00Z') },
      ],
      7000,
    );
    expect(hit?.periodStart.toISOString()).toBe('2026-01-08T00:00:00.000Z');
    expect(hit?.periodEnd.toISOString()).toBe('2026-01-15T00:00:00.000Z');
  });

  it('returns null when no window meets the target', () => {
    expect(
      findVolumeGoalHit(
        'week',
        start,
        new Date('2026-01-14T00:00:00Z'),
        [{ distanceM: 1000, occurredAt: new Date('2026-01-02T12:00:00Z') }],
        10000,
      ),
    ).toBeNull();
  });
});
