import type { CheckpointType } from '@prisma/client';
import { findCheckpointByPeriod, listSessionsInPeriod } from '@oefen/database';

import { invokeSummarizer } from '../invoke-summarizer';
import { createFrozenCheckpoint } from './create-frozen-checkpoint';
import { resolveFreezeGoal } from './resolve-freeze-goal';
import type { FreezeAttachments, FreezeResult } from './types';

export type { FreezeAttachments, FreezeResult } from './types';

/**
 * Idempotently freeze a period: load sessions → resolve goal → create → summarize.
 */
export async function freezeCheckpoint(
  type: CheckpointType,
  periodStart: Date,
  periodEnd: Date,
  attachments: FreezeAttachments = {},
): Promise<FreezeResult> {
  const existing = await findCheckpointByPeriod(type, periodStart, periodEnd);
  if (existing) {
    return { created: false, checkpointId: existing.id };
  }

  const sessions = await listSessionsInPeriod(periodStart, periodEnd);
  const resolved = await resolveFreezeGoal(periodEnd, attachments);

  const created = await createFrozenCheckpoint({
    type,
    periodStart,
    periodEnd,
    sessions,
    ...resolved,
    sessionId: attachments.sessionId,
  });

  if (created.created && created.checkpointId) {
    await invokeSummarizer(created.checkpointId);
  }

  return created;
}
