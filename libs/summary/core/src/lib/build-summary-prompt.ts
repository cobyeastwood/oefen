import type { SummaryContext } from './load-summary-context';
import {
  serializeCheckpoint,
  serializePrior,
  serializeWellness,
} from './serialize-summary-prompt';

/** Build the JSON prompt the summary agent consumes. */
export function buildSummaryPrompt(context: SummaryContext): string {
  return JSON.stringify(
    {
      checkpoint: serializeCheckpoint(context.checkpoint),
      priorCheckpoint: context.prior ? serializePrior(context.prior) : null,
      goalTarget: context.goalTarget,
      wellness: serializeWellness(context.wellness),
      priorWellness: context.priorWellness
        ? serializeWellness(context.priorWellness)
        : null,
    },
    null,
    2,
  );
}
