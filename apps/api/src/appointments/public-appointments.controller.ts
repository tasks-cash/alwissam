import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AppointmentsService } from "./appointments.service";
import { PublicBookAppointmentDto } from "./dto/public-book.dto";

@ApiTags("public-appointments")
@Controller("api/public")
export class PublicAppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post("appointments")
  @HttpCode(200)
  book(
    @Body() dto: PublicBookAppointmentDto,
    @Req() req: { ip?: string; headers?: Record<string, string | undefined> },
  ) {
    const ip =
      req.ip ||
      req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      undefined;
    return this.appointmentsService.createPublicRequest(dto, ip);
  }

  @Get("appointments/available-times")
  availableTimes(
    @Query("date") date?: string,
    @Query("doctorId") doctorId?: string,
  ) {
    return this.appointmentsService.getAvailableTimes({
      date: date || "",
      doctorId: doctorId || undefined,
    });
  }

  @Get("doctors/:id/availability")
  doctorAvailability(@Param("id") id: string) {
    return this.appointmentsService.getDoctorAvailabilitySummary(id);
  }

  @Get("appointments/reference/:requestNumber")
  reference(@Param("requestNumber") requestNumber: string) {
    return this.appointmentsService.getPublicRequest(requestNumber);
  }
}
