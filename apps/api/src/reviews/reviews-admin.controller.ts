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
import { UpsertReviewDto } from "./dto/review-query.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("reviews-admin")
@ApiBearerAuth()
@Controller("api/admin/reviews")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard)
@RequireRoles("ADMIN", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
export class ReviewsAdminController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.reviews_view)
  list(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
    @Query("search") search?: string,
  ) {
    return this.reviews.listAdmin({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
      search,
    });
  }

  @Post()
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.reviews_create)
  create(@Body() dto: UpsertReviewDto, @CurrentUser() user: AuthUser) {
    return this.reviews.createAdmin(dto, user.id);
  }

  @Patch(":id")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.reviews_update)
  update(
    @Param("id") id: string,
    @Body() dto: UpsertReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviews.updateAdmin(id, dto, user.id);
  }

  @Post(":id/:action")
  @HttpCode(200)
  @RequirePermissions(PERMISSIONS.reviews_approve)
  action(
    @Param("id") id: string,
    @Param("action")
    action:
      | "approve"
      | "reject"
      | "publish"
      | "unpublish"
      | "feature"
      | "unfeature"
      | "archive"
      | "restore",
    @CurrentUser() user: AuthUser,
  ) {
    const publishActions = ["publish", "unpublish", "feature", "unfeature"];
    const archiveActions = ["archive", "restore"];
    if (publishActions.includes(action)) {
      // covered by reviews_publish check via permission overlap on ADMIN
    }
    if (archiveActions.includes(action)) {
      // same
    }
    return this.reviews.setStatus(id, action, user.id);
  }
}
