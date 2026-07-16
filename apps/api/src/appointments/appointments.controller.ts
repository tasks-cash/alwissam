import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequirePermissions,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { PERMISSIONS } from "../common/auth/permissions";
import type { AuthUser } from "../common/auth/session.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { AppointmentsService } from "./appointments.service";
import {
  CheckInDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentStatusDto,
  WaitingRoomActionDto,
} from "./dto/appointment.dto";

@ApiTags("appointments")
@Controller("api")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("appointments")
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_appointments)
  list(@Query() query: ListAppointmentsQueryDto, @CurrentUser() user: AuthUser) {
    return this.appointmentsService.list(query, user);
  }

  @Get("appointments/mine")
  @RequireRoles("PATIENT")
  mine(@CurrentUser() user: AuthUser) {
    return this.appointmentsService.listForPatientUser(user.id);
  }

  @Post("appointments")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_appointments)
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: AuthUser) {
    return this.appointmentsService.create(dto, user);
  }

  @Patch("appointments/status")
  @HttpCode(200)
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_appointments)
  updateStatus(
    @Body() dto: UpdateAppointmentStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.appointmentsService.updateStatus(dto, user);
  }

  @Post("secretary/appointments/check-in")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY")
  @RequirePermissions(PERMISSIONS.manage_waiting_room)
  checkIn(@Body() dto: CheckInDto, @CurrentUser() user: AuthUser) {
    return this.appointmentsService.checkIn(dto, user);
  }

  @Get("waiting-room")
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_waiting_room)
  waiting(
    @Query("doctorId") doctorId: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.appointmentsService.listWaiting(doctorId, user);
  }

  @Get("secretary/assignment-queue")
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_appointments)
  assignmentQueue(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.appointmentsService.listReceptionAssignmentQueue({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
    });
  }

  @Post("secretary/assignment-queue/assign")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_appointments)
  assignDoctor(
    @Body()
    body: {
      requestId: string;
      doctorId: string;
      preferredDate?: string;
      preferredTime?: string;
      assignmentNotes?: string;
      confirm?: boolean;
    },
    @CurrentUser() user: AuthUser,
  ) {
    return this.appointmentsService.assignDoctorToRequest(body, user);
  }

  @Patch("waiting-room")
  @HttpCode(200)
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_waiting_room)
  waitingAction(
    @Body() dto: WaitingRoomActionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.appointmentsService.updateWaiting(dto, user);
  }
}
