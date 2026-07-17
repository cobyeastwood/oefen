import type { Handler } from 'aws-lambda';
import { getUser, isUserSyncEnabled } from '@oefen/shared/database';
import { syncGarmin } from '@oefen/tracker/sync';

import { invokeSummary } from './lib/invoke-summary';
import {
  assertTokensLoaded,
  loadWorkerConfig,
  logWorkerConfigReady,
} from './lib/load-config';
import {
  captureAndPersistTokens,
  persistPendingTokens,
} from './lib/persist-garmin-tokens';
import { disconnectPrisma } from './lib/prisma';

type SyncUser = Awaited<ReturnType<typeof getUser>>;
type OkBody = Record<string, unknown>;

function okResponse(body: OkBody) {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, ...body }),
  };
}

async function prepareWorker(): Promise<void> {
  await loadWorkerConfig();
  logWorkerConfigReady();
  assertTokensLoaded();
}

async function runGarminSync(user: SyncUser, startedAt: number) {
  const result = await syncGarmin(user, {
    onAuthenticated: captureAndPersistTokens,
    onSyncComplete: captureAndPersistTokens,
    invokeSummary,
  });

  console.log('[worker] Sync completed', {
    durationMs: Date.now() - startedAt,
    fetched: result.fetched,
    ingested: result.ingested,
    skipped: result.skipped,
    wellness: result.wellness,
    detectorsCreated: result.detectors.createdCount,
    lastSyncAt: result.lastSyncAt,
  });

  return result;
}

async function cleanupWorker(): Promise<void> {
  await persistPendingTokens();
  await disconnectPrisma();
}

export const handler: Handler = async (event) => {
  const startedAt = Date.now();
  console.log('[worker] Invoke started', {
    hasEvent: event != null,
    ssmPrefix: process.env['SSM_PREFIX'] ?? null,
    summaryFunction: process.env['SUMMARY_FUNCTION_NAME'] ?? null,
  });

  try {
    await prepareWorker();

    const user = await getUser();
    if (!isUserSyncEnabled(user.status)) {
      console.log('[worker] Sync skipped — user status not enabled', {
        status: user.status,
      });
      return okResponse({ skipped: true, reason: user.status });
    }

    const result = await runGarminSync(user, startedAt);
    return okResponse(result);
  } catch (error) {
    console.error('[worker] Sync failed', {
      durationMs: Date.now() - startedAt,
      error,
    });
    // Rethrow so EventBridge Scheduler retries later (returning 500 still
    // counts as a successful invoke and skips the schedule retry policy).
    throw error;
  } finally {
    await cleanupWorker();
  }
};
