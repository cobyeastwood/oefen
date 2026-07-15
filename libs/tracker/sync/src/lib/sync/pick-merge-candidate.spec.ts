import { describe, expect, it } from 'vitest';

import { pickMergeCandidate } from '@oefen/shared/database';

describe('pickMergeCandidate', () => {
  const sessions = [
    {
      id: 'ride',
      sport: 'bike',
      occurredAt: new Date('2026-07-14T10:00:00Z'),
      durationS: 3600,
    },
    {
      id: 'run',
      sport: 'run',
      occurredAt: new Date('2026-07-14T10:00:00Z'),
      durationS: 1800,
    },
  ];

  it('returns the first overlapping same-sport session', () => {
    const candidate = pickMergeCandidate(sessions, {
      sport: 'run',
      occurredAt: new Date('2026-07-14T10:20:00Z'),
      durationS: 1200,
    });

    expect(candidate?.id).toBe('run');
  });

  it('skips different sports even when times overlap', () => {
    const candidate = pickMergeCandidate(sessions, {
      sport: 'run',
      occurredAt: new Date('2026-07-14T10:30:00Z'),
      durationS: 600,
      gapMs: 0,
    });

    expect(candidate?.id).toBe('run');
  });

  it('returns null when nothing overlaps', () => {
    const candidate = pickMergeCandidate(sessions, {
      sport: 'run',
      occurredAt: new Date('2026-07-14T14:00:00Z'),
      durationS: 600,
      gapMs: 0,
    });

    expect(candidate).toBeNull();
  });
});
