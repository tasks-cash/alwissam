import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  PermissionsGuard,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { DoctorsService } from "./doctors.service";

/** Read-only doctor roster for scheduling (secretaries + doctors). */
@ApiTags("doctors")
@Controller("api/doctors")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DoctorsRosterController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  list() {
    return this.doctorsService.listActiveForScheduling();
  }
}
