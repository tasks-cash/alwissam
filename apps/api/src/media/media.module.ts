import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { MediaController } from "./media.controller";

@Module({
  imports: [AuthModule],
  controllers: [MediaController],
  providers: [RolesGuard, PermissionsGuard],
})
export class MediaModule {}
