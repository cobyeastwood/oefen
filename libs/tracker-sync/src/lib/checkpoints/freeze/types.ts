import type { Goal } from '@prisma/client';

import type { SummarizerInvoker } from '../invoke-summarizer';

export type FreezeResult = { created: boolean; checkpointId?: string };

/** Optional goal/session attachments applied when freezing a checkpoint. */
export type FreezeAttachments = {
  goalId?: string | null;
  sessionId?: string | null;
  goal?: Goal | null;
  /** Override default in-process summarizer (e.g. worker Lambda invoke). */
  invokeSummarizer?: SummarizerInvoker;
};
