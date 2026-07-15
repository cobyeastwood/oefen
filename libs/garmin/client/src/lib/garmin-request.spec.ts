import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createThrottleState,
  isRateLimitError,
  throttledRequest,
} from './garmin-request';

describe('isRateLimitError', () => {
  it('detects 429 status and rate-limit messages', () => {
    expect(isRateLimitError({ status: 429 })).toBe(true);
    expect(isRateLimitError({ response: { status: 503 } })).toBe(true);
    expect(
      isRateLimitError({
        message: 'ERROR: (429), Too Many Requests, "Rate limited"',
      }),
    ).toBe(true);
    expect(isRateLimitError({ status: 400 })).toBe(false);
  });
});

describe('throttledRequest', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('serializes concurrent callers so requests do not overlap', async () => {
    const state = createThrottleState();
    const inflight: number[] = [];
    let peak = 0;

    const call = (id: number) =>
      throttledRequest(state, async () => {
        inflight.push(id);
        peak = Math.max(peak, inflight.length);
        await new Promise((resolve) => setTimeout(resolve, 20));
        inflight.pop();
        return id;
      });

    const results = await Promise.all([call(1), call(2), call(3)]);

    expect(results).toEqual([1, 2, 3]);
    expect(peak).toBe(1);
  });

  it('retries rate limits then succeeds', async () => {
    vi.useFakeTimers();
    const state = createThrottleState();
    let attempts = 0;

    const pending = throttledRequest(state, async () => {
      attempts += 1;
      if (attempts < 3) {
        throw { status: 429, message: 'Rate limited' };
      }
      return 'ok';
    });

    await vi.runAllTimersAsync();
    await expect(pending).resolves.toBe('ok');
    expect(attempts).toBe(3);
  });

  it('gives up after exhausting rate-limit retries', async () => {
    vi.useFakeTimers();
    const state = createThrottleState();

    const pending = throttledRequest(state, async () => {
      throw { status: 429, message: 'Rate limited' };
    });

    const expectation = expect(pending).rejects.toMatchObject({ status: 429 });
    await vi.runAllTimersAsync();
    await expectation;
  });
});
