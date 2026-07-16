import type { Goal } from '@prisma/client';

import type { SummarizerInvoker } from '../invoke-summarizer';
import type { DeadlineMilestone } from '../metrics';

export type FreezeResult = { created: boolean; checkpointId?: string };

/** Optional goal/session attachments applied when freezing a checkpoint. */
export type FreezeAttachments = {
  goalId?: string | null;
  sessionId?: string | null;
  goal?: Goal | null;
  /** Remaining-ratio milestone for deadline_quarter freezes. */
  milestone?: DeadlineMilestone;
  /** Override default in-process summarizer (e.g. worker Lambda invoke). */
  invokeSummarizer?: SummarizerInvoker;
};
