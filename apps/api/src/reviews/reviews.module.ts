import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../auth/schemas/auth.schemas";
import { AuditModule } from "../common/audit/audit.module";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { MediaModule } from "../media/media.module";
import { ReviewsAdminController } from "./reviews-admin.controller";
import { ReviewsController } from "./reviews.controller";
import { ReviewsService } from "./reviews.service";
import { Review, ReviewSchema } from "./schemas/review.schema";

@Module({
  imports: [
    AuthModule,
    AuditModule,
    MediaModule,
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ReviewsController, ReviewsAdminController],
  providers: [
    ReviewsService,
    ClinicOwnerGuard,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
