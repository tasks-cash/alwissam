import { DoctorSettingsService } from "./doctor-settings.service";

function doctorUser() {
  return {
    _id: "507f1f77bcf86cd799439011",
    fullName: "طبيب مختص",
    email: "doctor@example.com",
    emailNormalized: "doctor@example.com",
    phone: "0550000000",
    phoneCanonical: "0550000000",
    locale: "ar",
    address: "",
    emailVerified: true,
    doctor: {
      type: "SPECIALIST",
      specialtyAr: "تقويم الأسنان",
      workingHours: [],
      languages: [],
    },
    notificationPreferences: {},
    preferences: {},
    save: jest.fn().mockResolvedValue(undefined),
    markModified: jest.fn(),
  };
}

const actor = {
  id: "507f1f77bcf86cd799439011",
  fullName: "طبيب مختص",
  roleCode: "DOCTOR_SPECIALIST",
} as never;

describe("DoctorSettingsService", () => {
  it("loads only the Doctor profile linked to the authenticated user", async () => {
    const user = doctorUser();
    const users = { findOne: jest.fn().mockResolvedValue(user) };
    const service = new DoctorSettingsService(
      users as never,
      { write: jest.fn() } as never,
    );

    const result = await service.get(actor);

    expect(users.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: "507f1f77bcf86cd799439011",
        doctor: { $exists: true },
      }),
    );
    expect(result.settings.personal.fullName).toBe("طبيب مختص");
    expect(result.settings).not.toHaveProperty("passwordHash");
  });

  it("rejects overlapping Doctor schedule windows", async () => {
    const users = { findOne: jest.fn() };
    const service = new DoctorSettingsService(
      users as never,
      { write: jest.fn() } as never,
    );

    await expect(
      service.updateSchedule(
        {
          appointmentDurationMinutes: 30,
          workingHours: [
            {
              dayOfWeek: "SUNDAY",
              startTime: "08:00",
              endTime: "12:00",
              isActive: true,
            },
            {
              dayOfWeek: "SUNDAY",
              startTime: "11:30",
              endTime: "15:00",
              isActive: true,
            },
          ],
        },
        actor,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.stringContaining("متداخلة"),
      }),
    });
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it("persists permitted professional fields without changing Doctor type", async () => {
    const user = doctorUser();
    const users = { findOne: jest.fn().mockResolvedValue(user) };
    const audit = { write: jest.fn().mockResolvedValue(undefined) };
    const service = new DoctorSettingsService(users as never, audit as never);

    await service.updateProfessional(
      {
        professionalTitleAr: "أخصائي تقويم",
        bioAr: "سيرة مهنية",
        languages: ["العربية", "الفرنسية"],
      },
      actor,
    );

    expect(user.doctor.type).toBe("SPECIALIST");
    expect(user.doctor).toMatchObject({
      professionalTitleAr: "أخصائي تقويم",
      bioAr: "سيرة مهنية",
      languages: ["العربية", "الفرنسية"],
    });
    expect(user.save).toHaveBeenCalled();
    expect(audit.write).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCTOR_PROFESSIONAL_SETTINGS_UPDATED",
      }),
    );
  });

  it("rejects an image whose bytes do not match its MIME type", async () => {
    const users = { findOne: jest.fn() };
    const service = new DoctorSettingsService(
      users as never,
      { write: jest.fn() } as never,
    );

    await expect(
      service.updateAvatar(
        {
          buffer: Buffer.from("not-an-image"),
          mimetype: "image/png",
          size: 12,
        },
        actor,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.stringContaining("غير صالح"),
      }),
    });
    expect(users.findOne).not.toHaveBeenCalled();
  });
});
