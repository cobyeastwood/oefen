import { describe, expect, it } from 'vitest';

import { checkpointMetrics } from './compute-checkpoint-metrics';

describe('checkpointMetrics', () => {
  it('returns null pace/HR averages when sessions lack distance or HR', () => {
    const metrics = checkpointMetrics({
      sessions: [{ durationS: 100, distanceM: 0, avgHr: null }],
    });
    expect(metrics.sessionCount).toBe(1);
    expect(metrics.avgPaceSecPerKm).toBeNull();
    expect(metrics.avgHrBpm).toBeNull();
    expect(metrics.fastestMileSec).toBeNull();
  });

  it('duration-weights HR and skips null readings', () => {
    const metrics = checkpointMetrics({
      sessions: [
        { durationS: 60, distanceM: 200, avgHr: 150 },
        { durationS: 180, distanceM: 600, avgHr: null },
        { durationS: 60, distanceM: 200, avgHr: 170 },
      ],
    });
    // (150*60 + 170*60) / 120 = 160
    expect(metrics.avgHrBpm).toBe(160);
    expect(metrics.totalDistanceM).toBe(1000);
  });

  it('tracks volume goal progress from session distance', () => {
    const metrics = checkpointMetrics({
      sessions: [{ durationS: 600, distanceM: 3000, avgHr: null }],
      goal: {
        targetMetric: 'weekly_distance',
        targetValue: 10000,
        deadline: null,
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
    });
    expect(metrics.bestAttemptKind).toBe('distance_m');
    expect(metrics.bestAttemptValue).toBe(3000);
    expect(metrics.goalProgress?.ratio).toBeCloseTo(0.3);
    expect(metrics.goalProgress?.remaining).toBe(7000);
    expect(metrics.pace?.gapToTarget).toBe(7000);
    expect(metrics.pace?.elapsedRatio).toBeNull();
  });

  it('tracks race goal from best eligible attempt', () => {
    const metrics = checkpointMetrics({
      sessions: [
        { durationS: 1300, distanceM: 5000, avgHr: null },
        { durationS: 1200, distanceM: 5000, avgHr: null },
      ],
      goal: {
        targetMetric: '5k_time',
        targetValue: 1250,
        deadline: null,
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
      },
    });
    expect(metrics.bestAttemptKind).toBe('race_time_sec');
    expect(metrics.bestAttemptValue).toBe(1200);
    expect(metrics.goalProgress?.remaining).toBe(-50);
  });
});
