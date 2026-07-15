import { describe, expect, it, vi } from 'vitest';

import { pullActivities } from './pull-activities';

describe('pullActivities', () => {
  it('returns one page of activities from the client', async () => {
    const page = [
      { activityId: 1, startTimeGMT: '2026-07-14T10:00:00.0' },
      { activityId: 2, startTimeGMT: '2026-07-14T08:00:00.0' },
    ];
    const client = {
      getActivities: vi.fn().mockResolvedValueOnce(page),
    };

    const collected = await pullActivities(client as never);

    expect(collected).toEqual(page);
    expect(client.getActivities).toHaveBeenCalledWith(0, 20);
  });
});
