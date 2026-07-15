import type { Handler } from 'aws-lambda';

import { generateSummary } from '@oefen/summary/summarizer';

import { loadSummarizerConfig } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

type SummarizerEvent = {
  checkpointId: string;
};

export const handler: Handler = async (event: SummarizerEvent) => {
  try {
    await loadSummarizerConfig();

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
    console.error('Summarizer error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Summarizer failed' }),
    };
  } finally {
    await disconnectPrisma();
  }
};
