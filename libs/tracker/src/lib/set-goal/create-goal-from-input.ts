import { createGoal } from '@oefen/database';
import { goalMetricForGoal, unitForGoalType } from '@oefen/utils';

import { validateSetGoalInput } from './parse-set-goal-input';
import { resolveGoalDeadline } from './resolve-goal-deadline';
import type { SetGoalInput } from './types';

/** Validate input and create a goal row. */
export async function createGoalFromInput(
  input: SetGoalInput,
  effectiveFrom: Date,
  chain?: { continuesId?: string },
) {
  const error = validateSetGoalInput(input);
  if (error) {
    throw new Error(error);
  }

  return createGoal({
    targetMetric: goalMetricForGoal({
      type: input.type,
      period: input.period,
      distanceM: input.distanceM,
    }),
    targetValue: input.targetValue,
    unit: unitForGoalType(input.type),
    deadline: resolveGoalDeadline(input, effectiveFrom),
    note: input.note,
    effectiveFrom,
    continuesId: chain?.continuesId ?? null,
  });
}
