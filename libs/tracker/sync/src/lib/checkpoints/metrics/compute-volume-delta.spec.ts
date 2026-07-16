import { describe, expect, it } from 'vitest';

import { volumeDelta } from './compute-volume-delta';

describe('volumeDelta', () => {
  it('returns null with fewer than 2 prior weeks', () => {
    expect(volumeDelta(41000, [])).toBeNull();
    expect(volumeDelta(41000, [{ distanceM: 20000 }])).toBeNull();
  });

  it('returns null when prior weeks have zero trailing mean', () => {
    expect(
      volumeDelta(41000, [{ distanceM: 0 }, { distanceM: 0 }]),
    ).toBeNull();
  });

  it('compares this week to the trailing mean of prior weeks', () => {
    // 20 + 22 + 25 + 24 = 91 → mean 22.75 km; week 41.3 km
    const result = volumeDelta(41300, [
      { distanceM: 20000 },
      { distanceM: 22000 },
      { distanceM: 25000 },
      { distanceM: 24000 },
    ]);

    expect(result).toEqual({
      weekDistanceM: 41300,
      trailingMeanM: 22750,
      pctChange: (41300 - 22750) / 22750,
      basisWeeks: 4,
      loadRatio: 41300 / 22750,
    });
    // Display rounding (1 decimal km, whole %) is summarizer-side.
    expect(Math.round((result!.trailingMeanM / 1000) * 10) / 10).toBe(22.8);
    expect(Math.round(result!.pctChange * 100)).toBe(82);
  });

  it('returns null after a goal reset leaves fewer than 2 same-goal priors', () => {
    // Callers must only pass priors for the current goal (query filters by goalId).
    // Old-goal weeks are not included, so week 2 under a new goal stays null.
    expect(volumeDelta(41300, [{ distanceM: 20000 }])).toBeNull();
  });
});
