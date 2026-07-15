import { describe, expect, it } from 'vitest';

import { weightedAvgHr } from './merge-session-fields';

describe('weightedAvgHr', () => {
  it('weights by duration and ignores null HR', () => {
    expect(
      weightedAvgHr(
        { avgHr: 140, durationS: 60 },
        { avgHr: 160, durationS: 60 },
      ),
    ).toBe(150);
    expect(
      weightedAvgHr(
        { avgHr: null, durationS: 100 },
        { avgHr: 150, durationS: 50 },
      ),
    ).toBe(150);
  });

  it('returns null when neither side has HR', () => {
    expect(
      weightedAvgHr(
        { avgHr: null, durationS: 10 },
        { avgHr: null, durationS: 20 },
      ),
    ).toBeNull();
  });
});
