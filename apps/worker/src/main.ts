import type { Handler } from 'aws-lambda';
import { getUser, isUserSyncEnabled } from '@oefen/database';
import { syncGarmin } from '@oefen/tracker-sync';

import { invokeSummarizer } from './lib/invoke-summarizer';
import { loadWorkerConfig, persistGarminTokens } from './lib/load-config';
import { disconnectPrisma } from './lib/prisma';

/** Persist tokens to SSM after a password login this run. */
async function persistNewGarminTokens(): Promise<void> {
  if (
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] !== '1' ||
    !process.env['GARMIN_TOKENS'] ||
    !process.env['SSM_PREFIX']
  ) {
    return;
  }

  try {
    await persistGarminTokens(process.env['GARMIN_TOKENS']);
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] = '0';
    console.log('Persisted Garmin tokens to SSM');
  } catch (persistError) {
    console.error('Failed to persist Garmin tokens:', persistError);
  }
}

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

    const result = await syncGarmin(user, {
      // Save tokens as soon as login succeeds, before the rest of sync.
      onAuthenticated: persistNewGarminTokens,
      invokeSummarizer,
    });

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
    // Safety net if auth refreshed mid-sync after onAuthenticated.
    await persistNewGarminTokens();
    await disconnectPrisma();
  }
};
