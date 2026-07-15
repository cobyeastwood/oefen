import { describe, expect, it } from 'vitest';

import { parseGarminStartTime } from './parse-garmin-start-time';

describe('parseGarminStartTime', () => {
  it('parses bare UTC wall-clock strings as Zulu', () => {
    const date = parseGarminStartTime('2026-07-14T10:00:00.0');
    expect(date?.toISOString()).toBe('2026-07-14T10:00:00.000Z');
  });

  it('preserves explicit offsets', () => {
    const date = parseGarminStartTime('2026-07-14T10:00:00-04:00');
    expect(date?.toISOString()).toBe('2026-07-14T14:00:00.000Z');
  });

  it('returns null for empty values', () => {
    expect(parseGarminStartTime('')).toBeNull();
    expect(parseGarminStartTime(null)).toBeNull();
  });
});
