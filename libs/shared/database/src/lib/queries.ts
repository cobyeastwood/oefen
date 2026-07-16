import type {
  CheckpointType,
  GoalStatus,
  Prisma,
  SessionSource,
} from '@prisma/client';

import { getPrisma } from './client';

export type GoalSnapshot = {
  id: string;
  targetMetric: string;
  targetValue: number;
  unit: string;
  deadline: string | null;
  note: string | null;
};

export function serializeGoalSnapshot(goal: {
  id: string;
  targetMetric: string;
  targetValue: number;
  unit: string;
  deadline: Date | null;
  note: string | null;
}): GoalSnapshot {
  return {
    id: goal.id,
    targetMetric: goal.targetMetric,
    targetValue: goal.targetValue,
    unit: goal.unit,
    deadline: goal.deadline?.toISOString() ?? null,
    note: goal.note,
  };
}

/** UTC calendar date at midnight (for @db.Date columns). */
export function toUtcCalendarDate(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export async function listSessions() {
  const prisma = await getPrisma();
  return prisma.session.findMany({ orderBy: { occurredAt: 'desc' } });
}

export async function createSession(data: {
  sport?: string;
  occurredAt: Date;
  durationS: number;
  distanceM: number;
  avgHr?: number | null;
  maxHr?: number | null;
  rpe?: number | null;
  feel?: string | null;
  title?: string | null;
  source?: SessionSource;
  wellnessId?: string | null;
}) {
  const prisma = await getPrisma();
  return prisma.session.create({
    data: {
      sport: data.sport ?? 'run',
      occurredAt: data.occurredAt,
      durationS: data.durationS,
      distanceM: data.distanceM,
      avgHr: data.avgHr ?? null,
      maxHr: data.maxHr ?? null,
      rpe: data.rpe ?? null,
      feel: data.feel ?? null,
      title: data.title ?? null,
      source: data.source ?? 'garmin',
      wellnessId: data.wellnessId ?? null,
    },
  });
}

export async function updateSession(
  id: string,
  data: Prisma.SessionUpdateInput,
) {
  const prisma = await getPrisma();
  return prisma.session.update({ where: { id }, data });
}

export async function listKnownActivityIds(): Promise<Set<number>> {
  const prisma = await getPrisma();
  const activities = await prisma.activity.findMany({
    select: { garminActivityId: true },
  });
  const ids = new Set<number>();
  for (const activity of activities) {
    ids.add(Number(activity.garminActivityId));
  }
  return ids;
}

export async function upsertActivity(data: {
  garminActivityId: number;
  typeKey: string;
  name?: string | null;
  startTimeGmt: Date;
  durationS: number;
  distanceM: number;
  avgHr?: number | null;
  maxHr?: number | null;
  sessionId?: string | null;
}) {
  const prisma = await getPrisma();
  const garminActivityId = BigInt(data.garminActivityId);
  return prisma.activity.upsert({
    where: { garminActivityId },
    create: {
      garminActivityId,
      typeKey: data.typeKey,
      name: data.name ?? null,
      startTimeGmt: data.startTimeGmt,
      durationS: data.durationS,
      distanceM: data.distanceM,
      avgHr: data.avgHr ?? null,
      maxHr: data.maxHr ?? null,
      sessionId: data.sessionId ?? null,
    },
    update: {
      typeKey: data.typeKey,
      name: data.name ?? null,
      startTimeGmt: data.startTimeGmt,
      durationS: data.durationS,
      distanceM: data.distanceM,
      avgHr: data.avgHr ?? null,
      maxHr: data.maxHr ?? null,
      ...(data.sessionId !== undefined ? { sessionId: data.sessionId } : {}),
    },
  });
}

export async function upsertWellness(data: {
  calendarDate: Date;
  steps?: number | null;
  sleepSeconds?: number | null;
  deepSleepSeconds?: number | null;
  lightSleepSeconds?: number | null;
  remSleepSeconds?: number | null;
  awakeSleepSeconds?: number | null;
  restingHeartRate?: number | null;
  minHeartRate?: number | null;
  maxHeartRate?: number | null;
  weightPounds?: number | null;
  hydrationOz?: number | null;
}) {
  const prisma = await getPrisma();
  const calendarDate = toUtcCalendarDate(data.calendarDate);
  const values = {
    steps: data.steps ?? null,
    sleepSeconds: data.sleepSeconds ?? null,
    deepSleepSeconds: data.deepSleepSeconds ?? null,
    lightSleepSeconds: data.lightSleepSeconds ?? null,
    remSleepSeconds: data.remSleepSeconds ?? null,
    awakeSleepSeconds: data.awakeSleepSeconds ?? null,
    restingHeartRate: data.restingHeartRate ?? null,
    minHeartRate: data.minHeartRate ?? null,
    maxHeartRate: data.maxHeartRate ?? null,
    weightPounds: data.weightPounds ?? null,
    hydrationOz: data.hydrationOz ?? null,
  };
  return prisma.wellness.upsert({
    where: { calendarDate },
    create: { calendarDate, ...values },
    update: values,
  });
}

export async function listWellnessInPeriod(
  periodStart: Date,
  periodEnd: Date,
) {
  const prisma = await getPrisma();
  return prisma.wellness.findMany({
    where: {
      calendarDate: {
        gte: toUtcCalendarDate(periodStart),
        lt: toUtcCalendarDate(periodEnd),
      },
    },
    orderBy: { calendarDate: 'asc' },
  });
}

export async function attachSessionsToWellness(
  calendarDate: Date,
  wellnessId: string,
) {
  const prisma = await getPrisma();
  const day = toUtcCalendarDate(calendarDate);
  const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
  return prisma.session.updateMany({
    where: {
      occurredAt: { gte: day, lt: nextDay },
      wellnessId: null,
    },
    data: { wellnessId },
  });
}

export function sessionEnd(session: { occurredAt: Date; durationS: number }) {
  return new Date(session.occurredAt.getTime() + session.durationS * 1000);
}

export function intervalsOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
  gapMs: number,
): boolean {
  const aLo = aStart.getTime() - gapMs;
  const aHi = aEnd.getTime() + gapMs;
  return bStart.getTime() <= aHi && bEnd.getTime() >= aLo;
}

