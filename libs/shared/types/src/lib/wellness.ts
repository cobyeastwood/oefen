export type WellnessReading = {
  steps?: number | null;
  sleepSeconds?: number | null;
  restingHeartRate?: number | null;
  hydrationOz?: number | null;
};

export type WellnessAverages = {
  avgSteps: number | null;
  avgSleepSeconds: number | null;
  avgRestingHeartRate: number | null;
  avgHydrationOz: number | null;
  daysWithSteps: number;
  daysWithSleep: number;
  daysWithRhr: number;
  daysWithHydration: number;
  dayCount: number;
};
