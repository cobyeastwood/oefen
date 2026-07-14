import { describe, expect, it, vi } from 'vitest';

import { pullGarminActivities } from './pull-activities';

describe('pullGarminActivities', () => {
  it('does not mutate the caller knownActivityIds set', async () => {
    const knownActivityIds = new Set<number>([1]);
    const client = {
      getActivities: vi
        .fn()
        .mockResolvedValueOnce([
          { activityId: 1 },
          { activityId: 2 },
        ])
        .mockResolvedValueOnce([]),
    };

    const collected = await pullGarminActivities(client as never, {
      knownActivityIds,
      pageSize: 20,
    });

    expect(collected.map((a) => a.activityId)).toEqual([2]);
    expect(knownActivityIds.has(2)).toBe(false);
    expect([...knownActivityIds]).toEqual([1]);
  });
});
