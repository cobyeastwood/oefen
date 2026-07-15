type DistanceSession = { durationS: number; distanceM: number };

/** Sum session count, duration, and distance. */
export function aggregateSessionTotals(sessions: DistanceSession[]) {
  return {
    sessionCount: sessions.length,
    durationS: sessions.reduce((sum, s) => sum + s.durationS, 0),
    distanceM: sessions.reduce((sum, s) => sum + s.distanceM, 0),
  };
}
