import type { Checkpoint, Goal, Session } from '@prisma/client';

import type { FreezeResult } from '../freeze';
import type { SummaryInvoker } from '../invoke-summary';

/** Shared input for every checkpoint detector. */
export type DetectorContext = {
  now: Date;
  goal: Goal | null;
  /** Checkpoints for the active tip (empty when there is no goal). */
  checkpoints: Checkpoint[];
  /** Sessions in `[goal.effectiveFrom, now]` (empty when there is no goal). */
  sessions: Session[];
  /** When set, used to kick off summary after a freeze (e.g. Lambda invoke). */
  invokeSummary?: SummaryInvoker;
};

/**
 * One checkpoint detector. Add new detectors by implementing this and
 * registering them in `DETECTORS`.
 */
export type Detector = {
  /** Stable key in `runDetectors` results (e.g. weeklySinceGoal). */
  readonly id: string;
  detect(ctx: DetectorContext): Promise<FreezeResult[]>;
};
