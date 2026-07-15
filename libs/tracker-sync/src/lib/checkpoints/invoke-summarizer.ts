import { generateSummary } from '@oefen/summarizer';

export type SummarizerInvokeResult = {
  invoked: 'lambda' | 'local';
  checkpointId: string;
  skipped?: boolean;
};

export type SummarizerInvoker = (
  checkpointId: string,
) => Promise<SummarizerInvokeResult>;

/** In-process summarizer (local/dev). Apps supply a remote invoker when needed. */
export async function invokeSummarizer(
  checkpointId: string,
): Promise<SummarizerInvokeResult> {
  try {
    const result = await generateSummary(checkpointId);
    return {
      invoked: 'local',
      checkpointId,
      skipped: result.skipped,
    };
  } catch (error) {
    console.warn('Local summarizer failed:', error);
    return { invoked: 'local', skipped: true, checkpointId };
  }
}
