import { GarminConnect } from 'garmin-connect';

import {
  passwordLoginAllowed,
  tokensFromEnv,
} from './garmin-env';
import {
  createThrottleState,
  isAuthError,
  throttledRequest,
} from './garmin-request';
import type { GarminTokens } from './garmin-tokens';

export type { GarminTokens } from './garmin-tokens';

/** HttpClient surface we need for oauth2 refresh (not on GarminConnect). */
type GarminHttpClient = {
  refreshOauth2Token: () => Promise<void>;
};

type GarminConnectClientOptions = {
  username: string;
  password: string;
  tokens?: GarminTokens;
  /**
   * When false (Lambda / SSM_PREFIX set), never hit SSO password login —
   * require stored tokens and fail clearly if they are unusable.
   */
  allowPasswordLogin?: boolean;
};

export class GarminConnectClient {
  private readonly client: GarminConnect;
  private connected = false;
  private usedStoredTokens = false;
  private readonly allowPasswordLogin: boolean;
  private readonly throttle = createThrottleState();

  constructor(private readonly options: GarminConnectClientOptions) {
    this.client = new GarminConnect({
      username: options.username,
      password: options.password,
    });
    this.allowPasswordLogin = options.allowPasswordLogin ?? true;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    if (this.options.tokens) {
      await this.connectWithStoredTokens(this.options.tokens);
    } else if (this.allowPasswordLogin) {
      await this.passwordLogin('No stored tokens — password login');
    } else {
      throw new Error(
        'GARMIN_TOKENS missing in SSM. Seed once from a non-Lambda network into /oefen/worker/garmin-tokens',
      );
    }

    this.connected = true;
  }

  exportTokens(): GarminTokens {
    return this.client.exportToken();
  }

  /** Snapshot current tokens (incl. after oauth2 refresh) for SSM. */
  captureTokens(): void {
    process.env['GARMIN_TOKENS'] = JSON.stringify(this.exportTokens());
    process.env['GARMIN_TOKENS_SHOULD_PERSIST'] = '1';
  }

  /**
   * Refresh oauth2 via oauth1 exchange (connectapi, not sso.garmin.com).
   * Call after loadToken and persist the result so the next cold start stays valid.
   */
  async refreshOauth2(): Promise<void> {
    console.log('[garmin] Refreshing oauth2 via token exchange');
    const http = (this.client as unknown as { client: GarminHttpClient })
      .client;
    await http.refreshOauth2Token();
    this.captureTokens();
    console.log('[garmin] Oauth2 refreshed; tokens marked for persist');
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

  private async connectWithStoredTokens(tokens: GarminTokens): Promise<void> {
    this.client.loadToken(tokens.oauth1, tokens.oauth2);
    this.usedStoredTokens = true;
    console.log('[garmin] Using stored tokens');
    // Exchange oauth1 → fresh oauth2 (no SSO). Keeps daily Lambda alive.
    await this.refreshOauth2();
  }

  /** Password SSO login once, then capture tokens for persist. */
  private async passwordLogin(reason: string): Promise<void> {
    console.log(`[garmin] ${reason}`);
    await this.client.login();
    this.captureTokens();
    console.log('[garmin] Password login succeeded; tokens captured');
  }

  private async request<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await throttledRequest(this.throttle, fn);
    } catch (error) {
      if (!this.usedStoredTokens || !isAuthError(error)) {
        throw error;
      }
      return this.recoverFromAuthError(fn, error);
    }
  }

  private async recoverFromAuthError<T>(
    fn: () => Promise<T>,
    originalError: unknown,
  ): Promise<T> {
    try {
      console.warn('[garmin] API auth failed — trying oauth2 refresh');
      await this.refreshOauth2();
      return await throttledRequest(this.throttle, fn);
    } catch (refreshError) {
      if (!this.allowPasswordLogin) {
        console.error(
          '[garmin] Oauth2 refresh failed; SSO disabled in Lambda',
          refreshError ?? originalError,
        );
        throw new Error(
          'Stored Garmin tokens were rejected and password SSO is disabled in Lambda. Re-seed oauth tokens into /oefen/worker/garmin-tokens',
        );
      }

      return this.recoverWithPasswordLogin(fn);
    }
  }

  private async recoverWithPasswordLogin<T>(fn: () => Promise<T>): Promise<T> {
    this.usedStoredTokens = false;
    await this.passwordLogin('Refresh failed — password login again');
    return throttledRequest(this.throttle, fn);
  }
}

export function createGarminClientFromEnv(): GarminConnectClient {
  const username = process.env['GARMIN_USERNAME'];
  const password = process.env['GARMIN_PASSWORD'];

  if (!username || !password) {
    throw new Error('GARMIN_USERNAME and GARMIN_PASSWORD are required');
  }

  return new GarminConnectClient({
    username,
    password,
    tokens: tokensFromEnv(),
    allowPasswordLogin: passwordLoginAllowed(),
  });
}

export { passwordLoginAllowed } from './garmin-env';
