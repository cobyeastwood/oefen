import { GarminConnect } from 'garmin-connect';

import {
  createGarminThrottleState,
  isAuthError,
  withGarminRequest,
} from './garmin-request';

export type GarminTokens = ReturnType<GarminConnect['exportToken']>;

type GarminConnectClientOptions = {
  username: string;
  password: string;
  tokens?: GarminTokens;
};

export class GarminConnectClient {
  private readonly client: GarminConnect;
  private connected = false;
  private usedStoredTokens = false;
  private readonly throttle = createGarminThrottleState();

  constructor(private readonly options: GarminConnectClientOptions) {
    this.client = new GarminConnect({
      username: options.username,
      password: options.password,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.options.tokens) {
      this.client.loadToken(
        this.options.tokens.oauth1,
        this.options.tokens.oauth2,
      );
      this.usedStoredTokens = true;
      console.log('Using Garmin tokens from SSM');
    } else {
      console.log('No stored Garmin tokens, logging in');
      // Single login attempt — do not retry on 429.
      await this.client.login();
      this.captureTokensAfterLogin();
    }

    this.connected = true;
  }

  exportTokens(): GarminTokens {
    return this.client.exportToken();
  }

  getActivities(start = 0, limit = 20) {
    return this.request(() => this.client.getActivities(start, limit));
  }

  getSteps(date = new Date()) {
    return this.request(() => this.client.getSteps(date));
  }

  getSleepData(date = new Date()) {
    return this.request(() => this.client.getSleepData(date));
  }

  getHeartRate(date = new Date()) {
    return this.request(() => this.client.getHeartRate(date));
  }

  getDailyWeightData(date = new Date()) {
    return this.request(() => this.client.getDailyWeightData(date));
  }

  getDailyWeightInPounds(date = new Date()) {
    return this.request(() => this.client.getDailyWeightInPounds(date));
  }

  getDailyHydration(date = new Date()) {
    return this.request(() => this.client.getDailyHydration(date));
  }

  /** Only set after a password login; worker persists these to SSM. */
  private captureTokensAfterLogin(): void {
    process.env['GARMIN_TOKENS'] = JSON.stringify(this.exportTokens());
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] = '1';
  }

  private async request<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await withGarminRequest(this.throttle, fn);
    } catch (error) {
      if (!this.usedStoredTokens || !isAuthError(error)) {
        throw error;
      }

      this.usedStoredTokens = false;
      console.warn('Stored Garmin tokens expired, logging in again');
      await this.client.login();
      this.captureTokensAfterLogin();
      return withGarminRequest(this.throttle, fn);
    }
  }
}

export function createGarminConnectClientFromEnv(): GarminConnectClient {
  const username = process.env['GARMIN_USERNAME'];
  const password = process.env['GARMIN_PASSWORD'];

  if (!username || !password) {
    throw new Error('GARMIN_USERNAME and GARMIN_PASSWORD are required');
  }

  const tokensJson = process.env['GARMIN_TOKENS']?.trim();
  const tokens = tokensJson
    ? (JSON.parse(tokensJson) as GarminTokens)
    : undefined;

  return new GarminConnectClient({ username, password, tokens });
}
