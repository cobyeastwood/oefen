import { describe, expect, it } from 'vitest';

import {
  deadlineQuarterPeriodStart,
  shouldDetectDeadlineQuarter,
} from './deadline-quarter-policy';

describe('shouldDetectDeadlineQuarter', () => {
  it('is false without progress or when more than 25% remains', () => {
    expect(shouldDetectDeadlineQuarter(null)).toBe(false);
    expect(
      shouldDetectDeadlineQuarter({
        deadlineAt: 'x',
        totalSpanMs: 100,
        remainingMs: 26,
        remainingRatio: 0.26,
      }),
    ).toBe(false);
  });

  it('is true at or under 25% remaining', () => {
    expect(
      shouldDetectDeadlineQuarter({
        deadlineAt: 'x',
        totalSpanMs: 100,
        remainingMs: 25,
        remainingRatio: 0.25,
      }),
    ).toBe(true);
  });
});

describe('deadlineQuarterPeriodStart', () => {
  it('prefers the prior watermark when it is before now', () => {
    expect(
      deadlineQuarterPeriodStart(
        new Date('2026-01-10T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-20T00:00:00Z'),
      ),
    ).toEqual(new Date('2026-01-10T00:00:00Z'));
  });

  it('falls back to goal start when watermark is not before now', () => {
    expect(
      deadlineQuarterPeriodStart(
        new Date('2026-01-20T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-20T00:00:00Z'),
      ),
    ).toEqual(new Date('2026-01-01T00:00:00Z'));
  });
});
