import { runDetectors } from '../checkpoints/detectors';
import { connectGarmin } from './connect-garmin';
import { fetchRunningActivities } from './fetch-running-activities';
import { ingestActivities } from './ingest-activities';
import { syncWellness } from './sync-wellness';

type SyncUser = {
  createdAt: Date;
};

/** Connect → fetch runs → ingest sessions → wellness → detectors. */
export async function syncGarmin(user: SyncUser) {
  const client = await connectGarmin();
  const { activities, knownActivityIds } = await fetchRunningActivities(
    client,
    user.createdAt,
  );
  const { ingested, skipped } = await ingestActivities(
    activities,
    knownActivityIds,
  );
  const wellness = await syncWellness(client, activities);
  const detectors = await runDetectors();

  return {
    fetched: activities.length,
    ingested,
    skipped,
    wellness,
    detectors,
    lastSyncAt: new Date().toISOString(),
  };
}
