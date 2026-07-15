import { addMonths, MS_WEEK, type DistancePeriod } from '@oefen/shared/utils';

type VolumeSession = { distanceM: number; occurredAt: Date };

export type VolumeGoalHit = {
  periodStart: Date;
  periodEnd: Date;
};

function nextWindowEnd(start: Date, period: DistancePeriod): Date {
  if (period === 'week') {
    return new Date(start.getTime() + MS_WEEK);
  }
  return addMonths(start, period === 'month' ? 1 : 12);
}

function distanceInWindow(
  sessions: VolumeSession[],
  start: Date,
  end: Date,
): number {
  return sessions
    .filter(
      (session) => session.occurredAt >= start && session.occurredAt < end,
    )
    .reduce((sum, session) => sum + session.distanceM, 0);
}

/** Find the first distance window since goal start that meets the target. */
export function findVolumeGoalHit(
  period: DistancePeriod,
  effectiveFrom: Date,
  now: Date,
  sessions: VolumeSession[],
  targetM: number,
): VolumeGoalHit | null {
  let start = effectiveFrom;

  for (let i = 0; i < 120; i += 1) {
    const endExclusive = nextWindowEnd(start, period);
    const windowEnd = endExclusive <= now ? endExclusive : now;

    if (windowEnd <= start) {
      break;
    }

    if (distanceInWindow(sessions, start, windowEnd) >= targetM) {
      return { periodStart: start, periodEnd: windowEnd };
    }

    if (endExclusive > now) {
      break;
    }

    start = endExclusive;
  }

  return null;
}
