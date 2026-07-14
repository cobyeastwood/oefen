import { describe, expect, it } from 'vitest';

import { closedWeeklyPeriods } from './closed-weekly-periods';

describe('closedWeeklyPeriods', () => {
  it('returns only weeks that have fully closed', () => {
    const periods = closedWeeklyPeriods(
      new Date('2026-01-01T00:00:00Z'),
      new Date('2026-01-16T00:00:00Z'),
    );
    expect(periods).toHaveLength(2);
    expect(periods[0]).toEqual({
      periodStart: new Date('2026-01-01T00:00:00Z'),
      periodEnd: new Date('2026-01-08T00:00:00Z'),
    });
    expect(periods[1]).toEqual({
      periodStart: new Date('2026-01-08T00:00:00Z'),
      periodEnd: new Date('2026-01-15T00:00:00Z'),
    });
  });

  it('returns none before the first week closes', () => {
    expect(
      closedWeeklyPeriods(
        new Date('2026-01-01T00:00:00Z'),
        new Date('2026-01-05T00:00:00Z'),
      ),
    ).toEqual([]);
  });
});
