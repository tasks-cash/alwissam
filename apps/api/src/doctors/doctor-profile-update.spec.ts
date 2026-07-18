import { DoctorsService } from "./doctors.service";

describe("DoctorsService owner protection", () => {
  it("blocks deactivation of clinic owner doctor", async () => {
    const target = {
      _id: "owner1",
      roleCode: "ADMIN",
      doctor: { isActive: true },
      save: jest.fn(),
    };
    const users = {
      findOne: jest.fn().mockResolvedValue(target),
    };
    const sessions = { updateMany: jest.fn() };
    const audit = { write: jest.fn() };
    const service = new DoctorsService(
      users as never,
      sessions as never,
      audit as never,
    );
    await expect(
      service.remove(
        { userId: "owner1" },
        { id: "other", fullName: "Admin", roleCode: "ADMIN" } as never,
      ),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.stringContaining("مالك"),
      }),
    });
    expect(target.save).not.toHaveBeenCalled();
  });

  it("updates bio without clearing specialty", async () => {
    const target = {
      _id: "d1",
      email: "d@x.com",
      phone: "0555",
      status: "ACTIVE",
      doctor: {
        type: "GENERAL",
        specialtyAr: "تقويم",
        bioAr: "قديم",
        isActive: true,
      },
      failedLoginCount: 0,
      lockedUntil: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    const users = {
      findOne: jest.fn().mockResolvedValue(target),
    };
    const sessions = { updateMany: jest.fn() };
    const audit = { write: jest.fn().mockResolvedValue(undefined) };
    const service = new DoctorsService(
      users as never,
      sessions as never,
      audit as never,
    );
    jest
      .spyOn(service as never, "assertUniqueEmailPhone")
      .mockResolvedValue(undefined as never);

    await service.update(
      { userId: "d1", bioAr: "وصف جديد" },
      { id: "admin", fullName: "A", roleCode: "ADMIN" } as never,
    );

    expect(target.doctor.specialtyAr).toBe("تقويم");
    expect(target.doctor.bioAr).toBe("وصف جديد");
    expect(target.save).toHaveBeenCalled();
  });
});
