import type { Goal } from '@prisma/client';

export type FreezeResult = { created: boolean; checkpointId?: string };

/** Optional goal/session attachments applied when freezing a checkpoint. */
export type FreezeAttachments = {
  goalId?: string | null;
  sessionId?: string | null;
  goal?: Goal | null;
};
