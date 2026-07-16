import { describe, expect, it } from 'vitest';

import {
  buildCheckpointPace,
  countWeeksMeetingTarget,
} from './build-checkpoint-pace';
import { checkpointMetrics } from './compute-checkpoint-metrics';

describe('checkpointMetrics pace', () => {
  it('emits gap without elapsedRatio when there is no deadline', () => {
    const metrics = checkpointMetrics({
      sessions: [{ durationS: 1300, distanceM: 5000, avgHr: null }],
      goal: {
        targetMetric: '5k_time',
        targetValue: 1250,
        deadline: null,
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
      now: new Date('2026-02-01T00:00:00Z'),
    });

    expect(metrics.deadline).toBeNull();
    expect(metrics.pace).toEqual({
      elapsedRatio: null,
      progressRatio: expect.closeTo(1250 / 1300),
      gapToTarget: 50,
      weeksMeetingTarget: null,
    });
  });

  it('pairs elapsedRatio with progressRatio when a deadline exists', () => {
    const metrics = checkpointMetrics({
      sessions: [{ durationS: 600, distanceM: 5000, avgHr: null }],
      goal: {
        targetMetric: 'weekly_distance',
        targetValue: 10000,
        deadline: new Date('2026-01-05T00:00:00Z'),
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
      now: new Date('2026-01-03T00:00:00Z'),
    });

    expect(metrics.deadline?.elapsedRatio).toBeCloseTo(0.5);
    expect(metrics.pace?.elapsedRatio).toBeCloseTo(0.5);
    expect(metrics.pace?.progressRatio).toBeCloseTo(0.5);
    expect(metrics.pace?.gapToTarget).toBe(5000);
  });

  it('leaves gapToTarget null when there is no race attempt', () => {
    const metrics = checkpointMetrics({
      sessions: [],
      goal: {
        targetMetric: '5k_time',
        targetValue: 1250,
        deadline: new Date('2026-01-05T00:00:00Z'),
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
      now: new Date('2026-01-03T00:00:00Z'),
    });

    expect(metrics.bestAttemptValue).toBeNull();
    expect(metrics.pace?.gapToTarget).toBeNull();
    expect(metrics.pace?.elapsedRatio).toBeCloseTo(0.5);
  });
});

describe('countWeeksMeetingTarget', () => {
  it('includes the current week and up to three priors', () => {
    const result = countWeeksMeetingTarget(
      [
        { goalProgress: { ratio: 1.1 } },
        { goalProgress: { ratio: 0.4 } },
        { goalProgress: { ratio: 1 } },
        { goalProgress: { ratio: 0.9 } },
      ],
      { goalProgress: { ratio: 0.8 } },
    );
    expect(result).toEqual({ hit: 2, of: 4 });
  });

  it('returns null when there are no weeks to evaluate', () => {
    expect(countWeeksMeetingTarget([])).toBeNull();
  });
});

describe('buildCheckpointPace', () => {
  it('returns null when nothing is available', () => {
    expect(
      buildCheckpointPace({ deadline: null, goalProgress: null }),
    ).toBeNull();
  });
});
