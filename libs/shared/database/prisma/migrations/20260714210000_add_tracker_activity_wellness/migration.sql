-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "garmin_activity_id" BIGINT NOT NULL,
    "type_key" TEXT NOT NULL,
    "name" TEXT,
    "start_time_gmt" TIMESTAMP(3) NOT NULL,
    "duration_s" INTEGER NOT NULL,
    "distance_m" DOUBLE PRECISION NOT NULL,
    "avg_hr" INTEGER,
    "max_hr" INTEGER,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness" (
    "id" TEXT NOT NULL,
    "calendar_date" DATE NOT NULL,
    "steps" INTEGER,
    "sleep_seconds" INTEGER,
    "deep_sleep_seconds" INTEGER,
    "light_sleep_seconds" INTEGER,
    "rem_sleep_seconds" INTEGER,
    "awake_sleep_seconds" INTEGER,
    "resting_heart_rate" INTEGER,
    "min_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "weight_pounds" DOUBLE PRECISION,
    "hydration_oz" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wellness_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "wellness_id" TEXT;

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN IF EXISTS "is_benchmark",
DROP COLUMN IF EXISTS "activity_ids";

-- CreateIndex
CREATE UNIQUE INDEX "activities_garmin_activity_id_key" ON "activities"("garmin_activity_id");

-- CreateIndex
CREATE INDEX "activities_session_id_idx" ON "activities"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "wellness_calendar_date_key" ON "wellness"("calendar_date");

-- CreateIndex
CREATE INDEX "sessions_wellness_id_idx" ON "sessions"("wellness_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_wellness_id_fkey" FOREIGN KEY ("wellness_id") REFERENCES "wellness"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
