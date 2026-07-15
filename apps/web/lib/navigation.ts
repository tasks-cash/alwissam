import type { Locale } from "./i18n/config";

export type NavItem = {
  href: string;
  labelKey: string;
  roles: string[];
};

export const DASHBOARD_NAV: NavItem[] = [
  {
    href: "/doctor/specialist/dashboard",
    labelKey: "navOwnerDashboard",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/secretary/dashboard",
    labelKey: "navSecretaryDashboard",
    roles: ["ADMIN", "SECRETARY"],
  },
  {
    href: "/doctor/general/dashboard",
    labelKey: "navDoctorDashboard",
    roles: ["ADMIN", "DOCTOR_GENERAL", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/secretary/today",
    labelKey: "navToday",
    roles: ["ADMIN", "SECRETARY"],
  },
  {
    href: "/secretary/directed",
    labelKey: "navWaiting",
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  },
  {
    href: "/secretary/patients",
    labelKey: "navPatients",
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  },
  {
    href: "/secretary/appointments",
    labelKey: "navAppointments",
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/secretary/assignment-queue",
    labelKey: "navAssignmentQueue",
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/secretary/payments",
    labelKey: "navPayments",
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/doctors",
    labelKey: "navDoctors",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/secretaries",
    labelKey: "navSecretaries",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/settings",
    labelKey: "navSettings",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/patient-experiences",
    labelKey: "navPatientExperiences",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/before-after",
    labelKey: "navBeforeAfter",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/specialties",
    labelKey: "navSpecialtiesAdmin",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/services",
    labelKey: "navServicesAdmin",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/faqs",
    labelKey: "navFaqsAdmin",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/public-content/reviews",
    labelKey: "navReviewsAdmin",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/doctor/specialist/audit-logs",
    labelKey: "navAuditLogs",
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  },
  {
    href: "/patient/dashboard",
    labelKey: "navPatientDashboard",
    roles: ["PATIENT"],
  },
];

export function navForRole(role: string, locale: Locale) {
  return DASHBOARD_NAV.filter((item) => item.roles.includes(role)).map(
    (item) => ({
      ...item,
      href: `/${locale}${item.href}`,
    }),
  );
}
