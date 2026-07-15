import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  AuditLog,
  AuditLogSchema,
  Session,
  SessionSchema,
  User,
  UserSchema,
} from "../auth/schemas/auth.schemas";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { SecurityController } from "./security.controller";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Session.name, schema: SessionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [JwtAuthGuard, ClinicOwnerGuard, RolesGuard, PermissionsGuard],
})
export class SecurityModule {}
