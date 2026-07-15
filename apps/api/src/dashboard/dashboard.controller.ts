import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import type { AuthUser } from "../common/auth/session.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("dashboard")
@Controller("api/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("owner")
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
  owner() {
    return this.dashboardService.ownerStats();
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
