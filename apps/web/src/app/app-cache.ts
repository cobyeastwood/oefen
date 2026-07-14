import type { Goal } from './api';
import type { AppTab } from './app-nav';

const STORAGE_KEY = 'oefen:app-cache:v1';

export type AppCache = {
  tab: AppTab;
  goals: Goal[];
  phoneE164: string | null;
};

function parseTab(value: unknown): AppTab {
  return value === 'settings' ? 'settings' : 'goal';
}

export function readAppCache(): AppCache | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AppCache>;
    if (!Array.isArray(parsed.goals)) return null;
    return {
      tab: parseTab(parsed.tab),
      goals: parsed.goals.slice(0, 1),
      phoneE164:
        typeof parsed.phoneE164 === 'string' || parsed.phoneE164 === null
          ? parsed.phoneE164
          : null,
    };
  } catch {
    return null;
  }
}

export function writeAppCache(cache: AppCache) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tab: parseTab(cache.tab),
        goals: cache.goals.slice(0, 1),
        phoneE164: cache.phoneE164,
      }),
    );
  } catch {
    // Ignore quota / private-mode failures.
  }
}
