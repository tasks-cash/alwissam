/**
 * Admin/Owner dashboard mode contracts.
 *
 * Formula (product):
 *   QUICK = all features documented in ALWISSAM_COMPLETE_DASHBOARD_SPECIFICATION.md
 *   FULL  = QUICK + every additional working Nest/Mongo feature
 *
 * Reality gate (this monorepo):
 *   Only WORKING Next+Nest+Mongo features appear in navigation.
 *   Spec features that are incomplete stay HIDDEN until repaired
 *   (see docs/admin-dashboard/FINAL_QUICK_AND_FULL_DASHBOARD_REPORT.md).
 *
 * Stack: Next.js → NestJS → MongoDB/Mongoose. No Prisma/SQL.
 */
import type { Locale } from "./i18n/config";
import { isOwnerRole } from "./auth/role-paths";

export type NavItem = {
  href: string;
  labelKey: string;
  roles: string[];
  /** Admin density: quick = spec-parity working set; full = quick + Nest extras. */
  adminModes?: Array<"quick" | "full">;
  group?:
    | "daily"
    | "people"
    | "medical"
    | "appointments"
    | "comms"
    | "content"
    | "system";
};

export type AdminDashboardMode = "quick" | "full";

/**
 * الوضع السريع — working features that map to the COMPLETE SPEC live surfaces
 * (admin/owner board, reception ops, doctor exam board, settings).
 * Incomplete spec items (dental chart, clinical chart depth, QR login, etc.)
 * are intentionally omitted until Nest+Mongo implementations are complete.
 * Staff chat is included once Nest `/api/staff/chat` + WebSocket are live.
 */
export const ADMIN_QUICK_HREFS = [
  "/doctor/specialist/dashboard",
  "/doctor/specialist/doctors",
  "/doctor/specialist/secretaries",
  "/doctor/specialist/patients",
  "/doctor/specialist/invitations",
  "/doctor/specialist/settings",
  "/doctor/specialist/audit-logs",
  "/doctor/general/dashboard",
  "/secretary/dashboard",
  "/secretary/patients",
  "/secretary/appointments",
  "/secretary/today",
  "/secretary/directed",
  "/secretary/assignment-queue",
  "/secretary/payments",
  "/secretary/messages",
] as const;

/**
 * الوضع الشامل — Quick ∪ Nest-only working modules not in the legacy
 * Prisma-era “live” admin map (or marked NOT FOUND there).
 */
export const ADMIN_FULL_EXTRA_HREFS = [
  "/doctor/specialist/public-content/patient-experiences",
  "/doctor/specialist/public-content/before-after",
  "/doctor/specialist/public-content/specialties",
  "/doctor/specialist/public-content/services",
  "/doctor/specialist/public-content/faqs",
  "/doctor/specialist/public-content/reviews",
  "/doctor/specialist/messages",
] as const;

/** @deprecated use ADMIN_QUICK_HREFS */
export const ADMIN_LIGHT_HREFS = ADMIN_QUICK_HREFS;

function modeForHref(href: string): Array<"quick" | "full"> {
  if ((ADMIN_QUICK_HREFS as readonly string[]).includes(href)) {
    return ["quick", "full"];
  }
  return ["full"];
}

function staffItem(
  href: string,
  labelKey: string,
  roles: string[],
  group: NonNullable<NavItem["group"]>,
): NavItem {
  return {
    href,
    labelKey,
    roles,
    group,
    adminModes: modeForHref(href),
  };
}

