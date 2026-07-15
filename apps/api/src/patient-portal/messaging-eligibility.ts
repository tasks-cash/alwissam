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
  return true;
}
