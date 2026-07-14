import { describe, expect, it } from 'vitest';

import { findRaceGoalHit } from './find-race-goal-hit';

describe('findRaceGoalHit', () => {
  it('returns the first meeting session', () => {
    const hit = findRaceGoalHit(
      [
        {
          id: 'a',
          durationS: 1300,
          distanceM: 5000,
          occurredAt: new Date('2026-01-01T10:00:00Z'),
        },
        {
          id: 'b',
          durationS: 1200,
          distanceM: 5000,
          occurredAt: new Date('2026-01-02T10:00:00Z'),
        },
      ],
      5000,
      1250,
    );
    expect(hit?.sessionId).toBe('b');
    expect(hit?.periodEnd.toISOString()).toBe('2026-01-02T10:20:00.000Z');
  });

  it('returns null when nothing meets the target', () => {
    expect(
      findRaceGoalHit(
        [
          {
            id: 'a',
            durationS: 1400,
            distanceM: 5000,
            occurredAt: new Date('2026-01-01T10:00:00Z'),
          },
        ],
        5000,
        1200,
      ),
    ).toBeNull();
  });
});
