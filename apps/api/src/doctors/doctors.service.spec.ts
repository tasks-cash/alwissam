import * as bcrypt from "bcryptjs";
import { DoctorsService } from "./doctors.service";

const actor = {
  id: "507f1f77bcf86cd799439011",
  fullName: "مالك العيادة",
  roleCode: "ADMIN",
} as never;

function target(overrides?: Record<string, unknown>) {
  return {
    _id: "507f191e810c19729de860ea",
    fullName: "طبيب تجريبي",
    email: "doctor@example.com",
    phone: "0550000000",
    passwordHash: "existing-hash",
    roleCode: "DOCTOR_GENERAL",
    status: "INACTIVE",
    failedLoginCount: 0,
    lockedUntil: null,
    doctor: {
      type: "GENERAL",
      specialtyAr: "طب الأسنان العام",
      isActive: false,
      isPublic: false,
      isBookable: false,
      weeklySchedule: [],
      archivedAt: null as Date | null,
    },
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function serviceWith(user: ReturnType<typeof target>) {
  const users = {
    findOne: jest.fn().mockResolvedValue(user),
  };
  const sessions = { updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }) };
  const audit = { write: jest.fn().mockResolvedValue(undefined) };
  return {
    service: new DoctorsService(users as never, sessions as never, audit as never),
    users,
    sessions,
    audit,
  };
}

describe("DoctorsService administration safety", () => {
  it("does not reset a password through ordinary profile editing", async () => {
    const setup = serviceWith(target());

    await expect(
      setup.service.update(
        {
          userId: "507f191e810c19729de860ea",
          newPassword: "StrongTemporaryPassword123!",
        },
        actor,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: "إعادة تعيين كلمة المرور إجراء مستقل ومحمي.",
      }),
    });

    expect(setup.sessions.updateMany).not.toHaveBeenCalled();
  });

  it("preserves inactive status when contact information changes", async () => {
    const doctor = target();
    const setup = serviceWith(doctor);
    setup.users.findOne
      .mockResolvedValueOnce(doctor)
      .mockResolvedValueOnce(null);

    await setup.service.update(
      {
        userId: "507f191e810c19729de860ea",
        email: "new-doctor@example.com",
      },
      actor,
    );

    expect(doctor.status).toBe("INACTIVE");
    expect(doctor.doctor.isActive).toBe(false);
  });

  it("rejects overlapping weekly shifts", async () => {
    const setup = serviceWith(target());

    await expect(
      setup.service.update(
        {
          userId: "507f191e810c19729de860ea",
          weeklySchedule: [
            {
              dayOfWeek: "SUNDAY",
              startTime: "09:00",
              endTime: "13:00",
              isActive: true,
            },
            {
              dayOfWeek: "SUNDAY",
              startTime: "12:30",
              endTime: "16:00",
              isActive: true,
            },
          ],
        },
        actor,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: "لا يمكن حفظ ورديات متداخلة في اليوم نفسه.",
      }),
    });
  });

  it("hashes reset passwords, revokes sessions, and audits without plaintext", async () => {
    const doctor = target();
    const setup = serviceWith(doctor);

    await setup.service.resetPassword(
      {
        userId: "507f191e810c19729de860ea",
        newPassword: "StrongTemporaryPassword123!",
      },
      actor,
    );

    expect(doctor.passwordHash).not.toBe("StrongTemporaryPassword123!");
    await expect(
      bcrypt.compare("StrongTemporaryPassword123!", doctor.passwordHash),
    ).resolves.toBe(true);
    expect(setup.sessions.updateMany).toHaveBeenCalled();
    expect(setup.audit.write).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "DOCTOR_PASSWORD_RESET",
        newValue: { sessionsRevoked: true },
      }),
    );
  });

  it("archives instead of permanently deleting doctor history", async () => {
    const doctor = target({ status: "ACTIVE" });
    const setup = serviceWith(doctor);

    await setup.service.remove(
      { userId: "507f191e810c19729de860ea" },
      actor,
    );

    expect(doctor.status).toBe("INACTIVE");
    expect(doctor.doctor.isActive).toBe(false);
    expect(doctor.doctor.isPublic).toBe(false);
    expect(doctor.doctor.isBookable).toBe(false);
    expect(doctor.doctor.archivedAt).toBeInstanceOf(Date);
    expect(setup.users).not.toHaveProperty("deleteOne");
  });
});
