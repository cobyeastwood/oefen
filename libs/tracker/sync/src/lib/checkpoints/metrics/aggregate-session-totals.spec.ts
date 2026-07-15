import { describe, expect, it } from 'vitest';

import { aggregateSessionTotals } from './aggregate-session-totals';

describe('aggregateSessionTotals', () => {
  it('sums count, duration, and distance', () => {
    expect(
      aggregateSessionTotals([
        { durationS: 100, distanceM: 1000 },
        { durationS: 200, distanceM: 2500 },
      ]),
    ).toEqual({ sessionCount: 2, durationS: 300, distanceM: 3500 });
  });

  it('returns zeros for an empty list', () => {
    expect(aggregateSessionTotals([])).toEqual({
      sessionCount: 0,
      durationS: 0,
      distanceM: 0,
    });
  });
});
