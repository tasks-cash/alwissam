import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  UpdateDoctorPersonalDto,
  UpdateDoctorScheduleDto,
} from "./dto/doctor-settings.dto";

describe("Doctor settings DTO validation", () => {
  it("rejects invalid email and phone values", async () => {
    const dto = plainToInstance(UpdateDoctorPersonalDto, {
      email: "not-an-email",
      phone: "0555-ABC",
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(["email", "phone"]),
    );
  });

  it("normalizes an Algerian phone without dropping its leading zero", async () => {
    const dto = plainToInstance(UpdateDoctorPersonalDto, {
      phone: "0550 00 00 00",
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.phone).toBe("0550000000");
  });

  it("rejects invalid appointment duration and malformed leave dates", async () => {
    const dto = plainToInstance(UpdateDoctorScheduleDto, {
      appointmentDurationMinutes: 5,
      workingHours: [],
      leaveDates: ["17/07/2026"],
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining([
        "appointmentDurationMinutes",
        "leaveDates",
      ]),
    );
  });
});
