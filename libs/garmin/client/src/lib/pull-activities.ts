import type { GarminConnectClient } from './garmin-connect-client';

type GarminActivityPayload = Awaited<
  ReturnType<GarminConnectClient['getActivities']>
>[number];

const PAGE_SIZE = 20;

/** Fetch one page of recent Garmin activities. */
export async function pullActivities(
  client: GarminConnectClient,
): Promise<GarminActivityPayload[]> {
  return client.getActivities(0, PAGE_SIZE);
}
