import { describe, expect, it } from 'vitest';

import { deadlineProgress } from './index';

describe('deadlineProgress', () => {
  it('returns null for non-positive spans', () => {
    const t = new Date('2026-01-01T00:00:00Z');
    expect(deadlineProgress(t, t, t)).toBeNull();
  });

  it('computes remaining ratio of the full span', () => {
    const progress = deadlineProgress(
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-05T00:00:00Z'),
      new Date('2026-01-04T00:00:00Z'),
    );
    expect(progress?.remainingRatio).toBeCloseTo(0.25);
    expect(progress?.remainingMs).toBe(24 * 60 * 60 * 1000);
  });
});