type MergeCandidateInput = {
  sport: string;
  occurredAt: Date;
  durationS: number;
  gapMs?: number;
};

type MergeCandidateSession = {
  sport: string;
  occurredAt: Date;
  durationS: number;
};

/** Pure pick: first same-sport session overlapping the incoming window. */
export function pickMergeCandidate<T extends MergeCandidateSession>(
  sessions: T[],
  input: MergeCandidateInput,
): T | null {
  const gapMs = input.gapMs ?? 2 * 60 * 60 * 1000;
  const incomingEnd = new Date(
    input.occurredAt.getTime() + input.durationS * 1000,
  );

  for (const session of sessions) {
    if (session.sport !== input.sport) {
      continue;
    }
    const end = sessionEnd(session);
    if (
      intervalsOverlap(
        input.occurredAt,
        incomingEnd,
        session.occurredAt,
        end,
        gapMs,
      )
    ) {
      return session;
    }
  }

  return null;
}

export async function findMergeCandidate(input: MergeCandidateInput) {
  const sessions = await listSessions();
  return pickMergeCandidate(sessions, input);
}

export async function listActiveGoals() {
  const prisma = await getPrisma();
  const goals = await prisma.goal.findMany({
    where: { status: 'active' },
    orderBy: { effectiveFrom: 'desc' },
  });

  const referenced = new Set<string>();
  for (const goal of goals) {
    if (goal.continuesId) referenced.add(goal.continuesId);
    if (goal.supersedesId) referenced.add(goal.supersedesId);
  }

  return goals.filter((goal) => !referenced.has(goal.id));
}

/** Current goal tip (newest active goal that is not continued/superseded by another). */
export async function getActiveGoalTip() {
  const goals = await listActiveGoals();
  return goals[0] ?? null;
}

