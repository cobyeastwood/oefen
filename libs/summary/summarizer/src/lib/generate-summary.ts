import { getSummarizerAgent } from './agent';
import { buildSummaryPrompt } from './build-summary-prompt';
import { dispatchSummarySms } from './dispatch-summary-sms';
import { loadSummaryContext } from './load-summary-context';
import { persistSummary } from './persist-summary';

async function generateSummaryText(prompt: string): Promise<string> {
  const result = await getSummarizerAgent().generate(prompt);
  const content = result.text?.trim();
  if (!content) {
    throw new Error('Summarizer returned empty content');
  }
  return content;
}

/** Load context → prompt agent → persist summary → optionally SMS. */
export async function generateSummary(checkpointId: string) {
  if (!process.env['GOOGLE_GENERATIVE_AI_API_KEY']) {
    console.warn('GOOGLE_GENERATIVE_AI_API_KEY not set; skipping summary');
    return { skipped: true as const };
  }

  const context = await loadSummaryContext(checkpointId);
  const content = await generateSummaryText(buildSummaryPrompt(context));
  const summary = await persistSummary(checkpointId, content);

  await dispatchSummarySms(summary, context.checkpoint);

  return { skipped: false as const, summary };
}
