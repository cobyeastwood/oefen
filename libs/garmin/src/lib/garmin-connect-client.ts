import { GarminConnect } from 'garmin-connect';

import { isAuthError, withGarminRequest } from './garmin-request';

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
  private readonly throttle = { lastRequestAt: 0 };

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
    } else {
      await withGarminRequest(this.throttle, () => this.client.login());
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

  getSleepDuration(date = new Date()) {
    return this.request(() => this.client.getSleepDuration(date));
  }

  getDailyWeightInPounds(date = new Date()) {
    return this.request(() => this.client.getDailyWeightInPounds(date));
  }

  getDailyHydration(date = new Date()) {
    return this.request(() => this.client.getDailyHydration(date));
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
      await withGarminRequest(this.throttle, () => this.client.login());
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

  const tokensJson = process.env['GARMIN_TOKENS'];
  const tokens = tokensJson
    ? (JSON.parse(tokensJson) as GarminTokens)
    : undefined;

  return new GarminConnectClient({ username, password, tokens });
}
