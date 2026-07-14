import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {
  AuditLog,
  AuditLogSchema,
  PasswordResetToken,
  PasswordResetTokenSchema,
  Session,
  SessionSchema,
  User,
  UserSchema,
} from "./schemas/auth.schemas";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { JwtTokenService } from "../common/auth/jwt-token.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtTokenService],
  exports: [AuthService, MongooseModule, JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
