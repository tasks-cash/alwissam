-- Additive only: Patient QR passwordless login token
ALTER TABLE "PatientAccount" ADD COLUMN IF NOT EXISTS "qrAccessToken" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "PatientAccount_qrAccessToken_key" ON "PatientAccount"("qrAccessToken");
