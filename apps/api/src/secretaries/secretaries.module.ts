import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { SecretariesController } from "./secretaries.controller";
import { SecretariesService } from "./secretaries.service";

@Module({
  imports: [AuthModule],
  controllers: [SecretariesController],
  providers: [
    SecretariesService,
    JwtAuthGuard,
    ClinicOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [SecretariesService],
})
export class SecretariesModule {}
