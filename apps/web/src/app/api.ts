import type { GoalRevision, SetGoalInput } from '@oefen/tracker-core';
import type { DistancePeriod, GoalType } from '@oefen/utils';

export type User = {
  id: string;
  phoneE164: string | null;
  status: 'active' | 'paused' | 'disabled';
};

export type Goal = {
  id: string;
  targetMetric: string;
  targetValue: number;
  unit: string;
  deadline: string | null;
  note: string | null;
  status: string;
  effectiveFrom?: string;
};

export type { GoalRevision, DistancePeriod, GoalType };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return body as T;
}

export function getUser() {
  return request<{ user: User }>('/api/user');
}

export function updateUser(input: {
  phoneE164?: string | null;
  status?: User['status'];
}) {
  return request<{ user: User }>('/api/user', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function getGoals() {
  return request<{ goals: Goal[] }>('/api/goals');
}

type SetGoalRequest = Omit<SetGoalInput, 'deadline'> & {
  deadline?: string | null;
};

export function setGoal(input: SetGoalRequest) {
  return request('/api/goals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
