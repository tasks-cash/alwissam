import { ForbiddenException } from "@nestjs/common";

/**
 * Mirrors appointments.service doctor-scope helpers for unit coverage without Mongo.
 */
function isDoctorScopedRole(roleCode: string): boolean {
  return roleCode === "DOCTOR_GENERAL" || roleCode === "DOCTOR";
}

function canAccessAllClinicAppointments(roleCode: string): boolean {
  return (
    roleCode === "ADMIN" ||
    roleCode === "ADMIN_OWNER" ||
    roleCode === "OWNER" ||
    roleCode === "SUPER_ADMIN" ||
    roleCode === "SECRETARY" ||
    roleCode === "DOCTOR_SPECIALIST"
  );
}

function assertAppointmentAccess(actorRole: string, actorId: string, doctorId: string) {
  if (canAccessAllClinicAppointments(actorRole)) return true;
  if (isDoctorScopedRole(actorRole) && doctorId === actorId) return true;
  throw new ForbiddenException({ code: "FORBIDDEN" });
}

describe("appointment doctor scoping", () => {
  it("allows secretary clinic-wide", () => {
    expect(assertAppointmentAccess("SECRETARY", "s1", "d2")).toBe(true);
  });

  it("allows owner clinic-wide", () => {
    expect(assertAppointmentAccess("ADMIN", "a1", "d2")).toBe(true);
  });

  it("allows specialist clinic-wide", () => {
    expect(assertAppointmentAccess("DOCTOR_SPECIALIST", "d1", "d2")).toBe(true);
  });

  it("scopes general doctor to own appointments", () => {
    expect(assertAppointmentAccess("DOCTOR_GENERAL", "d1", "d1")).toBe(true);
    expect(() => assertAppointmentAccess("DOCTOR_GENERAL", "d1", "d2")).toThrow(
      ForbiddenException,
    );
  });
});
