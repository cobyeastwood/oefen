import {
  deadlineFromMonths,
  isValidDeadlineMonths,
  isValidGoalDeadline,
} from '@oefen/utils';

import type { SetGoalInput } from './types';

/** Resolve an absolute deadline from months or an explicit date. */
export function resolveGoalDeadline(
  input: Pick<SetGoalInput, 'deadlineMonths' | 'deadline'>,
  effectiveFrom: Date,
): Date {
  if (input.deadlineMonths != null) {
    if (!isValidDeadlineMonths(input.deadlineMonths)) {
      throw new Error('deadlineMonths must be an integer from 1 to 18');
    }
    return deadlineFromMonths(input.deadlineMonths, effectiveFrom);
  }

  if (input.deadline) {
    if (!isValidGoalDeadline(input.deadline, effectiveFrom)) {
      throw new Error(
        'deadline must be exactly 1–18 months from the goal start day',
      );
    }
    return input.deadline;
  }

  throw new Error('deadlineMonths is required');
}
