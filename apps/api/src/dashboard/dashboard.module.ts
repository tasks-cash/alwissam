import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppointmentsModule } from "../appointments/appointments.module";
import { AuthModule } from "../auth/auth.module";
import {
  AuditLog,
  AuditLogSchema,
  User,
  UserSchema,
} from "../auth/schemas/auth.schemas";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { PatientsModule } from "../patients/patients.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    AppointmentsModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard, RolesGuard, PermissionsGuard],
})
export class DashboardModule {}
