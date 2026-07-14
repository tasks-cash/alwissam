import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import {
  ClinicOwnerGuard,
  CsrfGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { DoctorsController } from "./doctors.controller";
import { DoctorsService } from "./doctors.service";

@Module({
  imports: [AuthModule],
  controllers: [DoctorsController],
  providers: [DoctorsService, JwtAuthGuard, ClinicOwnerGuard, CsrfGuard],
  exports: [DoctorsService],
})
export class DoctorsModule {}
