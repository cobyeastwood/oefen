import type { GarminConnectClient } from '@oefen/garmin';

import { persistGarminTokens } from './load-config';

/** True when env was marked dirty after login or oauth2 refresh. */
function shouldPersistTokens(): boolean {
  return (
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] === '1' &&
    Boolean(process.env['GARMIN_TOKENS']) &&
    Boolean(process.env['SSM_PREFIX'])
  );
}

/** Write GARMIN_TOKENS to SSM when marked for persist. */
export async function persistPendingTokens(): Promise<void> {
  if (!shouldPersistTokens()) {
    return;
  }

  const tokensJson = process.env['GARMIN_TOKENS'];
  if (!tokensJson) {
    return;
  }

  try {
    console.log('[worker] Persisting Garmin tokens to SSM');
    await persistGarminTokens(tokensJson);
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] = '0';
    console.log('[worker] Garmin tokens persisted to SSM');
  } catch (persistError) {
    console.error('[worker] Failed to persist Garmin tokens:', persistError);
  }
}

/** Snapshot client tokens and persist so oauth2 refresh survives cold starts. */
export async function captureAndPersistTokens(
  client: GarminConnectClient,
): Promise<void> {
  client.captureTokens();
  await persistPendingTokens();
}
