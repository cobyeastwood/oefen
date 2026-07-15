/** Sessions with an occurredAt timestamp (enough for window filtering). */
type DatedSession = {
  occurredAt: Date;
};

/** Keep sessions whose occurredAt falls in `[from, to]` inclusive. */
export function filterSessionsInWindow<T extends DatedSession>(
  sessions: T[],
  from: Date,
  to: Date,
): T[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  return sessions.filter((session) => {
    const occurredMs = session.occurredAt.getTime();
    return occurredMs >= fromMs && occurredMs <= toMs;
  });
}
