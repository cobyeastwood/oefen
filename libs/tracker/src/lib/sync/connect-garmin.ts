import {
  createGarminConnectClientFromEnv,
  type GarminConnectClient,
} from '@oefen/garmin';

/** Connect using env credentials, or SSM tokens when present. */
export async function connectGarmin(): Promise<GarminConnectClient> {
  const client = createGarminConnectClientFromEnv();
  await client.connect();
  return client;
}
