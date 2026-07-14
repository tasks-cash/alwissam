import { connectMongo } from "@/lib/db/mongo";
import { AuditLogModel } from "@/lib/db/models/auth";
import type { RoleCode } from "@/lib/auth/roles";

export type AuditInput = {
  userId?: string | null;
  roleCode?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  reason?: string | null;
  ipAddress?: string | null;
  deviceInfo?: string | null;
};

export async function createAuditLog(input: AuditInput) {
  await connectMongo();
  return AuditLogModel.create({
    userId: input.userId || undefined,
    roleCode: input.roleCode || undefined,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || undefined,
    oldValue: input.oldValue ?? undefined,
    newValue: input.newValue ?? undefined,
    reason: input.reason || undefined,
    ipAddress: input.ipAddress || undefined,
    deviceInfo: input.deviceInfo || undefined,
  });
}

export function roleDashboardPath(
  role: RoleCode,
  _options?: { doctorType?: "GENERAL" | "SPECIALIST" | null },
): string {
  switch (role) {
    case "ADMIN":
      return "/doctor/specialist/dashboard";
    case "SECRETARY":
      return "/secretary/dashboard";
    case "DOCTOR_GENERAL":
      return "/doctor/general/dashboard";
    case "DOCTOR_SPECIALIST":
      return "/doctor/specialist/dashboard";
    case "PATIENT":
      return "/patient/dashboard";
    default:
      return "/";
  }
}
