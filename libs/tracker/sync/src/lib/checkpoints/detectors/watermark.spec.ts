import { describe, expect, it } from 'vitest';

import { checkpointWatermark } from './watermark';

describe('checkpointWatermark', () => {
  const goal = { effectiveFrom: new Date('2026-01-01T00:00:00Z') };

  it('uses goal start when there are no prior checkpoints', () => {
    expect(checkpointWatermark([], goal)).toEqual(goal.effectiveFrom);
  });

  it('uses the latest prior period end', () => {
    expect(
      checkpointWatermark(
        [
          { periodEnd: new Date('2026-01-08T00:00:00Z') },
          { periodEnd: new Date('2026-01-15T00:00:00Z') },
        ],
        goal,
      ),
    ).toEqual(new Date('2026-01-15T00:00:00Z'));
  });
});
