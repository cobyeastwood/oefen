import type { Handler } from 'aws-lambda';

import { generateSummary } from '@oefen/summary/core';

import { loadSummaryConfig } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

type SummaryEvent = {
  checkpointId: string;
};

export const handler: Handler = async (event: SummaryEvent) => {
  try {
    await loadSummaryConfig();

    if (!event?.checkpointId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: 'checkpointId is required' }),
      };
    }

    const result = await generateSummary(event.checkpointId);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    console.error('Summary error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Summary failed' }),
    };
  } finally {
    await disconnectPrisma();
  }
};