export async function createGoal(data: {
  targetMetric: string;
  targetValue: number;
  unit: string;
  deadline?: Date | null;
  note?: string | null;
  effectiveFrom?: Date;
  continuesId?: string | null;
  supersedesId?: string | null;
}) {
  const prisma = await getPrisma();
  return prisma.goal.create({
    data: {
      targetMetric: data.targetMetric,
      targetValue: data.targetValue,
      unit: data.unit,
      deadline: data.deadline ?? null,
      note: data.note ?? null,
      effectiveFrom: data.effectiveFrom ?? new Date(),
      continuesId: data.continuesId ?? null,
      supersedesId: data.supersedesId ?? null,
    },
  });
}

export async function updateGoalStatus(id: string, status: GoalStatus) {
  const prisma = await getPrisma();
  return prisma.goal.update({ where: { id }, data: { status } });
}

export async function getActiveGoalAt(at: Date) {
  const goals = await listActiveGoals();
  return (
    goals
      .filter((goal) => goal.effectiveFrom.getTime() <= at.getTime())
      .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())[0] ??
    null
  );
}

export async function getCheckpointById(id: string) {
  const prisma = await getPrisma();
  return prisma.checkpoint.findUnique({ where: { id } });
}

export async function findCheckpointByPeriod(
  type: CheckpointType,
  periodStart: Date,
  periodEnd: Date,
) {
  const prisma = await getPrisma();
  return prisma.checkpoint.findUnique({
    where: { type_periodStart_periodEnd: { type, periodStart, periodEnd } },
  });
}

export async function findCheckpointByGoalAndType(
  goalId: string,
  type: CheckpointType,
) {
  const prisma = await getPrisma();
  return prisma.checkpoint.findFirst({
    where: { goalId, type },
    orderBy: { periodEnd: 'desc' },
  });
}

export async function listCheckpointsForGoal(goalId: string) {
  const prisma = await getPrisma();
  return prisma.checkpoint.findMany({
    where: { goalId },
    orderBy: { periodEnd: 'asc' },
  });
}

export async function findPriorCheckpoint(
  type: CheckpointType,
  beforeEnd: Date,
) {
  const prisma = await getPrisma();
  return prisma.checkpoint.findFirst({
    where: { type, periodEnd: { lt: beforeEnd } },
    orderBy: { periodEnd: 'desc' },
  });
}

/** Newest-first prior checkpoints of a type ending before `beforeEnd`. */
export async function listPriorCheckpoints(
  type: CheckpointType,
  beforeEnd: Date,
  take: number,
) {
  if (take <= 0) {
    return [];
  }
  const prisma = await getPrisma();
  return prisma.checkpoint.findMany({
    where: { type, periodEnd: { lt: beforeEnd } },
    orderBy: { periodEnd: 'desc' },
    take,
  });
}

export async function createCheckpoint(data: {
  type: CheckpointType;
  periodStart: Date;
  periodEnd: Date;
  sessionCount: number;
  durationS: number;
  distanceM: number;
  metricsJson: Prisma.InputJsonValue;
  goalId?: string | null;
  goalSnapshot?: Prisma.InputJsonValue | null;
  sessionId?: string | null;
}) {
  const prisma = await getPrisma();
  return prisma.checkpoint.create({
    data: {
      type: data.type,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      sessionCount: data.sessionCount,
      durationS: data.durationS,
      distanceM: data.distanceM,
      metricsJson: data.metricsJson,
      goalId: data.goalId ?? undefined,
      goalSnapshot: data.goalSnapshot ?? undefined,
      sessionId: data.sessionId ?? undefined,
    },
  });
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

export async function upsertSummary(input: {
  checkpointId: string;
  content: string;
  promptVersion: string;
}) {
  const prisma = await getPrisma();
  return prisma.summary.upsert({
    where: { checkpointId: input.checkpointId },
    create: input,
    update: { content: input.content, promptVersion: input.promptVersion },
  });
}

export async function markSummarySmsSent(summaryId: string) {
  const prisma = await getPrisma();
  return prisma.summary.update({
    where: { id: summaryId },
    data: { smsSentAt: new Date() },
  });
}

export async function listSessionsInPeriod(
  periodStart: Date,
  periodEnd: Date,
) {
  const prisma = await getPrisma();
  return prisma.session.findMany({
    where: {
      occurredAt: { gte: periodStart, lt: periodEnd },
    },
    orderBy: { occurredAt: 'asc' },
  });
}
