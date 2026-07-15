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
  AdminFaqsQueryDto,
  FaqActiveDto,
  FaqFeatureDto,
  FaqIdDto,
  FaqPublishDto,
  ReorderFaqsDto,
  UpsertFaqDto,
} from "./dto/faq.dto";
import { FaqsService } from "./faqs.service";

@ApiTags("faqs-admin")
@ApiBearerAuth()
@Controller("api/admin/faqs")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class FaqsAdminController {
  constructor(private readonly faqs: FaqsService) {}

  @Post("seed")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_update)
  seed() {
    return this.faqs.seedIdempotent({
      publish: process.env.SEED_FAQ_PUBLISH !== "false",
    });
  }

  @Get()
  @RequirePermissions(PERMISSIONS.faqs_view)
  list(@Query() query: AdminFaqsQueryDto) {
    return this.faqs.listAdmin(query);
  }

  @Get("duplicates")
  @RequirePermissions(PERMISSIONS.faqs_view)
  duplicates() {
    return this.faqs.detectDuplicates();
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.faqs_view)
  get(@Param("id") id: string) {
    return this.faqs.getAdmin(id);
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_create)
  create(@Body() dto: UpsertFaqDto, @CurrentUser() user: AuthUser) {
    return this.faqs.upsert(dto, user);
  }

  @Patch()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_update)
  update(@Body() dto: UpsertFaqDto, @CurrentUser() user: AuthUser) {
    return this.faqs.upsert(dto, user);
  }

  @Post("publish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_publish)
  publish(@Body() dto: FaqPublishDto, @CurrentUser() user: AuthUser) {
    return this.faqs.setFlags(
      dto.id,
      { isPublic: dto.publish !== false },
      user,
    );
  }

  @Post("activate")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_update)
  activate(@Body() dto: FaqActiveDto, @CurrentUser() user: AuthUser) {
    return this.faqs.setFlags(dto.id, { isActive: dto.active }, user);
  }

  @Post("feature")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_update)
  feature(@Body() dto: FaqFeatureDto, @CurrentUser() user: AuthUser) {
    return this.faqs.setFlags(dto.id, { isFeatured: dto.featured }, user);
  }

  @Post("archive")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_archive)
  archive(@Body() dto: FaqIdDto, @CurrentUser() user: AuthUser) {
    return this.faqs.archive(dto.id, user, false);
  }

  @Post("restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_archive)
  restore(@Body() dto: FaqIdDto, @CurrentUser() user: AuthUser) {
    return this.faqs.archive(dto.id, user, true);
  }

  @Post("reorder")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.faqs_reorder)
  reorder(@Body() dto: ReorderFaqsDto, @CurrentUser() user: AuthUser) {
    return this.faqs.reorder(dto.orderedIds, user);
  }
}
