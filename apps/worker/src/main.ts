import type { Handler } from 'aws-lambda';
import { syncGarmin } from '@oefen/tracker';

import { loadWorkerConfig, persistGarminTokens } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

export const handler: Handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  try {
    await loadWorkerConfig();

    const result = await syncGarmin();

    if (process.env['GARMIN_TOKENS'] && process.env['SSM_PREFIX']) {
      await persistGarminTokens(process.env['GARMIN_TOKENS']);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    console.error('Worker error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'Worker execution failed' }),
    };
  } finally {
    await disconnectPrisma();
  }
};
