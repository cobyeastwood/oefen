import { createHash } from 'node:crypto';
import { Agent } from '@mastra/core/agent';

const SUMMARIZER_INSTRUCTIONS = `You describe frozen training facts in plain language, max 120 words.
Use only numbers present in the provided JSON. Never invent, extrapolate, or estimate values.
You may state comparisons between the provided checkpoints and the goal target as arithmetic facts.
When pace fields are present, state elapsed time versus progress in one sentence, and the gap to target in one sentence, as numbers only.
When volumeDelta is present, state current distance versus the trailing average once. Never characterize the change as good, bad, risky, or safe.
Never advise, prescribe, recommend, warn, or suggest any training action. Never speculate about causes.
If data is sparse, say so plainly.`;

const SUMMARIZER_MODEL = 'google/gemini-2.5-flash-lite';

/** Tag for summary input shape; bump when prompt JSON fields change. */
export const SUMMARIZER_INPUT_SCHEMA_TAG = 'volume-delta-v1';

export const SUMMARIZER_PROMPT = {
  instructions: SUMMARIZER_INSTRUCTIONS,
  model: SUMMARIZER_MODEL,
  inputSchemaTag: SUMMARIZER_INPUT_SCHEMA_TAG,
} as const;

export const PROMPT_VERSION = createHash('sha256')
  .update(SUMMARIZER_PROMPT.instructions)
  .update('\0')
  .update(SUMMARIZER_PROMPT.model)
  .update('\0')
  .update(SUMMARIZER_PROMPT.inputSchemaTag)
  .digest('hex')
  .slice(0, 12);

let summarizerAgent: Agent | null = null;

export function getSummarizerAgent(): Agent {
  if (!summarizerAgent) {
    summarizerAgent = new Agent({
      id: 'summarizer',
      name: 'Summarizer',
      instructions: SUMMARIZER_PROMPT.instructions,
      model: SUMMARIZER_PROMPT.model,
    });
  }

  return summarizerAgent;
}
