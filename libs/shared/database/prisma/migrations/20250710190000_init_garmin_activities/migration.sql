-- CreateTable
CREATE TABLE "garmin_activities" (
    "id" TEXT NOT NULL,
    "garmin_activity_id" BIGINT NOT NULL,
    "activity_name" TEXT NOT NULL,
    "activity_type_key" TEXT NOT NULL,
    "start_time_local" TIMESTAMP(3) NOT NULL,
    "start_time_gmt" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "average_speed" DOUBLE PRECISION,
    "elevation_gain" DOUBLE PRECISION,
    "raw" JSONB,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garmin_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garmin_activities_garmin_activity_id_key" ON "garmin_activities"("garmin_activity_id");
