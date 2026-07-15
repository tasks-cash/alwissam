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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { PERMISSIONS } from "../common/auth/permissions";
import {
  PermissionsGuard,
  RequirePermissions,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import {
  ExperienceFeatureDto,
  ExperienceIdDto,
  ListExperiencesQueryDto,
  ReorderExperiencesDto,
  UpsertPatientExperienceDto,
} from "./dto/patient-experience.dto";
import { PatientExperiencesService } from "./patient-experiences.service";

@ApiTags("patient-experiences-admin")
@ApiBearerAuth()
@Controller("api/admin/patient-experiences")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class PatientExperiencesAdminController {
  constructor(private readonly service: PatientExperiencesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  list(@Query() query: ListExperiencesQueryDto) {
    return this.service.listAdmin(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  get(@Param("id") id: string) {
    return this.service.getAdmin(id);
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  create(
    @Body() dto: UpsertPatientExperienceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  update(
    @Body() dto: UpsertPatientExperienceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(dto, user);
  }

  @Post("approve")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.approve_patient_experiences)
  approve(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.approve(dto.id, user);
  }

  @Post("reject")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.approve_patient_experiences)
  reject(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.reject(dto.id, user);
  }

  @Post("publish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.publish_patient_experiences)
  publish(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.publish(dto.id, user);
  }

  @Post("unpublish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.publish_patient_experiences)
  unpublish(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.unpublish(dto.id, user);
  }

  @Post("archive")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  archive(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.archive(dto.id, user);
  }

  @Post("restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  restore(@Body() dto: ExperienceIdDto, @CurrentUser() user: AuthUser) {
    return this.service.restore(dto.id, user);
  }

  @Post("feature")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  feature(
    @Body() dto: ExperienceFeatureDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.feature(dto.id, dto.featured === true, user);
  }

  @Post("reorder")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_patient_experiences)
  reorder(@Body() dto: ReorderExperiencesDto, @CurrentUser() user: AuthUser) {
    return this.service.reorder(dto.orderedIds, user);
  }
}
