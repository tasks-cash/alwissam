/** Stable permission keys — keep in sync with seeded / assigned user.permissions. */
export const PERMISSIONS = {
  manage_users: "manage_users",
  manage_doctors: "manage_doctors",
  manage_secretaries: "manage_secretaries",
  manage_roles: "manage_roles",
  manage_services: "manage_services",
  manage_schedules: "manage_schedules",
  manage_settings: "manage_settings",
  view_audit_logs: "view_audit_logs",
  view_all_reports: "view_all_reports",
  manage_appointments: "manage_appointments",
  manage_waiting_room: "manage_waiting_room",
  manage_patients: "manage_patients",
  record_payments: "record_payments",
  view_payments: "view_payments",
  edit_diagnosis: "edit_diagnosis",
  edit_prescription: "edit_prescription",
  edit_surgery: "edit_surgery",
  edit_orthodontics: "edit_orthodontics",
  edit_dental_chart: "edit_dental_chart",
  approve_patient_account: "approve_patient_account",
  view_own_medical: "view_own_medical",
  request_appointment_change: "request_appointment_change",
  view_dashboard: "view_dashboard",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ADMIN_PERMISSIONS: PermissionKey[] = Object.values(PERMISSIONS);

export const SECRETARY_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.view_dashboard,
  PERMISSIONS.manage_appointments,
  PERMISSIONS.manage_waiting_room,
  PERMISSIONS.manage_patients,
  PERMISSIONS.record_payments,
  PERMISSIONS.view_payments,
  PERMISSIONS.request_appointment_change,
];

export const DOCTOR_SPECIALIST_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.view_dashboard,
  PERMISSIONS.manage_appointments,
  PERMISSIONS.manage_waiting_room,
  PERMISSIONS.manage_patients,
  PERMISSIONS.edit_diagnosis,
  PERMISSIONS.edit_prescription,
  PERMISSIONS.edit_surgery,
  PERMISSIONS.edit_orthodontics,
  PERMISSIONS.edit_dental_chart,
  PERMISSIONS.approve_patient_account,
  PERMISSIONS.manage_doctors,
  PERMISSIONS.manage_secretaries,
  PERMISSIONS.manage_schedules,
  PERMISSIONS.manage_settings,
  PERMISSIONS.view_audit_logs,
  PERMISSIONS.view_all_reports,
  PERMISSIONS.view_payments,
];

export const DOCTOR_GENERAL_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.view_dashboard,
  PERMISSIONS.manage_appointments,
  PERMISSIONS.manage_waiting_room,
  PERMISSIONS.manage_patients,
  PERMISSIONS.edit_diagnosis,
  PERMISSIONS.edit_prescription,
  PERMISSIONS.edit_dental_chart,
];

export const PATIENT_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.view_own_medical,
  PERMISSIONS.request_appointment_change,
];

export function defaultPermissionsForRole(roleCode: string): PermissionKey[] {
  switch (roleCode) {
    case "ADMIN":
    case "OWNER":
    case "SUPER_ADMIN":
      return [...ADMIN_PERMISSIONS];
    case "SECRETARY":
      return [...SECRETARY_PERMISSIONS];
    case "DOCTOR_SPECIALIST":
      return [...DOCTOR_SPECIALIST_PERMISSIONS];
    case "DOCTOR_GENERAL":
      return [...DOCTOR_GENERAL_PERMISSIONS];
    case "PATIENT":
      return [...PATIENT_PERMISSIONS];
    default:
      return [];
  }
}
