const REQUEST_DELAY_MS = 800;
const MAX_RETRIES = 4;
const RETRY_BASE_MS = 2_000;

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

function isRateLimitError(error: unknown): boolean {
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

type ThrottleState = { lastRequestAt: number };

export async function withGarminRequest<T>(
  state: ThrottleState,
  fn: () => Promise<T>
): Promise<T> {
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

      const backoffMs = RETRY_BASE_MS * 2 ** attempt;
      console.warn(`Garmin rate limit hit, retrying in ${backoffMs}ms`);
      await sleep(backoffMs);
    }
  }
}
