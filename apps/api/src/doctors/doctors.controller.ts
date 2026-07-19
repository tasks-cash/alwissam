import {
  Body,
  Controller,
  Delete,
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
import { DoctorsService } from "./doctors.service";
import {
  CreateDoctorDto,
  DeleteDoctorDto,
  ListDoctorsQueryDto,
  ResetDoctorPasswordDto,
  UpdateDoctorDto,
} from "./dto/doctor.dto";

@ApiTags("doctors")
@Controller("api/admin/doctors")
@UseGuards(
  JwtAuthGuard,
  ClinicOwnerGuard,
  RolesGuard,
  PermissionsGuard,
)
@RequireRoles("ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.doctors_read)
  list(@Query() query: ListDoctorsQueryDto) {
    return this.doctorsService.list(query);
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.doctors_create)
  create(@Body() dto: CreateDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.doctors_update)
  update(@Body() dto: UpdateDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.update(dto, user);
  }

  @Post(":id/reset-password")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.doctors_reset_password)
  resetPassword(
    @Param("id") id: string,
    @Body() dto: ResetDoctorPasswordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.doctorsService.resetPassword(
      { userId: id, newPassword: dto.newPassword },
      user,
    );
  }

  @Post(":id/restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.doctors_restore)
  restore(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.doctorsService.restore({ userId: id }, user);
  }

  @Delete()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.doctors_archive)
  remove(@Body() dto: DeleteDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.remove(dto, user);
  }
}
