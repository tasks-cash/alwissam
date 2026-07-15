import { ForbiddenException } from "@nestjs/common";
import { assertCompletedVisitMessaging } from "./messaging-eligibility";

describe("assertCompletedVisitMessaging", () => {
  const base = {
    appointmentStatus: "COMPLETED",
    appointmentPatientId: "p1",
    actorPatientId: "p1",
    doctorRoleCode: "DOCTOR_GENERAL",
    doctorId: "d1",
  };

  it("allows completed owned visits with a doctor", () => {
    expect(assertCompletedVisitMessaging(base)).toBe(true);
  });

  it("blocks messaging before completion", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        appointmentStatus: "CONFIRMED",
      }),
    ).toThrow(ForbiddenException);
  });

  it("blocks another patient’s appointment", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        actorPatientId: "other",
      }),
    ).toThrow(ForbiddenException);
  });

  it("blocks non-doctor roles", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        doctorRoleCode: "ADMIN",
      }),
    ).toThrow(ForbiddenException);
  });
});
