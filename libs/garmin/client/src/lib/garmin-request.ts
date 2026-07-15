const REQUEST_DELAY_MS = 1_500;
const MAX_RETRIES = 6;
const RETRY_BASE_MS = 5_000;
const RETRY_MAX_MS = 60_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const { response, status } = error as {
    response?: { status?: number };
    status?: number;
  };

  const code = response?.status ?? status;
  return code === 401 || code === 403;
}

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const { response, status, message } = error as {
    response?: { status?: number };
    status?: number;
    message?: string;
  };
  const code = response?.status ?? status;

  if (code === 429 || code === 503) {
    return true;
  }

  const text = String(message ?? '').toLowerCase();
  return text.includes('rate') || text.includes('too many');
}

function retryAfterMs(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const headers = (error as { response?: { headers?: Record<string, unknown> } })
    .response?.headers;
  if (!headers) {
    return null;
  }

  const raw = headers['retry-after'] ?? headers['Retry-After'];
  if (raw == null) {
    return null;
  }

  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return null;
  }

  return Math.min(RETRY_MAX_MS, seconds * 1000);
}

function backoffMs(error: unknown, attempt: number): number {
  const fromHeader = retryAfterMs(error);
  if (fromHeader != null) {
    return fromHeader;
  }

  const exponential = Math.min(RETRY_MAX_MS, RETRY_BASE_MS * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 1_000);
  return exponential + jitter;
}

export type GarminThrottleState = {
  lastRequestAt: number;
  /** Ensures concurrent callers wait turns instead of bypassing the delay. */
  queue: Promise<unknown>;
};

export function createThrottleState(): GarminThrottleState {
  return { lastRequestAt: 0, queue: Promise.resolve() };
}

export async function throttledRequest<T>(
  state: GarminThrottleState,
  fn: () => Promise<T>
): Promise<T> {
  const run = async (): Promise<T> => {
    const elapsed = Date.now() - state.lastRequestAt;

    if (elapsed < REQUEST_DELAY_MS) {
      await sleep(REQUEST_DELAY_MS - elapsed);
    }

    for (let attempt = 0; ; attempt++) {
      try {
        const result = await fn();
        state.lastRequestAt = Date.now();
        return result;
      } catch (error) {
        if (!isRateLimitError(error) || attempt >= MAX_RETRIES) {
          throw error;
        }

        const waitMs = backoffMs(error, attempt);
        console.warn(`Garmin rate limit hit, retrying in ${waitMs}ms`);
        await sleep(waitMs);
      }
    }
  };

  const previous = state.queue;
  let release!: () => void;
  state.queue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return await run();
  } finally {
    release();
  }
}
