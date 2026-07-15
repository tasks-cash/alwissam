import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../auth/schemas/auth.schemas";
import { AuditModule } from "../common/audit/audit.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { ClinicOwnerGuard } from "../common/auth/session.guard";
import { BeforeAfterAdminController } from "./before-after-admin.controller";
import { BeforeAfterPublicController } from "./before-after-public.controller";
import { BeforeAfterService } from "./before-after.service";
import {
  BeforeAfterCase,
  BeforeAfterCaseSchema,
} from "./schemas/before-after-case.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: BeforeAfterCase.name, schema: BeforeAfterCaseSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
  ],
  controllers: [BeforeAfterAdminController, BeforeAfterPublicController],
  providers: [
    BeforeAfterService,
    ClinicOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [BeforeAfterService],
})
export class BeforeAfterModule {}
