import { describe, expect, it } from 'vitest';

import { filterSessionsInWindow } from './filter-sessions-in-window';

describe('filterSessionsInWindow', () => {
  const from = new Date('2026-07-01T00:00:00Z');
  const to = new Date('2026-07-15T00:00:00Z');

  it('keeps sessions inside the inclusive window', () => {
    const sessions = [
      { id: 'a', occurredAt: new Date('2026-06-30T23:59:59Z') },
      { id: 'b', occurredAt: new Date('2026-07-01T00:00:00Z') },
      { id: 'c', occurredAt: new Date('2026-07-10T12:00:00Z') },
      { id: 'd', occurredAt: new Date('2026-07-15T00:00:00Z') },
      { id: 'e', occurredAt: new Date('2026-07-15T00:00:01Z') },
    ];

    expect(
      filterSessionsInWindow(sessions, from, to).map((s) => s.id),
    ).toEqual(['b', 'c', 'd']);
  });
});
