import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { isOwnerRole } from "../common/auth/roles";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { User } from "../auth/schemas/auth.schemas";
import {
  isAdminDashboardModeInput,
  normalizeAdminDashboardMode,
} from "./admin-dashboard-mode";
import { DashboardService } from "./dashboard.service";

class DashboardModeDto {
  @IsString()
  @IsIn(["quick", "full", "light"])
  mode!: "quick" | "full" | "light";
}

class OwnerSummaryQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(["quick", "full", "light"])
  mode?: "quick" | "full" | "light";
}

@ApiTags("dashboard")
@Controller("api/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("owner")
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  owner(
    @CurrentUser() user: AuthUser,
    @Query() query: OwnerSummaryQueryDto,
  ) {
    return this.dashboardService.ownerStats(
      user,
      normalizeAdminDashboardMode(query.mode),
    );
  }

  @Get("secretary")
  @RequireRoles("ADMIN", "SECRETARY")
  secretary() {
    return this.dashboardService.secretaryStats();
  }

  @Get("doctor")
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL")
  doctor(@CurrentUser() user: AuthUser) {
    return this.dashboardService.doctorStats(user);
  }
}

@ApiTags("admin-preferences")
@Controller("api/admin/preferences")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard)
export class AdminPreferencesController {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.load(user.id);
  }

  @Patch("dashboard-mode")
  @HttpCode(200)
  async setMode(@CurrentUser() user: AuthUser, @Body() body: DashboardModeDto) {
    if (!isOwnerRole(user.roleCode) && user.roleCode !== "DOCTOR_SPECIALIST") {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "غير مسموح بتعديل وضع لوحة التحكم.",
      });
    }
    if (!isAdminDashboardModeInput(body.mode)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "وضع لوحة التحكم غير صالح.",
      });
    }
    const mode = normalizeAdminDashboardMode(body.mode);
    await this.users.updateOne(
      { _id: user.id, deletedAt: null },
      { $set: { adminDashboardMode: mode } },
    );
    return this.load(user.id);
  }

  private async load(userId: string) {
    const row = await this.users
      .findOne({ _id: userId, deletedAt: null })
      .select("adminDashboardMode locale roleCode")
      .lean();
    return {
      ok: true,
      preferences: {
        adminDashboardMode: normalizeAdminDashboardMode(
          row?.adminDashboardMode,
        ),
        locale: row?.locale || "ar",
      },
    };
  }
}
