import {
  PASSWORD_MIN_CREATE,
  PASSWORD_MIN_LOGIN,
  createDoctorSchema,
  createSecretarySchema,
  loginSchema,
  normalizePhoneDigits,
  omitConfirmPassword,
  updateDoctorSchema,
} from "@alwisam/shared-validation";

describe("validation parity (shared Zod)", () => {
  it("keeps login and create password mins distinct", () => {
    expect(PASSWORD_MIN_LOGIN).toBe(6);
    expect(PASSWORD_MIN_CREATE).toBe(8);
  });

  it("accepts login and rejects short passwords", () => {
    expect(
      loginSchema.safeParse({
        email: "owner@clinic.example",
        password: "secret1",
        portal: "staff",
      }).success,
    ).toBe(true);
    expect(
      loginSchema.safeParse({
        email: "owner@clinic.example",
        password: "12345",
      }).success,
    ).toBe(false);
  });

  it("enforces digits-only phones and confirm password on doctor create", () => {
    expect(
      createDoctorSchema.safeParse({
        fullName: "دكتور",
        email: "doc@clinic.example",
        phone: "0551letters",
        password: "password1",
        confirmPassword: "password1",
        type: "GENERAL",
      }).success,
    ).toBe(false);

    expect(
      createDoctorSchema.safeParse({
        fullName: "دكتور",
        email: "doc@clinic.example",
        phone: "0551-229-991",
        password: "password1",
        confirmPassword: "password1",
        type: "GENERAL",
      }).success,
    ).toBe(false);

    const ok = createDoctorSchema.safeParse({
      fullName: "دكتور",
      email: "doc@clinic.example",
      phone: "0551229991",
      password: "password1",
      confirmPassword: "password1",
      type: "GENERAL",
    });
    expect(ok.success).toBe(true);
    if (ok.success) {
      expect(ok.data.phone).toBe(normalizePhoneDigits("0551229991"));
      const body = omitConfirmPassword(
        ok.data as { confirmPassword?: string } & Record<string, unknown>,
      );
      expect("confirmPassword" in body).toBe(false);
    }
  });

  it("ignores empty newPassword on update and requires password on secretary create", () => {
    const update = updateDoctorSchema.safeParse({
      userId: "x",
      newPassword: "",
    });
    expect(update.success).toBe(true);
    if (update.success) expect(update.data.newPassword).toBeUndefined();

    expect(
      createSecretarySchema.safeParse({
        fullName: "سكرتيرة",
        email: "sec@clinic.example",
        phone: "0551229992",
        shiftCode: "MORNING",
      }).success,
    ).toBe(false);
  });
});
