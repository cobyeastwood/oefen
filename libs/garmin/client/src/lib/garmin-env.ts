import type { GarminTokens } from './garmin-tokens';

/** Lambda (SSM_PREFIX set) never password-logins unless explicitly allowed. */
export function passwordLoginAllowed(): boolean {
  if (process.env['GARMIN_ALLOW_PASSWORD_LOGIN'] === '1') {
    return true;
  }
  if (process.env['GARMIN_ALLOW_PASSWORD_LOGIN'] === '0') {
    return false;
  }
  return !process.env['SSM_PREFIX'];
}

export function tokensFromEnv(): GarminTokens | undefined {
  const tokensJson = process.env['GARMIN_TOKENS']?.trim();
  if (!tokensJson) {
    return undefined;
  }
  return JSON.parse(tokensJson) as GarminTokens;
}
