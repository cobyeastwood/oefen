-- CreateTable
CREATE TABLE "garmin_daily_summaries" (
    "id" TEXT NOT NULL,
    "calendar_date" DATE NOT NULL,
    "steps" INTEGER,
    "sleep_seconds" INTEGER,
    "deep_sleep_seconds" INTEGER,
    "light_sleep_seconds" INTEGER,
    "rem_sleep_seconds" INTEGER,
    "awake_sleep_seconds" INTEGER,
    "sleep_score" INTEGER,
    "sleep_stress_avg" DOUBLE PRECISION,
    "resting_heart_rate" INTEGER,
    "weight_grams" DOUBLE PRECISION,
    "sleep_raw" JSONB,
    "heart_rate_raw" JSONB,
    "weight_raw" JSONB,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garmin_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garmin_daily_summaries_calendar_date_key" ON "garmin_daily_summaries"("calendar_date");
