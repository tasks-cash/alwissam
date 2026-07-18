import { BadRequestException, ConflictException } from "@nestjs/common";
import { AppointmentsService } from "./appointments.service";

describe("AppointmentsService.runExam transitions", () => {
  function makeService(overrides?: {
    entry?: Record<string, unknown>;
    invoice?: Record<string, unknown> | null;
  }) {
    const entry = {
      _id: "e1",
      status: "WAITING",
      doctorId: "d1",
      patientId: "p1",
      appointmentId: "a1",
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides?.entry,
    };
    const waiting = {
      findById: jest.fn().mockResolvedValue(entry),
    };
    const appointments = {
      updateOne: jest.fn().mockResolvedValue({}),
      findById: jest.fn().mockResolvedValue({
        notes: "",
        status: "IN_TREATMENT",
        save: jest.fn().mockResolvedValue(undefined),
      }),
    };
    const invoices = {
      findOne: jest
        .fn()
        .mockResolvedValue(
          overrides?.invoice === undefined ? null : overrides.invoice,
        ),
      create: jest.fn().mockResolvedValue({ _id: "inv1" }),
    };
    const audit = { write: jest.fn().mockResolvedValue(undefined) };
    const service = new AppointmentsService(
      appointments as never,
      waiting as never,
      {} as never,
      {} as never,
      {} as never,
      invoices as never,
      audit as never,
      {} as never,
    );
    jest.spyOn(service as any, "assertAppointmentAccess").mockReturnValue(undefined);
    return { service, entry, waiting, appointments, invoices, audit };
  }

  const actor = {
    id: "admin1",
    fullName: "Owner",
    roleCode: "ADMIN",
  } as never;

  it("starts examination from WAITING", async () => {
    const { service, entry } = makeService();
    const res = await service.runExam(
      { entryId: "e1", action: "start" },
      actor,
    );
    expect(res.status).toBe("WITH_DOCTOR");
    expect(entry.status).toBe("WITH_DOCTOR");
  });

  it("rejects start on SESSION_DONE", async () => {
    const { service } = makeService({
      entry: { status: "SESSION_DONE" },
    });
    await expect(
      service.runExam({ entryId: "e1", action: "start" }, actor),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("completes covered visit without invoice", async () => {
    const { service, invoices } = makeService({
      entry: { status: "WITH_DOCTOR" },
    });
    const res = await service.runExam(
      { entryId: "e1", action: "complete", covered: true, note: "مغطى" },
      actor,
    );
    expect(res.status).toBe("SESSION_DONE");
    expect(invoices.create).not.toHaveBeenCalled();
  });

  it("requires positive amount when not covered", async () => {
    const { service } = makeService({
      entry: { status: "WITH_DOCTOR" },
    });
    await expect(
      service.runExam(
        { entryId: "e1", action: "complete", covered: false, amount: 0 },
        actor,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects duplicate invoice for same appointment", async () => {
    const { service } = makeService({
      entry: { status: "WITH_DOCTOR" },
      invoice: { _id: "existing" },
    });
    await expect(
      service.runExam(
        { entryId: "e1", action: "complete", covered: false, amount: 2000 },
        actor,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
