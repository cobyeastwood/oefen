import type { Handler } from 'aws-lambda';
import {
  createGarminConnectClientFromEnv,
  syncGarminToDatabase,
} from '@oefen/garmin-connect';

import { loadWorkerConfig, persistGarminTokens } from './lib/load-config';
import { disconnectPrisma, getPrisma } from './lib/prisma';

export const handler: Handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  try {
    await loadWorkerConfig();

    const prisma = await getPrisma();
    const client = createGarminConnectClientFromEnv();

    await client.connect();
    const result = await syncGarminToDatabase(prisma, client);

    if (process.env.SSM_PREFIX) {
      await persistGarminTokens(JSON.stringify(client.exportTokens()));
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
