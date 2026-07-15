import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
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
import {
  CreatePatientDto,
  ListPatientsQueryDto,
  UpdatePatientDto,
} from "./dto/patient.dto";
import { PatientsService } from "./patients.service";

@ApiTags("patients")
@Controller("api")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get("patients")
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_patients)
  list(@Query() query: ListPatientsQueryDto) {
    return this.patientsService.list(query);
  }

  @Get("patients/me")
  @RequireRoles("PATIENT")
  me(@CurrentUser() user: AuthUser) {
    return this.patientsService.getByUserId(user.id);
  }

  @Get("patients/:id")
  @RequireRoles(
    "ADMIN",
    "SECRETARY",
    "DOCTOR_SPECIALIST",
    "DOCTOR_GENERAL",
  )
  @RequirePermissions(PERMISSIONS.manage_patients)
  get(@Param("id") id: string) {
    return this.patientsService.getById(id);
  }

  @Post("secretary/patients")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST")
  @RequirePermissions(PERMISSIONS.manage_patients)
  create(@Body() dto: CreatePatientDto, @CurrentUser() user: AuthUser) {
    return this.patientsService.create(dto, user);
  }

  @Patch("patients")
  @HttpCode(200)
  @RequireRoles("ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL")
  @RequirePermissions(PERMISSIONS.manage_patients)
  update(@Body() dto: UpdatePatientDto, @CurrentUser() user: AuthUser) {
    return this.patientsService.update(dto, user);
  }
}
