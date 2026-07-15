import { describe, expect, it } from 'vitest';

import { decideGoalReached } from './detect-goal-reached';
import type { DetectorContext } from './detector';

describe('decideGoalReached', () => {
  it('returns null when there is no goal', () => {
    const ctx = {
      now: new Date('2026-07-14T12:00:00Z'),
      goal: null,
      checkpoints: [],
      sessions: [],
    } satisfies DetectorContext;

    expect(decideGoalReached(ctx)).toBeNull();
  });

  it('returns null when goal_reached checkpoint already exists', () => {
    const goal = {
      id: 'g1',
      targetMetric: 'mileage_week_mi',
      targetValue: 10,
      unit: 'mi',
      effectiveFrom: new Date('2026-07-01T00:00:00Z'),
      deadline: null,
      note: null,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      previousGoalId: null,
    };
    const ctx = {
      now: new Date('2026-07-14T12:00:00Z'),
      goal: goal as never,
      checkpoints: [
        {
          id: 'c1',
          type: 'goal_reached',
          periodStart: goal.effectiveFrom,
          periodEnd: new Date('2026-07-08T00:00:00Z'),
        } as never,
      ],
      sessions: [],
    } satisfies DetectorContext;

    expect(decideGoalReached(ctx)).toBeNull();
  });
});
