import {
  invitationRoleToStored,
  roleDashboardPath,
  sanitizeInternalRedirect,
  toCanonicalRole,
} from "./roles";

describe("role helpers", () => {
  it("maps legacy roles to canonical product roles", () => {
    expect(toCanonicalRole("ADMIN")).toBe("ADMIN_OWNER");
    expect(toCanonicalRole("ADMIN_OWNER")).toBe("ADMIN_OWNER");
    expect(toCanonicalRole("DOCTOR_SPECIALIST")).toBe("DOCTOR");
    expect(toCanonicalRole("DOCTOR_GENERAL")).toBe("DOCTOR");
    expect(toCanonicalRole("SECRETARY")).toBe("SECRETARY");
    expect(toCanonicalRole("PATIENT")).toBe("PATIENT");
  });

  it("maps invitation roles to stored codes without ADMIN_OWNER", () => {
    expect(invitationRoleToStored("SECRETARY")).toBe("SECRETARY");
    expect(invitationRoleToStored("DOCTOR", "SPECIALIST")).toBe(
      "DOCTOR_SPECIALIST",
    );
    expect(invitationRoleToStored("DOCTOR", "GENERAL")).toBe("DOCTOR_GENERAL");
  });

  it("returns role dashboard paths", () => {
    expect(roleDashboardPath("PATIENT", "ar")).toBe("/ar/patient/dashboard");
    expect(roleDashboardPath("SECRETARY", "fr")).toBe(
      "/fr/secretary/dashboard",
    );
    expect(roleDashboardPath("DOCTOR_GENERAL", "en")).toBe(
      "/en/doctor/general/dashboard",
    );
    expect(roleDashboardPath("ADMIN_OWNER", "ar")).toContain(
      "/doctor/specialist/dashboard",
    );
  });

  it("rejects open redirects", () => {
    expect(
      sanitizeInternalRedirect("https://evil.example/phish", "ar", "PATIENT"),
    ).toBe("/ar/patient/dashboard");
    expect(
      sanitizeInternalRedirect("//evil.example", "ar", "PATIENT"),
    ).toBe("/ar/patient/dashboard");
    expect(
      sanitizeInternalRedirect("/ar/patient/dashboard", "ar", "PATIENT"),
    ).toBe("/ar/patient/dashboard");
    expect(
      sanitizeInternalRedirect("/doctor/specialist/dashboard", "ar", "ADMIN"),
    ).toBe("/ar/doctor/specialist/dashboard");
  });
});
