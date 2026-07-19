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
import { SecretariesService } from "./secretaries.service";
import {
  CreateSecretaryDto,
  DeleteSecretaryDto,
  ListSecretariesQueryDto,
  ResetSecretaryPasswordDto,
  UpdateSecretaryDto,
} from "./dto/secretary.dto";

@ApiTags("secretaries")
@Controller("api/admin/secretaries")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class SecretariesController {
  constructor(private readonly secretariesService: SecretariesService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.secretaries_read)
  list(@Query() query: ListSecretariesQueryDto) {
    return this.secretariesService.list(query);
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.secretaries_create)
  create(@Body() dto: CreateSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.secretaries_update)
  update(@Body() dto: UpdateSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.update(dto, user);
  }

  @Post(":id/reset-password")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.secretaries_reset_password)
  resetPassword(
    @Param("id") id: string,
    @Body() dto: ResetSecretaryPasswordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.secretariesService.resetPassword(id, dto.newPassword, user);
  }

  @Delete()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.secretaries_archive)
  remove(@Body() dto: DeleteSecretaryDto, @CurrentUser() user: AuthUser) {
    return this.secretariesService.remove(dto, user);
  }
}
