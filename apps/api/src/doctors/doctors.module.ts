import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import {
  ClinicOwnerGuard,
  CsrfGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { DoctorsRosterController } from "./doctors-public.controller";
import { DoctorSettingsController } from "./doctor-settings.controller";
import { DoctorSettingsService } from "./doctor-settings.service";
import { DoctorsController } from "./doctors.controller";
import { DoctorsService } from "./doctors.service";
import { PublicDoctorsController } from "./public-doctors.controller";

@Module({
  imports: [AuthModule],
  controllers: [
    DoctorsController,
    DoctorSettingsController,
    DoctorsRosterController,
    PublicDoctorsController,
  ],
  providers: [
    DoctorsService,
    DoctorSettingsService,
    JwtAuthGuard,
    ClinicOwnerGuard,
    CsrfGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [DoctorsService],
})
export class DoctorsModule {}
