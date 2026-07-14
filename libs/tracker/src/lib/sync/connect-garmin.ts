import {
  createGarminConnectClientFromEnv,
  type GarminConnectClient,
} from '@oefen/garmin';

/** Connect using env credentials/tokens and refresh stored tokens. */
export async function connectGarmin(): Promise<GarminConnectClient> {
  const client = createGarminConnectClientFromEnv();
  await client.connect();
  process.env['GARMIN_TOKENS'] = JSON.stringify(client.exportTokens());
  return client;
}
