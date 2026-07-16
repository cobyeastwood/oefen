import { describe, expect, it } from 'vitest';

import {
  crossedDeadlineMilestones,
  deadlineQuarterPeriodStart,
  selectDeadlineMilestone,
  shouldDetectDeadlineQuarter,
} from './deadline-quarter-policy';

const progress = (remainingRatio: number) => ({
  deadlineAt: 'x',
  totalSpanMs: 100,
  remainingMs: remainingRatio * 100,
  remainingRatio,
  elapsedRatio: 1 - remainingRatio,
});

describe('selectDeadlineMilestone', () => {
  it('returns null without progress or before any threshold', () => {
    expect(selectDeadlineMilestone(null)).toBeNull();
    expect(selectDeadlineMilestone(progress(0.8))).toBeNull();
    expect(shouldDetectDeadlineQuarter(progress(0.8))).toBe(false);
  });

  it('fires 0.75 when remaining first drops to ≤ 75%', () => {
    expect(selectDeadlineMilestone(progress(0.75))).toBe(0.75);
    expect(selectDeadlineMilestone(progress(0.6))).toBe(0.75);
  });

  it('fires 0.5 when remaining drops to ≤ 50% and 0.75 already fired', () => {
    expect(selectDeadlineMilestone(progress(0.5), [0.75])).toBe(0.5);
  });

  it('fires 0.25 when remaining drops to ≤ 25% and earlier milestones fired', () => {
    expect(selectDeadlineMilestone(progress(0.25), [0.75, 0.5])).toBe(0.25);
    expect(shouldDetectDeadlineQuarter(progress(0.25), [0.75, 0.5])).toBe(
      true,
    );
  });

  it('when a sync gap crosses multiple thresholds, keeps only the latest', () => {
    expect(crossedDeadlineMilestones(progress(0.2), [])).toEqual([
      0.75, 0.5, 0.25,
    ]);
    expect(selectDeadlineMilestone(progress(0.2), [])).toBe(0.25);
    expect(selectDeadlineMilestone(progress(0.4), [])).toBe(0.5);
  });

  it('does not re-fire a milestone that already exists', () => {
    expect(selectDeadlineMilestone(progress(0.2), [0.75, 0.5, 0.25])).toBeNull();
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
