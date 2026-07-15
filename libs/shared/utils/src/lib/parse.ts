/** Coerce empty/missing values away; return a finite number when present. */
export function optionalFiniteNumber(value: unknown): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/** Read a number field from untyped JSON (null when missing or wrong type). */
export function readNumber(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

/** Read a string field from untyped JSON (null when missing or wrong type). */
export function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}
