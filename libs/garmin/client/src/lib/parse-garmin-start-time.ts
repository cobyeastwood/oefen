/** Parse Garmin startTimeGMT (UTC wall time, often without a Z suffix). */
export function parseGarminStartTime(raw: unknown): Date | null {
  if (typeof raw === 'number') {
    const startedAt = new Date(raw);
    return Number.isNaN(startedAt.getTime()) ? null : startedAt;
  }
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }

  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
    ? raw
    : `${raw.replace(' ', 'T')}Z`;
  const startedAt = new Date(normalized);
  return Number.isNaN(startedAt.getTime()) ? null : startedAt;
}
