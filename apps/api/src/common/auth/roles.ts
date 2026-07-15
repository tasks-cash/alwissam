/** Canonical clinic roles used in product language + invitation API. */
export const CANONICAL_ROLES = [
  "PATIENT",
  "SECRETARY",
  "DOCTOR",
  "ADMIN_OWNER",
] as const;

export type CanonicalRole = (typeof CANONICAL_ROLES)[number];

/** Roles persisted in MongoDB (includes legacy codes). */
export const STORED_ROLE_CODES = [
  "ADMIN",
  "ADMIN_OWNER",
  "SECRETARY",
  "DOCTOR",
  "DOCTOR_GENERAL",
  "DOCTOR_SPECIALIST",
  "PATIENT",
  "OWNER",
  "SUPER_ADMIN",
] as const;

export type StoredRoleCode = (typeof STORED_ROLE_CODES)[number] | string;

export function isOwnerRole(role: string): boolean {
  return (
    role === "ADMIN" ||
    role === "ADMIN_OWNER" ||
    role === "OWNER" ||
    role === "SUPER_ADMIN"
  );
}

export function isDoctorRole(role: string): boolean {
  return (
    role === "DOCTOR" ||
    role === "DOCTOR_GENERAL" ||
    role === "DOCTOR_SPECIALIST" ||
    isOwnerRole(role)
  );
}

export function isSecretaryRole(role: string): boolean {
  return role === "SECRETARY";
}

export function isPatientRole(role: string): boolean {
  return role === "PATIENT";
}

export function toCanonicalRole(role: string): CanonicalRole | string {
  if (isOwnerRole(role)) return "ADMIN_OWNER";
  if (role === "DOCTOR_GENERAL" || role === "DOCTOR_SPECIALIST" || role === "DOCTOR") {
    return "DOCTOR";
  }
  if (role === "SECRETARY") return "SECRETARY";
  if (role === "PATIENT") return "PATIENT";
  return role;
}

/** Map product invitation role → persisted roleCode. */
export function invitationRoleToStored(
  role: "DOCTOR" | "SECRETARY",
  doctorType?: "GENERAL" | "SPECIALIST",
): string {
  if (role === "SECRETARY") return "SECRETARY";
  if (doctorType === "SPECIALIST") return "DOCTOR_SPECIALIST";
  if (doctorType === "GENERAL") return "DOCTOR_GENERAL";
  return "DOCTOR_GENERAL";
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

/** Safe internal redirects only. */
export function sanitizeInternalRedirect(
  candidate: string | undefined,
  locale: string,
  fallbackRole: string,
): string {
  const fallback = roleDashboardPath(fallbackRole, locale);
  if (!candidate) return fallback;
  let path = candidate.trim();
  // Reject absolute / protocol-relative / backslash tricks completely.
  if (
    /^https?:\/\//i.test(path) ||
    path.startsWith("//") ||
    path.includes("://") ||
    path.includes("\\") ||
    /[\s<>"]/.test(path)
  ) {
    return fallback;
  }
  if (!path.startsWith("/")) return fallback;
  // Force locale prefix when missing
  if (!/^\/(ar|en|fr)(\/|$)/.test(path)) {
    path = `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
  }
  // Disallow unexpected control characters / encoded hosts
  if (/%2f%2f/i.test(path) || path.includes("@")) return fallback;
  return path;
}
