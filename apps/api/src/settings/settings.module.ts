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
import {
  ContactChannel,
  ContactChannelSchema,
} from "./schemas/contact-channel.schema";
import {
  AdminContactChannelsController,
  PublicContactChannelsController,
} from "./contact-channels.controller";
import { ContactChannelsService } from "./contact-channels.service";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: ClinicSetting.name, schema: ClinicSettingSchema },
      { name: ContactMessage.name, schema: ContactMessageSchema },
      { name: ContactChannel.name, schema: ContactChannelSchema },
    ]),
  ],
  controllers: [
    SettingsController,
    PublicContactChannelsController,
    AdminContactChannelsController,
  ],
  providers: [
    SettingsService,
    ContactChannelsService,
    JwtAuthGuard,
    ClinicOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [SettingsService, ContactChannelsService],
})
export class SettingsModule {}
