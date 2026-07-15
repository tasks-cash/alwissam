/** Client-side mirror of Nest roleDashboardPath — keep in sync with apps/api roles.ts */
export function isOwnerRole(role: string): boolean {
  return (
    role === "ADMIN" ||
    role === "ADMIN_OWNER" ||
    role === "OWNER" ||
    role === "SUPER_ADMIN"
  );
}

export function roleMatchesAny(userRole: string, allowed: string[]): boolean {
  if (allowed.includes(userRole)) return true;
  const expanded = new Set<string>();
  for (const a of allowed) {
    expanded.add(a);
    if (a === "ADMIN_OWNER" || a === "ADMIN" || a === "OWNER") {
      expanded.add("ADMIN");
      expanded.add("ADMIN_OWNER");
      expanded.add("OWNER");
      expanded.add("SUPER_ADMIN");
    }
    if (a === "DOCTOR") {
      expanded.add("DOCTOR");
      expanded.add("DOCTOR_GENERAL");
      expanded.add("DOCTOR_SPECIALIST");
    }
    if (a === "DOCTOR_SPECIALIST") {
      expanded.add("DOCTOR_SPECIALIST");
      expanded.add("ADMIN");
      expanded.add("ADMIN_OWNER");
    }
  }
  return expanded.has(userRole);
}

export function roleDashboardPath(role: string, locale = "ar"): string {
  const prefix = `/${locale}`;
  if (isOwnerRole(role) || role === "DOCTOR_SPECIALIST") {
    return `${prefix}/doctor/specialist/dashboard`;
  }
  if (role === "SECRETARY") return `${prefix}/secretary/dashboard`;
  if (role === "DOCTOR_GENERAL" || role === "DOCTOR") {
    return `${prefix}/doctor/general/dashboard`;
  }
  if (role === "PATIENT") return `${prefix}/patient/dashboard`;
  return prefix;
}
