import { describe, expect, it } from 'vitest';

import { filterUnknownActivities } from './filter-unknown-activities';
import type { ActivityDraft } from './types';

function draft(externalId: number): ActivityDraft {
  return {
    externalId,
    typeKey: 'running',
    sport: 'run',
    occurredAt: new Date('2026-07-14T10:00:00Z'),
    durationS: 1800,
    distanceM: 5000,
    avgHr: null,
    maxHr: null,
    rpe: null,
    feel: null,
    title: null,
  };
}

describe('filterUnknownActivities', () => {
  it('drops known ids and keeps unknown ones', () => {
    const known = new Set([1, 3]);
    const collected = filterUnknownActivities(
      [draft(1), draft(2), draft(3)],
      known,
    );

    expect(collected.map((a) => a.externalId)).toEqual([2]);
  });

  it('does not mutate the known set', () => {
    const known = new Set([1]);
    filterUnknownActivities([draft(1), draft(2)], known);
    expect([...known]).toEqual([1]);
  });
});
