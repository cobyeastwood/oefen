import { generateSummary } from '@oefen/summary/core';

export type SummaryInvokeResult = {
  invoked: 'lambda' | 'local';
  checkpointId: string;
  skipped?: boolean;
};

export type SummaryInvoker = (
  checkpointId: string,
) => Promise<SummaryInvokeResult>;

/** In-process summary generation (local/dev). Apps supply a remote invoker when needed. */
export async function invokeSummary(
  checkpointId: string,
): Promise<SummaryInvokeResult> {
  try {
    const result = await generateSummary(checkpointId);
    return {
      invoked: 'local',
      checkpointId,
      skipped: result.skipped,
    };
  } catch (error) {
    console.warn('Local summary generation failed:', error);
    return { invoked: 'local', skipped: true, checkpointId };
  }
}
