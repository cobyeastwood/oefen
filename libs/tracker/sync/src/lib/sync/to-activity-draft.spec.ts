import { describe, expect, it } from 'vitest';

import {
  isRunningActivity,
  mapActivityDraft,
  toActivityDraft,
} from './to-activity-draft';

describe('isRunningActivity', () => {
  it('accepts running type keys', () => {
    expect(
      isRunningActivity({
        activityId: 1,
        activityType: { typeKey: 'trail_running' },
      } as never),
    ).toBe(true);
  });

  it('rejects non-running type keys', () => {
    expect(
      isRunningActivity({
        activityId: 1,
        activityType: { typeKey: 'cycling' },
      } as never),
    ).toBe(false);
  });
});

describe('mapActivityDraft', () => {
  it('maps fields for a parseable activity', () => {
    const draft = mapActivityDraft({
      activityId: 42,
      activityName: 'Tempo',
      activityType: { typeKey: 'running' },
      startTimeGMT: '2026-07-14T10:00:00.0',
      movingDuration: 1800.4,
      distance: 5000,
      averageHR: 150,
      maxHR: 170,
    } as never);

    expect(draft).toMatchObject({
      externalId: 42,
      typeKey: 'running',
      sport: 'run',
      durationS: 1800,
      distanceM: 5000,
      avgHr: 150,
      maxHr: 170,
      title: 'Tempo',
    });
  });

  it('returns null when start time cannot be parsed', () => {
    expect(
      mapActivityDraft({
        activityId: 1,
        activityType: { typeKey: 'running' },
        startTimeGMT: '',
      } as never),
    ).toBeNull();
  });
});

describe('toActivityDraft', () => {
  it('returns null for non-running activities', () => {
    expect(
      toActivityDraft({
        activityId: 1,
        activityType: { typeKey: 'cycling' },
        startTimeGMT: '2026-07-14T10:00:00.0',
      } as never),
    ).toBeNull();
  });
});
