import { describe, expect, it } from 'vitest';

import {
  raceEquivalentSec,
  sessionImpliedMilePaceSec,
} from './race-equivalent-sec';

const MILE = 1609.344;
const FIVE_K = 5000;

describe('sessionImpliedMilePaceSec', () => {
  it('returns null for short sessions', () => {
    expect(
      sessionImpliedMilePaceSec({ durationS: 300, distanceM: MILE * 0.5 }),
    ).toBeNull();
  });

  it('scales average pace to one mile', () => {
    expect(
      sessionImpliedMilePaceSec({ durationS: 600, distanceM: MILE }),
    ).toBeCloseTo(600);
  });
});

describe('raceEquivalentSec', () => {
  it('returns null when below 85% of race distance', () => {
    expect(
      raceEquivalentSec({ durationS: 1000, distanceM: FIVE_K * 0.8 }, FIVE_K),
    ).toBeNull();
  });

  it('scales time to the full race distance', () => {
    expect(
      raceEquivalentSec({ durationS: 1200, distanceM: FIVE_K }, FIVE_K),
    ).toBeCloseTo(1200);
    expect(
      raceEquivalentSec({ durationS: 600, distanceM: FIVE_K / 2 }, FIVE_K),
    ).toBeNull(); // 50% < 85%
    expect(
      raceEquivalentSec(
        { durationS: 1080, distanceM: FIVE_K * 0.9 },
        FIVE_K,
      ),
    ).toBeCloseTo(1200);
  });
});
