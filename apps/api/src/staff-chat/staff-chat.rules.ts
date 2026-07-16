import { ForbiddenException } from "@nestjs/common";
import { isOwnerRole } from "../common/auth/roles";
import {
  isWithinSecretaryShift,
  SECRETARY_OUTSIDE_SHIFT_MESSAGE,
  SECRETARY_SHIFT_ENDED_MESSAGE,
  type SecretarySchedule,
} from "../common/auth/secretary-shift";

export const STAFF_CHAT_DOCTOR_SIDE = new Set([
  "DOCTOR_GENERAL",
  "DOCTOR_SPECIALIST",
  "ADMIN",
  "ADMIN_OWNER",
  "OWNER",
  "SUPER_ADMIN",
]);

export function isStaffChatRole(role: string): boolean {
  return STAFF_CHAT_DOCTOR_SIDE.has(role) || role === "SECRETARY";
}

export function roleLabelAr(code: string): string {
  switch (code) {
    case "SECRETARY":
      return "سكرتير/ة";
    case "DOCTOR_SPECIALIST":
      return "طبيب أخصائي";
    case "DOCTOR_GENERAL":
    case "DOCTOR":
      return "طبيب عام";
    case "ADMIN":
    case "ADMIN_OWNER":
    case "OWNER":
    case "SUPER_ADMIN":
      return "إدارة / صاحبة العيادة";
    default:
      return code;
  }
}

export function peerGroupForRole(
  role: string,
): "DOCTORS" | "SECRETARIES" {
  return role === "SECRETARY" ? "SECRETARIES" : "DOCTORS";
}

/** When secretary has assignedDoctorIds, restrict doctor peers to that set. */
export function filterAssignedDoctors(
  doctorIds: string[],
  assignedDoctorIds: string[] | undefined | null,
): string[] {
  if (!assignedDoctorIds || assignedDoctorIds.length === 0) return doctorIds;
  const allow = new Set(assignedDoctorIds.map(String));
  return doctorIds.filter((id) => allow.has(id));
}

/**
 * Doctor sees secretaries who are unassigned (clinic-wide) or assigned to them.
 * Owners/admins see all secretaries (caller filters beforehand).
 */
export function secretaryVisibleToDoctor(
  doctorId: string,
  secretaryAssignedDoctorIds: string[] | undefined | null,
): boolean {
  if (!secretaryAssignedDoctorIds || secretaryAssignedDoctorIds.length === 0) {
    return true;
  }
  return secretaryAssignedDoctorIds.map(String).includes(String(doctorId));
}

export function assertSecretaryCanChat(
  roleCode: string,
  schedule: SecretarySchedule | undefined | null,
  now = new Date(),
): void {
  if (roleCode !== "SECRETARY") return;
  if (!isWithinSecretaryShift(schedule, now)) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: SECRETARY_OUTSIDE_SHIFT_MESSAGE,
    });
  }
}

export function secretaryShiftEndedMessage(): string {
  return SECRETARY_SHIFT_ENDED_MESSAGE;
}

export function canDeleteStaffMessage(input: {
  actorId: string;
  actorRole: string;
  senderId: string;
  receiverId: string;
  kind: string;
}): boolean {
  const isSender = input.actorId === input.senderId;
  const isReceiver = input.actorId === input.receiverId;
  if (input.kind === "VOICE") {
    return isSender || isReceiver || isOwnerRole(input.actorRole);
  }
  return isSender || isOwnerRole(input.actorRole);
}

export function sortedParticipantPair(
  a: string,
  b: string,
): [string, string] {
  return a < b ? [a, b] : [b, a];
}
