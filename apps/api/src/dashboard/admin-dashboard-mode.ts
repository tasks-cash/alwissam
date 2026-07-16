/** Canonical Admin/Owner dashboard modes. Legacy `light` maps to `quick`. */
export type AdminDashboardMode = "quick" | "full";

export function normalizeAdminDashboardMode(
  raw?: string | null,
): AdminDashboardMode {
  if (raw === "full") return "full";
  return "quick";
}

export function isAdminDashboardModeInput(
  raw: unknown,
): raw is "quick" | "full" | "light" {
  return raw === "quick" || raw === "full" || raw === "light";
}
