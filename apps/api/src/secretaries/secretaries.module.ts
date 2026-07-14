import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { SecretariesController } from "./secretaries.controller";
import { SecretariesService } from "./secretaries.service";

@Module({
  imports: [AuthModule],
  controllers: [SecretariesController],
  providers: [SecretariesService, JwtAuthGuard, ClinicOwnerGuard],
  exports: [SecretariesService],
})
export class SecretariesModule {}
