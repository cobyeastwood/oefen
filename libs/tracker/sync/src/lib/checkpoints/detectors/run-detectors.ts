import {
  getActiveGoalTip,
  listCheckpointsForGoal,
  listSessions,
} from '@oefen/shared/database';

import type { FreezeResult } from '../freeze';
import type { SummaryInvoker } from '../invoke-summary';
import { deadlineQuarterDetector } from './detect-deadline-quarter';
import { goalReachedDetector } from './detect-goal-reached';
import { weeklySinceGoalDetector } from './detect-weekly-since-goal';
import { filterSessionsInWindow } from './filter-sessions-in-window';
import type { Detector, DetectorContext } from './detector';

/** Ordered registry — append new Detector implementations here. */
export const DETECTORS: readonly Detector[] = [
  weeklySinceGoalDetector,
  deadlineQuarterDetector,
  goalReachedDetector,
];

type RunDetectorsResult = {
  results: Record<string, FreezeResult[]>;
  createdCount: number;
};

type RunDetectorsOptions = {
  invokeSummary?: SummaryInvoker;
};

async function buildDetectorContext(
  now: Date,
  options: RunDetectorsOptions = {},
): Promise<DetectorContext> {
  const goal = await getActiveGoalTip();

  if (!goal) {
    return {
      now,
      goal: null,
      checkpoints: [],
      sessions: [],
      invokeSummary: options.invokeSummary,
    };
  }

  const [checkpoints, allSessions] = await Promise.all([
    listCheckpointsForGoal(goal.id),
    listSessions(),
  ]);

  const sessions = filterSessionsInWindow(
    allSessions,
    goal.effectiveFrom,
    now,
  );

  return {
    now,
    goal,
    checkpoints,
    sessions,
    invokeSummary: options.invokeSummary,
  };
}

export async function runDetectors(
  now = new Date(),
  options: RunDetectorsOptions = {},
): Promise<RunDetectorsResult> {
  const ctx = await buildDetectorContext(now, options);

  const results: Record<string, FreezeResult[]> = {};
  let createdCount = 0;

  for (const detector of DETECTORS) {
    const items = await detector.detect(ctx);
    results[detector.id] = items;
    createdCount += items.filter((r) => r.created).length;
  }

  return { results, createdCount };
}
