import { describe, expect, it, vi } from 'vitest';

import { pullGarminActivities } from './pull-activities';

describe('pullGarminActivities', () => {
  it('does not mutate the caller knownActivityIds set', async () => {
    const knownActivityIds = new Set<number>([1]);
    const client = {
      getActivities: vi.fn().mockResolvedValueOnce([
        { activityId: 1, startTimeGMT: '2026-07-14T10:00:00.0' },
        { activityId: 2, startTimeGMT: '2026-07-14T08:00:00.0' },
      ]),
    };

    const collected = await pullGarminActivities(client as never, {
      knownActivityIds,
    });

    expect(collected.map((a) => a.activityId)).toEqual([2]);
    expect(knownActivityIds.has(2)).toBe(false);
    expect([...knownActivityIds]).toEqual([1]);
    expect(client.getActivities).toHaveBeenCalledWith(0, 20);
  });

  it('stops at activities before since', async () => {
    const since = new Date('2026-07-13T00:00:00Z');
    const client = {
      getActivities: vi.fn().mockResolvedValueOnce([
        { activityId: 3, startTimeGMT: '2026-07-15T09:00:00.0' },
        { activityId: 2, startTimeGMT: '2026-07-13T06:00:00.0' },
        { activityId: 1, startTimeGMT: '2026-07-12T20:00:00.0' },
      ]),
    };

    const collected = await pullGarminActivities(client as never, { since });

    expect(collected.map((a) => a.activityId)).toEqual([3, 2]);
    expect(client.getActivities).toHaveBeenCalledTimes(1);
  });

  it('stops at activities before since even when they are known', async () => {
    const since = new Date('2026-07-13T00:00:00Z');
    const client = {
      getActivities: vi.fn().mockResolvedValueOnce([
        { activityId: 3, startTimeGMT: '2026-07-15T09:00:00.0' },
        { activityId: 2, startTimeGMT: '2026-07-12T20:00:00.0' },
        { activityId: 1, startTimeGMT: '2026-07-14T09:00:00.0' },
      ]),
    };

    const collected = await pullGarminActivities(client as never, {
      knownActivityIds: new Set([2]),
      since,
    });

    // Activity 1 is after 2 in the page but would be ignored because we stop at 2.
    expect(collected.map((a) => a.activityId)).toEqual([3]);
  });

  it('skips known ids that are still after since', async () => {
    const since = new Date('2026-07-13T00:00:00Z');
    const client = {
      getActivities: vi.fn().mockResolvedValueOnce([
        { activityId: 3, startTimeGMT: '2026-07-15T09:00:00.0' },
        { activityId: 2, startTimeGMT: '2026-07-14T09:00:00.0' },
        { activityId: 1, startTimeGMT: '2026-07-01T09:00:00.0' },
      ]),
    };

    const collected = await pullGarminActivities(client as never, {
      knownActivityIds: new Set([3]),
      since,
    });

    expect(collected.map((a) => a.activityId)).toEqual([2]);
  });
});
