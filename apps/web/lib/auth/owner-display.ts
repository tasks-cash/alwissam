import { isOwnerRole } from "./role-paths";

export type OwnerDoctorProfile = {
  type?: "GENERAL" | "SPECIALIST" | string;
};

export type OwnerDisplayUser = {
  fullName?: string | null;
  role?: string | null;
  doctor?: OwnerDoctorProfile | null;
};

export function formatOwnerDisplay(
  user: OwnerDisplayUser | null | undefined,
  opts?: { compact?: boolean },
): { primary: string; secondary?: string; full: string } {
  const fullName = (user?.fullName || "").trim();
  const role = String(user?.role || "");
  const doctorType = String(user?.doctor?.type || "").toUpperCase();
  const doctorPrefix = fullName ? `الدكتور ${fullName}` : "مالك النظام";

  if (!isOwnerRole(role)) {
    return {
      primary: fullName || "مستخدم",
      full: fullName || "مستخدم",
    };
  }

  let secondary = "مالك النظام والطبيب الرئيسي";
  if (doctorType === "SPECIALIST") {
    secondary = "مالك النظام وطبيب مختص";
  } else if (doctorType === "GENERAL") {
    secondary = "مالك النظام وطبيب عام";
  }

  if (opts?.compact) {
    return {
      primary: doctorPrefix,
      secondary,
      full: `${doctorPrefix} — ${secondary}`,
    };
  }

  return {
    primary: `${doctorPrefix} — ${secondary}`,
    secondary,
    full: `${doctorPrefix} — ${secondary}`,
  };
}
