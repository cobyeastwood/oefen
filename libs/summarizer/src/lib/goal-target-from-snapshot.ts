/** Read goal targetValue from a checkpoint goalSnapshot JSON blob. */
export function goalTargetFromSnapshot(goalSnapshot: unknown): number | null {
  if (!goalSnapshot || typeof goalSnapshot !== 'object') {
    return null;
  }
  const value = (goalSnapshot as { targetValue?: unknown }).targetValue;
  return typeof value === 'number' ? value : null;
}
