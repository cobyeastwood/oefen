import {
  isValidDeadlineMonths,
  isValidDistancePeriod,
  isValidRaceDistanceM,
  isValidVolumeDistanceM,
  optionalFiniteNumber,
  type DistancePeriod,
  type GoalType,
} from '@oefen/utils';

import type { GoalRevision, SetGoalInput } from './types';

export type ParseSetGoalResult =
  | { ok: true; input: SetGoalInput }
  | { ok: false; error: string };

/** Validate a typed SetGoalInput; returns an error message or null. */
export function validateSetGoalInput(input: SetGoalInput): string | null {
  if (input.type !== 'race_time' && input.type !== 'distance') {
    return 'type is invalid';
  }

  if (!Number.isFinite(input.targetValue)) {
    return 'targetValue is required';
  }

  if (input.type === 'race_time') {
    if (input.distanceM == null || !isValidRaceDistanceM(input.distanceM)) {
      return 'distanceM is required';
    }
  } else {
    if (!input.period || !isValidDistancePeriod(input.period)) {
      return 'period is required';
    }
    if (!isValidVolumeDistanceM(input.targetValue)) {
      return 'targetValue distance is invalid';
    }
  }

  if (input.deadlineMonths == null) {
    return 'deadlineMonths is required';
  }
  if (!isValidDeadlineMonths(input.deadlineMonths)) {
    return 'deadlineMonths must be an integer from 1 to 18';
  }

  return null;
}

/** Coerce an untyped JSON body into SetGoalInput. */
export function parseSetGoalInput(
  body: Record<string, unknown>,
): ParseSetGoalResult {
  const type = String(body['type'] ?? 'race_time') as GoalType;
  const targetValue = Number(body['targetValue']);
  const period =
    body['period'] == null
      ? undefined
      : (String(body['period']) as DistancePeriod);
  const distanceM = optionalFiniteNumber(body['distanceM']);
  const deadlineMonths = optionalFiniteNumber(body['deadlineMonths']) ?? null;
  const revision = body['revision'];

  const input: SetGoalInput = {
    type,
    period,
    distanceM,
    targetValue,
    deadlineMonths,
    deadline:
      deadlineMonths == null && body['deadline']
        ? new Date(String(body['deadline']))
        : null,
    note: body['note'] ? String(body['note']) : null,
    revision:
      revision === 'update' || revision === 'replace'
        ? (revision as GoalRevision)
        : undefined,
  };

  const error = validateSetGoalInput(input);
  if (error) {
    return { ok: false, error };
  }

  return { ok: true, input };
}
