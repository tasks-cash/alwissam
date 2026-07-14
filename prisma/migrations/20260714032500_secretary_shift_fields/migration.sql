-- Additive only: align SecretaryProfile with schema.prisma (no data loss)
ALTER TABLE "SecretaryProfile" ADD COLUMN IF NOT EXISTS "shiftCode" TEXT NOT NULL DEFAULT 'MORNING';
ALTER TABLE "SecretaryProfile" ADD COLUMN IF NOT EXISTS "workStartTime" TEXT NOT NULL DEFAULT '07:00';
ALTER TABLE "SecretaryProfile" ADD COLUMN IF NOT EXISTS "workEndTime" TEXT NOT NULL DEFAULT '14:30';
ALTER TABLE "SecretaryProfile" ADD COLUMN IF NOT EXISTS "workDays" TEXT NOT NULL DEFAULT 'SUN,MON,TUE,WED,THU,SAT';
