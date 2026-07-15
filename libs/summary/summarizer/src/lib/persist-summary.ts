import { upsertSummary } from '@oefen/shared/database';

import { PROMPT_VERSION } from './agent';

/** Persist generated summary text for a checkpoint. */
export async function persistSummary(checkpointId: string, content: string) {
  return upsertSummary({
    checkpointId,
    content,
    promptVersion: PROMPT_VERSION,
  });
}
