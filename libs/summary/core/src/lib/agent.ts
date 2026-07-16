import { createHash } from 'node:crypto';
import { Agent } from '@mastra/core/agent';

const SUMMARY_INSTRUCTIONS = `You describe frozen training facts in plain language, max 120 words.
Use only numbers present in the provided JSON. Never invent, extrapolate, or estimate values.
You may state comparisons between the provided checkpoints and the goal target as arithmetic facts.
When pace fields are present, state elapsed time versus progress in one sentence, and the gap to target in one sentence, as numbers only.
When volumeDelta is present, state current distance versus the trailing average once. Never characterize the change as good, bad, risky, or safe.
Never advise, prescribe, recommend, warn, or suggest any training action. Never speculate about causes.
If data is sparse, say so plainly.`;

const SUMMARY_MODEL = 'google/gemini-2.5-flash-lite';

/** Tag for summary input shape; bump when prompt JSON fields change. */
export const SUMMARY_INPUT_SCHEMA_TAG = 'volume-delta-v1';

export const SUMMARY_PROMPT = {
  instructions: SUMMARY_INSTRUCTIONS,
  model: SUMMARY_MODEL,
  inputSchemaTag: SUMMARY_INPUT_SCHEMA_TAG,
} as const;

export const PROMPT_VERSION = createHash('sha256')
  .update(SUMMARY_PROMPT.instructions)
  .update('\0')
  .update(SUMMARY_PROMPT.model)
  .update('\0')
  .update(SUMMARY_PROMPT.inputSchemaTag)
  .digest('hex')
  .slice(0, 12);

let summaryAgent: Agent | null = null;

export function getSummaryAgent(): Agent {
  if (!summaryAgent) {
    summaryAgent = new Agent({
      id: 'summary',
      name: 'Summary',
      instructions: SUMMARY_PROMPT.instructions,
      model: SUMMARY_PROMPT.model,
    });
  }

  return summaryAgent;
}
