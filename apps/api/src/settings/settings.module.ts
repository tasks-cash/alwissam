import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import {
  ClinicSetting,
  ClinicSettingSchema,
} from "./schemas/clinic-setting.schema";
import {
  ContactMessage,
  ContactMessageSchema,
} from "./schemas/contact-message.schema";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ClinicSetting.name, schema: ClinicSettingSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [
    SettingsService,
    JwtAuthGuard,
    ClinicOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [SettingsService],
})
export class SettingsModule {}
