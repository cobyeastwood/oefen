import type { PrismaClient } from '@oefen/database';

import type { GarminConnectClient } from './garmin-connect-client';

type SleepData = Awaited<ReturnType<GarminConnectClient['getSleepData']>>;
type HeartRateData = Awaited<ReturnType<GarminConnectClient['getHeartRate']>>;
type WeightData = Awaited<
  ReturnType<GarminConnectClient['getDailyWeightData']>
>;

function yesterday(): Date {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return date;
}

function toCalendarDate(date: Date): Date {
  const offset = date.getTimezoneOffset();
  const offsetDate = new Date(date.getTime() - offset * 60 * 1000);
  const value = offsetDate.toISOString().split('T')[0];
  return new Date(`${value}T00:00:00.000Z`);
}

async function tryFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

function mapSleepFields(sleepData: SleepData | null) {
  if (!sleepData) {
    return {
      sleepSeconds: null,
      deepSleepSeconds: null,
      lightSleepSeconds: null,
      remSleepSeconds: null,
      awakeSleepSeconds: null,
      sleepScore: null,
      sleepStressAvg: null,
      sleepRaw: undefined,
    };
  }

  const sleep = sleepData.dailySleepDTO;

  return {
    sleepSeconds: sleep?.sleepTimeSeconds ?? null,
    deepSleepSeconds: sleep?.deepSleepSeconds ?? null,
    lightSleepSeconds: sleep?.lightSleepSeconds ?? null,
    remSleepSeconds: sleep?.remSleepSeconds ?? null,
    awakeSleepSeconds: sleep?.awakeSleepSeconds ?? null,
    sleepScore: sleep?.sleepScores?.overall?.value ?? null,
    sleepStressAvg: sleep?.avgSleepStress ?? null,
    sleepRaw: sleepData as unknown as object,
  };
}

function mapHeartRateFields(heartRateData: HeartRateData | null) {
  if (!heartRateData) {
    return { restingHeartRate: null, heartRateRaw: undefined };
  }

  const record = heartRateData as Record<string, unknown>;
  const rawResting = record['restingHeartRate'];
  const restingHeartRate =
    typeof rawResting === 'number'
      ? rawResting
      : typeof rawResting === 'string'
        ? Number(rawResting)
        : null;

  return {
    restingHeartRate:
      restingHeartRate !== null && Number.isFinite(restingHeartRate)
        ? Math.round(restingHeartRate)
        : null,
    heartRateRaw: heartRateData as unknown as object,
  };
}

function mapWeightFields(weightData: WeightData | null) {
  if (!weightData) {
    return { weightGrams: null, weightRaw: undefined };
  }

  const record = weightData as Record<string, unknown>;
  const totalAverage = record['totalAverage'] as
    | Record<string, unknown>
    | undefined;
  const weight = totalAverage?.['weight'];

  return {
    weightGrams: typeof weight === 'number' ? weight : null,
    weightRaw: weightData as unknown as object,
  };
}

async function fetchDailySummary(client: GarminConnectClient, date: Date) {
  const steps = await tryFetch(() => client.getSteps(date));
  const sleepData = await tryFetch(() => client.getSleepData(date));
  const heartRateData = await tryFetch(() => client.getHeartRate(date));
  const weightData = await tryFetch(() => client.getDailyWeightData(date));

  const sleepFields = mapSleepFields(sleepData);
  const heartRateFields = mapHeartRateFields(heartRateData);
  const weightFields = mapWeightFields(weightData);

  return {
    calendarDate: toCalendarDate(date),
    steps,
    ...sleepFields,
    restingHeartRate:
      heartRateFields.restingHeartRate ??
      (typeof sleepData?.restingHeartRate === 'number'
        ? Math.round(sleepData.restingHeartRate)
        : null),
    heartRateRaw: heartRateFields.heartRateRaw,
    ...weightFields,
    syncedAt: new Date(),
  };
}

export async function syncDailySummary(
  prisma: PrismaClient,
  client: GarminConnectClient,
) {
  const summary = await fetchDailySummary(client, yesterday());

  await prisma.garminDailySummary.upsert({
    where: { calendarDate: summary.calendarDate },
    create: summary,
    update: summary,
  });

  return { fetched: 1, upserted: 1 };
}
