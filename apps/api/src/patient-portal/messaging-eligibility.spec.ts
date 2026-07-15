import { ForbiddenException } from "@nestjs/common";
import {
  assertCompletedVisitMessaging,
  isDoctorMessagingEligible,
} from "./messaging-eligibility";

describe("assertCompletedVisitMessaging", () => {
  const base = {
    appointmentStatus: "COMPLETED",
    appointmentPatientId: "p1",
    actorPatientId: "p1",
    doctorRoleCode: "DOCTOR_GENERAL",
    doctorId: "d1",
    doctorAccountStatus: "ACTIVE",
    doctorDeleted: false,
    doctorProfileActive: true,
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

  it("blocks inactive doctor accounts", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        doctorAccountStatus: "INACTIVE",
      }),
    ).toThrow(ForbiddenException);
  });

  it("blocks archived threads", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        threadStatus: "archived",
      }),
    ).toThrow(ForbiddenException);
  });

  it("blocks outside follow-up window", () => {
    expect(() =>
      assertCompletedVisitMessaging({
        ...base,
        completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        followUpWindowDays: 30,
      }),
    ).toThrow(ForbiddenException);
  });
});

describe("isDoctorMessagingEligible", () => {
  it("accepts active doctor roles", () => {
    expect(
      isDoctorMessagingEligible({
        roleCode: "DOCTOR_SPECIALIST",
        status: "ACTIVE",
        deletedAt: null,
        doctor: { isActive: true },
      }),
    ).toBe(true);
  });

  it("rejects inactive doctor profile", () => {
    expect(
      isDoctorMessagingEligible({
        roleCode: "DOCTOR_GENERAL",
        status: "ACTIVE",
        doctor: { isActive: false },
      }),
    ).toBe(false);
  });
});
