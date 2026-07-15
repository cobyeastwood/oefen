export type ActivityDraft = {
  externalId: number;
  typeKey: string;
  sport: string;
  occurredAt: Date;
  durationS: number;
  distanceM: number;
  avgHr: number | null;
  maxHr: number | null;
  rpe: number | null;
  feel: string | null;
  title: string | null;
};

export type WellnessDayPayload = {
  calendarDate: Date;
  steps: number | null;
  sleepSeconds: number | null;
  deepSleepSeconds: number | null;
  lightSleepSeconds: number | null;
  remSleepSeconds: number | null;
  awakeSleepSeconds: number | null;
  restingHeartRate: number | null;
  minHeartRate: number | null;
  maxHeartRate: number | null;
  weightPounds: number | null;
  hydrationOz: number | null;
};

