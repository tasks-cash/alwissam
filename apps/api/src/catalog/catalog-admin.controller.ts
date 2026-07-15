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
import { CatalogService } from "./catalog.service";
import {
  AdminListQueryDto,
  CatalogActiveDto,
  CatalogFeatureDto,
  CatalogIdDto,
  CatalogPublishDto,
  ReorderCatalogDto,
  UpsertServiceDto,
  UpsertSpecialtyDto,
} from "./dto/catalog.dto";

@ApiTags("catalog-admin")
@ApiBearerAuth()
@Controller("api/admin/catalog")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class CatalogAdminController {
  constructor(private readonly catalog: CatalogService) {}

  @Post("seed")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_update)
  seed(@CurrentUser() _user: AuthUser) {
    return this.catalog.seedIdempotent({
      publish: process.env.SEED_CATALOG_PUBLISH !== "false",
    });
  }

  @Get("specialties")
  @RequirePermissions(PERMISSIONS.specialties_view)
  listSpecialties(@Query() query: AdminListQueryDto) {
    return this.catalog.listAdminSpecialties(query);
  }

  @Get("specialties/:id")
  @RequirePermissions(PERMISSIONS.specialties_view)
  getSpecialty(@Param("id") id: string) {
    return this.catalog.getAdminSpecialty(id);
  }

  @Post("specialties")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_create)
  createSpecialty(
    @Body() dto: UpsertSpecialtyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.upsertSpecialty(dto, user);
  }

  @Patch("specialties")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_update)
  updateSpecialty(
    @Body() dto: UpsertSpecialtyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.upsertSpecialty(dto, user);
  }

  @Post("specialties/publish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_publish)
  publishSpecialty(
    @Body() dto: CatalogPublishDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setSpecialtyFlags(
      dto.id,
      { isPublic: dto.publish !== false },
      user,
    );
  }

  @Post("specialties/activate")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_update)
  activateSpecialty(
    @Body() dto: CatalogActiveDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setSpecialtyFlags(dto.id, { isActive: dto.active }, user);
  }

  @Post("specialties/feature")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_update)
  featureSpecialty(
    @Body() dto: CatalogFeatureDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setSpecialtyFlags(
      dto.id,
      { isFeatured: dto.featured },
      user,
    );
  }

  @Post("specialties/archive")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_archive)
  archiveSpecialty(@Body() dto: CatalogIdDto, @CurrentUser() user: AuthUser) {
    return this.catalog.archiveSpecialty(dto.id, user, false);
  }

  @Post("specialties/restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_archive)
  restoreSpecialty(@Body() dto: CatalogIdDto, @CurrentUser() user: AuthUser) {
    return this.catalog.archiveSpecialty(dto.id, user, true);
  }

  @Post("specialties/reorder")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.specialties_reorder)
  reorderSpecialties(
    @Body() dto: ReorderCatalogDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.reorderSpecialties(dto.orderedIds, user);
  }

  @Get("services")
  @RequirePermissions(PERMISSIONS.services_view)
  listServices(@Query() query: AdminListQueryDto) {
    return this.catalog.listAdminServices(query);
  }

  @Get("services/:id")
  @RequirePermissions(PERMISSIONS.services_view)
  getService(@Param("id") id: string) {
    return this.catalog.getAdminService(id);
  }

  @Post("services")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_create)
  createService(@Body() dto: UpsertServiceDto, @CurrentUser() user: AuthUser) {
    return this.catalog.upsertService(dto, user);
  }

  @Patch("services")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_update)
  updateService(@Body() dto: UpsertServiceDto, @CurrentUser() user: AuthUser) {
    return this.catalog.upsertService(dto, user);
  }

  @Post("services/publish")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_publish)
  publishService(
    @Body() dto: CatalogPublishDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setServiceFlags(
      dto.id,
      { isPublic: dto.publish !== false },
      user,
    );
  }

  @Post("services/activate")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_update)
  activateService(
    @Body() dto: CatalogActiveDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setServiceFlags(dto.id, { isActive: dto.active }, user);
  }

  @Post("services/feature")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_update)
  featureService(
    @Body() dto: CatalogFeatureDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.setServiceFlags(
      dto.id,
      { isFeatured: dto.featured },
      user,
    );
  }

  @Post("services/archive")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_archive)
  archiveService(@Body() dto: CatalogIdDto, @CurrentUser() user: AuthUser) {
    return this.catalog.archiveService(dto.id, user, false);
  }

  @Post("services/restore")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_archive)
  restoreService(@Body() dto: CatalogIdDto, @CurrentUser() user: AuthUser) {
    return this.catalog.archiveService(dto.id, user, true);
  }

  @Post("services/reorder")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.services_reorder)
  reorderServices(
    @Body() dto: ReorderCatalogDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.reorderServices(dto.orderedIds, user);
  }
}
