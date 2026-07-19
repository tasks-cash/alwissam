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
import { ContactChannelsService } from "./contact-channels.service";
import {
  ContactChannelEnabledDto,
  ContactChannelIdDto,
  ReorderContactChannelsDto,
  UpsertContactChannelDto,
} from "./dto/contact-channel.dto";
import {
  CONTACT_CHANNEL_PLACEMENTS,
  type ContactChannelPlacement,
} from "./schemas/contact-channel.schema";

@ApiTags("contact-channels-public")
@Controller("api/public/contact-channels")
export class PublicContactChannelsController {
  constructor(private readonly service: ContactChannelsService) {}

  @Get()
  list(@Query("placement") rawPlacement?: string) {
    const placement = CONTACT_CHANNEL_PLACEMENTS.includes(
      rawPlacement as ContactChannelPlacement,
    )
      ? (rawPlacement as ContactChannelPlacement)
      : undefined;
    return this.service.listPublic(placement);
  }
}

@ApiTags("contact-channels-admin")
@ApiBearerAuth()
@Controller("api/admin/contact-channels")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
@RequirePermissions(PERMISSIONS.contact_channels_manage)
export class AdminContactChannelsController {
  constructor(private readonly service: ContactChannelsService) {}

  @Get()
  list(@Query("archived") archived?: string) {
    return this.service.listAdmin(archived === "true");
  }

  @Post()
  @HttpCode(200)
  create(
    @Body() dto: UpsertContactChannelDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.create(dto, actor);
  }

  @Patch(":id")
  @HttpCode(200)
  update(
    @Param("id") id: string,
    @Body() dto: UpsertContactChannelDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.update(id, dto, actor);
  }

  @Post("enabled")
  @HttpCode(200)
  setEnabled(
    @Body() dto: ContactChannelEnabledDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.setEnabled(dto.id, dto.enabled, actor);
  }

  @Post("primary")
  @HttpCode(200)
  makePrimary(
    @Body() dto: ContactChannelIdDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.makePrimary(dto.id, actor);
  }

  @Post("archive")
  @HttpCode(200)
  archive(
    @Body() dto: ContactChannelIdDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.archive(dto.id, actor);
  }

  @Post("restore")
  @HttpCode(200)
  restore(
    @Body() dto: ContactChannelIdDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.restore(dto.id, actor);
  }

  @Post("reorder")
  @HttpCode(200)
  reorder(
    @Body() dto: ReorderContactChannelsDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.service.reorder(dto, actor);
  }
}
