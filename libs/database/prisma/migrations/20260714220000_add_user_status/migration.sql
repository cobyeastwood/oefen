-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'paused', 'disabled');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'active';
