import type { GarminConnectClient } from '@oefen/garmin';

import { runDetectors } from '../checkpoints/detectors';
import type { SummarizerInvoker } from '../checkpoints/invoke-summarizer';
import { connectGarmin } from './connect-garmin';
import { fetchRunningActivities } from './fetch-running-activities';
import { ingestActivities } from './ingest-activities';
import { syncWellness } from './sync-wellness';

type SyncUser = {
  createdAt: Date;
};

type SyncGarminOptions = {
  /** Called right after Garmin auth (token load or password login). */
  onAuthenticated?: (client: GarminConnectClient) => void | Promise<void>;
  /** Called after sync finishes successfully (e.g. persist refreshed tokens). */
  onSyncComplete?: (client: GarminConnectClient) => void | Promise<void>;
  /** App-supplied summarizer kickoff (e.g. invoke summary Lambda). */
  invokeSummarizer?: SummarizerInvoker;
};

/** Connect → fetch runs → ingest sessions → wellness → detectors. */
export async function syncGarmin(user: SyncUser, options?: SyncGarminOptions) {
  const client = await connectGarmin();
  await options?.onAuthenticated?.(client);

  const { activities, knownActivityIds } = await fetchRunningActivities(
    client,
    user.createdAt,
  );
  const { ingested, skipped } = await ingestActivities(
    activities,
    knownActivityIds,
  );
  const wellness = await syncWellness(client, activities);
  const detectors = await runDetectors(new Date(), {
    invokeSummarizer: options?.invokeSummarizer,
  });

  await options?.onSyncComplete?.(client);

  return {
    fetched: activities.length,
    ingested,
    skipped,
    wellness,
    detectors,
    lastSyncAt: new Date().toISOString(),
  };
}
