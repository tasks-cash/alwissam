/**
 * Contract: quick href set must match dashboard.service quickModules +
 * apps/web/lib/navigation.ts ADMIN_QUICK_HREFS (keep manually aligned).
 */
const ADMIN_QUICK_HREFS = [
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

const ADMIN_FULL_EXTRA_HREFS = [
  "/doctor/specialist/public-content/patient-experiences",
  "/doctor/specialist/public-content/before-after",
  "/doctor/specialist/public-content/specialties",
  "/doctor/specialist/public-content/services",
  "/doctor/specialist/public-content/faqs",
  "/doctor/specialist/public-content/reviews",
  "/doctor/specialist/messages",
] as const;

describe("admin dashboard mode href contract", () => {
  it("keeps full extras disjoint from quick essentials", () => {
    const quick = new Set<string>(ADMIN_QUICK_HREFS);
    for (const href of ADMIN_FULL_EXTRA_HREFS) {
      expect(quick.has(href)).toBe(false);
    }
  });

  it("includes core specialist daily management in quick", () => {
    expect(ADMIN_QUICK_HREFS).toEqual(
      expect.arrayContaining([
        "/doctor/specialist/dashboard",
        "/doctor/specialist/doctors",
        "/doctor/specialist/secretaries",
        "/doctor/specialist/patients",
        "/secretary/patients",
        "/secretary/appointments",
        "/secretary/directed",
        "/secretary/payments",
        "/doctor/specialist/settings",
        "/doctor/specialist/audit-logs",
      ]),
    );
  });

  it("places CMS only in full extras", () => {
    expect(ADMIN_FULL_EXTRA_HREFS).toEqual(
      expect.arrayContaining([
        "/doctor/specialist/public-content/reviews",
        "/doctor/specialist/public-content/before-after",
        "/doctor/specialist/public-content/patient-experiences",
      ]),
    );
  });

  it("full is always a strict superset of quick (no removals)", () => {
    const full = new Set<string>([
      ...ADMIN_QUICK_HREFS,
      ...ADMIN_FULL_EXTRA_HREFS,
    ]);
    for (const href of ADMIN_QUICK_HREFS) {
      expect(full.has(href)).toBe(true);
    }
  });
});

describe("normalizeAdminDashboardMode", () => {
  // Inline mirror of apps/api/src/dashboard/admin-dashboard-mode.ts
  function normalize(raw?: string | null) {
    if (raw === "full") return "full";
    return "quick";
  }

  it("maps legacy light to quick", () => {
    expect(normalize("light")).toBe("quick");
    expect(normalize(undefined)).toBe("quick");
    expect(normalize("quick")).toBe("quick");
    expect(normalize("full")).toBe("full");
  });
});
