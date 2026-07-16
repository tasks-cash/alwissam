import {
  assertSecretaryCanChat,
  canDeleteStaffMessage,
  filterAssignedDoctors,
  isStaffChatRole,
  roleLabelAr,
  secretaryVisibleToDoctor,
  sortedParticipantPair,
} from "./staff-chat.rules";
import { ForbiddenException } from "@nestjs/common";

describe("staff-chat rules", () => {
  it("allows Admin/Owner/Doctor/Secretary Chat access roles", () => {
    expect(isStaffChatRole("SECRETARY")).toBe(true);
    expect(isStaffChatRole("DOCTOR_GENERAL")).toBe(true);
    expect(isStaffChatRole("DOCTOR_SPECIALIST")).toBe(true);
    expect(isStaffChatRole("ADMIN_OWNER")).toBe(true);
    expect(isStaffChatRole("OWNER")).toBe(true);
    expect(isStaffChatRole("ADMIN")).toBe(true);
  });

  it("rejects Patient Chat access", () => {
    expect(isStaffChatRole("PATIENT")).toBe(false);
  });

  it("labels roles in Arabic", () => {
    expect(roleLabelAr("SECRETARY")).toContain("سكرتير");
    expect(roleLabelAr("ADMIN")).toContain("إدارة");
  });

  it("filters assigned doctors when configured", () => {
    expect(filterAssignedDoctors(["a", "b", "c"], ["b"])).toEqual(["b"]);
    expect(filterAssignedDoctors(["a", "b"], [])).toEqual(["a", "b"]);
    expect(filterAssignedDoctors(["a", "b"], null)).toEqual(["a", "b"]);
  });

  it("rejects unrelated Doctor visibility for assigned Secretary", () => {
    expect(secretaryVisibleToDoctor("doc1", ["doc2"])).toBe(false);
    expect(secretaryVisibleToDoctor("doc1", ["doc1", "doc2"])).toBe(true);
    expect(secretaryVisibleToDoctor("doc1", [])).toBe(true);
  });

  it("sorts participant pair for conversation uniqueness", () => {
    expect(sortedParticipantPair("b", "a")).toEqual(["a", "b"]);
  });

  it("enforces delete rules", () => {
    expect(
      canDeleteStaffMessage({
        actorId: "s1",
        actorRole: "DOCTOR_GENERAL",
        senderId: "s1",
        receiverId: "r1",
        kind: "TEXT",
      }),
    ).toBe(true);
    expect(
      canDeleteStaffMessage({
        actorId: "r1",
        actorRole: "SECRETARY",
        senderId: "s1",
        receiverId: "r1",
        kind: "TEXT",
      }),
    ).toBe(false);
    expect(
      canDeleteStaffMessage({
        actorId: "r1",
        actorRole: "SECRETARY",
        senderId: "s1",
        receiverId: "r1",
        kind: "VOICE",
      }),
    ).toBe(true);
  });

  it("allows Secretary Chat during working hours", () => {
    const now = new Date("2026-07-15T10:00:00+01:00"); // Wed Algiers
    expect(() =>
      assertSecretaryCanChat(
        "SECRETARY",
        {
          workDays: "SUN,MON,TUE,WED,THU,SAT",
          workStartTime: "07:00",
          workEndTime: "14:30",
        },
        now,
      ),
    ).not.toThrow();
  });

  it("rejects Secretary Chat outside working hours", () => {
    const now = new Date("2026-07-15T20:00:00+01:00");
    expect(() =>
      assertSecretaryCanChat(
        "SECRETARY",
        {
          workDays: "SUN,MON,TUE,WED,THU,SAT",
          workStartTime: "07:00",
          workEndTime: "14:30",
        },
        now,
      ),
    ).toThrow(ForbiddenException);
  });

  it("does not shift-gate Doctors", () => {
    expect(() =>
      assertSecretaryCanChat("DOCTOR_GENERAL", null, new Date()),
    ).not.toThrow();
  });
});
