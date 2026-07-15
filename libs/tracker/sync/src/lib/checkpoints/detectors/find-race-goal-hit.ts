import { sessionEnd } from '@oefen/shared/database';

import { raceEquivalentSec } from '../metrics';

type RaceSession = {
  durationS: number;
  distanceM: number;
  id: string;
  occurredAt: Date;
};

export type RaceGoalHit = {
  sessionId: string;
  periodEnd: Date;
};

/** Find the first session whose race-equivalent time meets the target. */
export function findRaceGoalHit(
  sessions: RaceSession[],
  raceDistanceM: number,
  targetSec: number,
): RaceGoalHit | null {
  for (const session of sessions) {
    const equivalent = raceEquivalentSec(session, raceDistanceM);
    if (equivalent != null && equivalent <= targetSec) {
      return {
        sessionId: session.id,
        periodEnd: sessionEnd(session),
      };
    }
  }
  return null;
}
