import { ForbiddenException } from "@nestjs/common";

/**
 * Pure messaging eligibility rules for completed-appointment doctor chat.
 * Kept side-effect free for unit testing without Mongo.
 */
export function assertCompletedVisitMessaging(input: {
  appointmentStatus: string;
  appointmentPatientId: string;
  actorPatientId: string;
  doctorRoleCode?: string | null;
  doctorId?: string | null;
  doctorAccountStatus?: string | null;
  doctorDeleted?: boolean;
  doctorProfileActive?: boolean | null;
  threadStatus?: string | null;
  completedAt?: Date | string | null;
  /** Days after visit completion; omit or null = no window limit. */
  followUpWindowDays?: number | null;
}) {
  if (input.appointmentPatientId !== input.actorPatientId) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "المحادثة غير مسموحة لهذا الموعد.",
    });
  }
  if (input.appointmentStatus !== "COMPLETED") {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "يمكن التواصل مع الطبيب فقط بخصوص زيارة مكتملة.",
    });
  }
  if (!input.doctorId) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "لا يوجد طبيب معيّن لهذا الموعد.",
    });
  }
  if (
    !input.doctorRoleCode ||
    !["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(input.doctorRoleCode)
  ) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "لا يمكن فتح محادثة مع هذا الحساب.",
    });
  }
  if (input.doctorDeleted) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "حساب الطبيب غير متاح حاليًا.",
    });
  }
  if (
    input.doctorAccountStatus &&
    input.doctorAccountStatus !== "ACTIVE"
  ) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "حساب الطبيب غير نشط حاليًا.",
    });
  }
  if (input.doctorProfileActive === false) {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "ملف الطبيب غير نشط حاليًا.",
    });
  }
  if (input.threadStatus === "archived") {
    throw new ForbiddenException({
      code: "FORBIDDEN",
      message: "هذه المحادثة مؤرشفة ولا يمكن متابعة المراسلة عليها.",
    });
  }
  const windowDays = input.followUpWindowDays;
  if (
    windowDays != null &&
    Number.isFinite(windowDays) &&
    windowDays > 0 &&
    input.completedAt
  ) {
    const completed =
      input.completedAt instanceof Date
        ? input.completedAt
        : new Date(input.completedAt);
    if (!Number.isNaN(completed.getTime())) {
      const ms = windowDays * 24 * 60 * 60 * 1000;
      if (Date.now() - completed.getTime() > ms) {
        throw new ForbiddenException({
          code: "FORBIDDEN",
          message: "انتهت فترة المتابعة المتاحة للتواصل بخصوص هذه الزيارة.",
        });
      }
    }
  }
  return true;
}

export function isDoctorMessagingEligible(doctor: {
  roleCode?: string | null;
  status?: string | null;
  deletedAt?: Date | string | null;
  doctor?: { isActive?: boolean | null } | null;
}): boolean {
  if (!doctor?.roleCode) return false;
  if (!["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(doctor.roleCode)) {
    return false;
  }
  if (doctor.deletedAt) return false;
  if (doctor.status && doctor.status !== "ACTIVE") return false;
  if (doctor.doctor?.isActive === false) return false;
  return true;
}

/** Optional clinic window from env; unset = no limit. */
export function resolveFollowUpWindowDays(): number | null {
  const raw = process.env.PATIENT_FOLLOWUP_MESSAGING_DAYS;
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.floor(n);
}
