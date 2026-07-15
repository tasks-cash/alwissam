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
import { BeforeAfterService } from "./before-after.service";
import {
  BeforeAfterFeatureDto,
  BeforeAfterIdDto,
  ListBeforeAfterQueryDto,
  ReorderBeforeAfterDto,
  UpsertBeforeAfterDto,
} from "./dto/before-after.dto";

@ApiTags("before-after-admin")
@ApiBearerAuth()
@Controller("api/admin/before-after")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class BeforeAfterAdminController {
  constructor(private readonly service: BeforeAfterService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.manage_before_after)
  list(@Query() query: ListBeforeAfterQueryDto) {
    return this.service.listAdmin(query);
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.manage_before_after)
  get(@Param("id") id: string) {
    return this.service.getAdmin(id);
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  create(@Body() dto: UpsertBeforeAfterDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  update(@Body() dto: UpsertBeforeAfterDto, @CurrentUser() user: AuthUser) {
    return this.service.update(dto, user);
  }

  @Post("approve")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.approve_before_after)
  approve(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.approve(dto.id, user);
  }

  @Post("reject")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.approve_before_after)
  reject(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.reject(dto.id, user);
  }

  @Post("publish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.publish_before_after)
  publish(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.publish(dto.id, user);
  }

  @Post("unpublish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.publish_before_after)
  unpublish(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.unpublish(dto.id, user);
  }

  @Post("archive")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  archive(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.archive(dto.id, user);
  }

  @Post("restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  restore(@Body() dto: BeforeAfterIdDto, @CurrentUser() user: AuthUser) {
    return this.service.restore(dto.id, user);
  }

  @Post("feature")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  feature(
    @Body() dto: BeforeAfterFeatureDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.feature(dto.id, dto.featured === true, user);
  }

  @Post("reorder")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.manage_before_after)
  reorder(@Body() dto: ReorderBeforeAfterDto, @CurrentUser() user: AuthUser) {
    return this.service.reorder(dto.orderedIds, user);
  }
}
