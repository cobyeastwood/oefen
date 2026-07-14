const METERS_PER_MILE = 1609.344;

type PaceSession = { durationS: number; distanceM: number };

/** Implied mile pace from session average pace (null if under ~0.9 mile). */
export function sessionImpliedMilePaceSec(session: PaceSession): number | null {
  if (session.distanceM < METERS_PER_MILE * 0.9) {
    return null;
  }
  return session.durationS * (METERS_PER_MILE / session.distanceM);
}

/** Scale session time to race distance when the run is ≥ 85% of that distance. */
export function raceEquivalentSec(
  session: PaceSession,
  raceDistanceM: number,
): number | null {
  if (session.distanceM < raceDistanceM * 0.85) {
    return null;
  }
  return session.durationS * (raceDistanceM / session.distanceM);
}
