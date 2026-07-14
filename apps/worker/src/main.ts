import type { Handler } from 'aws-lambda';
import { getUser, isUserSyncEnabled } from '@oefen/database';
import { syncGarmin } from '@oefen/tracker';

import { loadWorkerConfig, persistGarminTokens } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

export const handler: Handler = async (event) => {
  console.log('Received event:', JSON.stringify(event));

  try {
    await loadWorkerConfig();

    const user = await getUser();
    if (!isUserSyncEnabled(user.status)) {
      console.log(`User status is ${user.status}; skipping Garmin sync`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          skipped: true,
          reason: user.status,
        }),
      };
    }

    const result = await syncGarmin(user);

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (error) {
    console.error('Worker error:', error);
    // Rethrow so EventBridge Scheduler retries later (returning 500 still
    // counts as a successful invoke and skips the schedule retry policy).
    throw error;
  } finally {
    // Write tokens to SSM only after a password login this run — not when we
    // merely reused existing SSM tokens.
    if (
      process.env['GARMIN_TOKENS_SHOULD_PERSIST'] === '1' &&
      process.env['GARMIN_TOKENS'] &&
      process.env['SSM_PREFIX']
    ) {
      try {
        await persistGarminTokens(process.env['GARMIN_TOKENS']);
        console.log('Persisted Garmin tokens to SSM');
      } catch (persistError) {
        console.error('Failed to persist Garmin tokens:', persistError);
      }
    }

    await disconnectPrisma();
  }
};