export const DASHBOARD_NAV: NavItem[] = [
  staffItem(
    "/doctor/specialist/dashboard",
    "navOwnerDashboard",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "daily",
  ),
  staffItem(
    "/secretary/dashboard",
    "navSecretaryDashboard",
    ["ADMIN", "SECRETARY"],
    "daily",
  ),
  staffItem(
    "/doctor/general/dashboard",
    "navDoctorDashboard",
    ["ADMIN", "DOCTOR_GENERAL", "DOCTOR_SPECIALIST"],
    "daily",
  ),
  staffItem("/secretary/today", "navToday", ["ADMIN", "SECRETARY"], "daily"),
  staffItem(
    "/secretary/directed",
    "navWaiting",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
    "daily",
  ),
  staffItem(
    "/secretary/patients",
    "navPatients",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
    "people",
  ),
  staffItem(
    "/secretary/appointments",
    "navAppointments",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
    "appointments",
  ),
  staffItem(
    "/secretary/assignment-queue",
    "navAssignmentQueue",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
    "appointments",
  ),
  staffItem(
    "/secretary/payments",
    "navPayments",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
    "appointments",
  ),
  staffItem(
    "/secretary/messages",
    "navStaffChat",
    ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
    "comms",
  ),
  staffItem(
    "/doctor/specialist/invitations",
    "navInvitations",
    ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
    "people",
  ),
  staffItem(
    "/doctor/specialist/doctors",
    "navDoctors",
    ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
    "people",
  ),
  staffItem(
    "/doctor/specialist/secretaries",
    "navSecretaries",
    ["ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST"],
    "people",
  ),
  staffItem(
    "/doctor/specialist/patients",
    "navSpecialistPatients",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "people",
  ),
  staffItem(
    "/doctor/specialist/settings",
    "navSettings",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "system",
  ),
  staffItem(
    "/doctor/specialist/audit-logs",
    "navAuditLogs",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "system",
  ),
  staffItem(
    "/doctor/specialist/public-content/patient-experiences",
    "navPatientExperiences",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/public-content/before-after",
    "navBeforeAfter",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/public-content/specialties",
    "navSpecialtiesAdmin",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/public-content/services",
    "navServicesAdmin",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/public-content/faqs",
    "navFaqsAdmin",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/public-content/reviews",
    "navReviewsAdmin",
    ["ADMIN", "DOCTOR_SPECIALIST"],
    "content",
  ),
  staffItem(
    "/doctor/specialist/messages",
    "navDoctorMessages",
    ["DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
    "comms",
  ),
  {
    href: "/patient/dashboard",
    labelKey: "navPatientDashboard",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/appointments",
    labelKey: "navPatientAppointments",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/medical-cases",
    labelKey: "navPatientCases",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/files",
    labelKey: "navPatientFiles",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/instructions",
    labelKey: "navPatientInstructions",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/messages",
    labelKey: "navPatientMessages",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/follow-up",
    labelKey: "navPatientFollowUp",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/notifications",
    labelKey: "navPatientNotifications",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/profile",
    labelKey: "navPatientProfile",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/security",
    labelKey: "navPatientSecurity",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/privacy",
    labelKey: "navPatientPrivacy",
    roles: ["PATIENT"],
  },
  {
    href: "/patient/help",
    labelKey: "navPatientHelp",
    roles: ["PATIENT"],
  },
];

function roleAllowed(userRole: string, allowed: string[]) {
  if (allowed.includes(userRole)) return true;
  if (
    (userRole === "ADMIN_OWNER" ||
      userRole === "OWNER" ||
      userRole === "SUPER_ADMIN") &&
    allowed.includes("ADMIN")
  ) {
    return true;
  }
  if (
    userRole === "DOCTOR" &&
    (allowed.includes("DOCTOR_GENERAL") ||
      allowed.includes("DOCTOR_SPECIALIST"))
  ) {
    return true;
  }
  return false;
}

export function canUseAdminDashboardModes(role: string): boolean {
  return isOwnerRole(role) || role === "DOCTOR_SPECIALIST";
}

/** Normalize persisted/legacy values (`light` → `quick`). */
export function normalizeAdminDashboardMode(
  raw?: string | null,
): AdminDashboardMode {
  if (raw === "full") return "full";
  return "quick";
}

export function navForRole(
  role: string,
  locale: Locale,
  adminMode: AdminDashboardMode = "full",
) {
  const mode = normalizeAdminDashboardMode(adminMode);
  return DASHBOARD_NAV.filter((item) => {
    if (!roleAllowed(role, item.roles)) return false;
    if (canUseAdminDashboardModes(role) && item.adminModes?.length) {
      return item.adminModes.includes(mode);
    }
    return true;
  }).map((item) => ({
    ...item,
    href: `/${locale}${item.href}`,
  }));
}

export function isAdminQuickHref(href: string): boolean {
  return (ADMIN_QUICK_HREFS as readonly string[]).includes(href);
}
