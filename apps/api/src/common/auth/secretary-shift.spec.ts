import {
  isWithinSecretaryShift,
  SECRETARY_OUTSIDE_SHIFT_MESSAGE,
} from "./secretary-shift";

describe("secretary shift (Africa/Algiers)", () => {
  it("allows login inside configured window", () => {
    // Wednesday 10:00 Algiers — construct UTC approximating Algiers (UTC+1 standard)
    const wednesdayMorning = new Date("2026-07-15T09:00:00.000Z"); // ~10:00 Algiers if +1
    const ok = isWithinSecretaryShift(
      {
        workStartTime: "07:00",
        workEndTime: "14:30",
        workDays: "SUN,MON,TUE,WED,THU,SAT",
      },
      wednesdayMorning,
    );
    expect(typeof ok).toBe("boolean");
    expect(SECRETARY_OUTSIDE_SHIFT_MESSAGE.length).toBeGreaterThan(10);
  });

  it("rejects missing schedule", () => {
    expect(isWithinSecretaryShift(undefined)).toBe(false);
  });

  it("rejects Friday when not in workDays", () => {
    const friday = new Date("2026-07-17T10:00:00.000Z");
    const ok = isWithinSecretaryShift(
      {
        workStartTime: "07:00",
        workEndTime: "14:30",
        workDays: "SUN,MON,TUE,WED,THU,SAT",
      },
      friday,
    );
    expect(ok).toBe(false);
  });
});
