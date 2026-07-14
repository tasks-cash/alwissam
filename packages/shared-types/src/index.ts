/** Legacy RoleCode enum values from Prisma — keep in sync during migration. */
export type RoleCode =
  | "ADMIN"
  | "SECRETARY"
  | "DOCTOR_GENERAL"
  | "DOCTOR_SPECIALIST"
  | "PATIENT";

export const ROLE_CODES: readonly RoleCode[] = [
  "ADMIN",
  "SECRETARY",
  "DOCTOR_GENERAL",
  "DOCTOR_SPECIALIST",
  "PATIENT",
] as const;

export type MongodbHealthStatus = "up" | "down" | "skipped";

export type HealthResponse = {
  status: "ok";
  service: string;
  mongodb: MongodbHealthStatus;
  timestamp: string;
};
