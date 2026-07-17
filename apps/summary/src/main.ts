import type { Handler } from 'aws-lambda';

import { generateSummary } from '@oefen/summary/core';

import { loadSummaryConfig } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

type SummaryEvent = {
  checkpointId: string;
};

export const handler: Handler = async (event: SummaryEvent) => {
  const startedAt = Date.now();
  console.log('[summary] Invoke started', {
    checkpointId: event?.checkpointId ?? null,
    ssmPrefix: process.env['SSM_PREFIX'] ?? null,
  });

  try {
    await loadSummaryConfig();

    if (!event?.checkpointId) {
      console.error('[summary] Missing checkpointId — rejecting invoke');
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'checkpointId is required' }),
      };
    }

    const result = await generateSummary(event.checkpointId);

    console.log('[summary] Invoke completed', {
      durationMs: Date.now() - startedAt,
      skipped: result.skipped,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    console.error('[summary] Invoke failed', {
      durationMs: Date.now() - startedAt,
      checkpointId: event?.checkpointId ?? null,
      error,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Summary failed' }),
    };
  } finally {
    await disconnectPrisma();
  }
};
