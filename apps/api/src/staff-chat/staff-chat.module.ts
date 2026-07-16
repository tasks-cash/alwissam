import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  AuditLog,
  AuditLogSchema,
  User,
  UserSchema,
} from "../auth/schemas/auth.schemas";
import { AuditModule } from "../common/audit/audit.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { StaffChatController } from "./staff-chat.controller";
import { StaffChatGateway } from "./staff-chat.gateway";
import { StaffChatService } from "./staff-chat.service";
import {
  StaffConversation,
  StaffConversationSchema,
} from "./schemas/staff-conversation.schema";
import {
  StaffMessage,
  StaffMessageSchema,
} from "./schemas/staff-message.schema";

@Module({
  imports: [
    AuthModule,
    AuditModule,
    MongooseModule.forFeature([
      { name: StaffMessage.name, schema: StaffMessageSchema },
      { name: StaffConversation.name, schema: StaffConversationSchema },
      { name: User.name, schema: UserSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [StaffChatController],
  providers: [
    StaffChatService,
    StaffChatGateway,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [StaffChatService, StaffChatGateway],
})
export class StaffChatModule {}
