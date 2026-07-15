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
import { Patient, PatientSchema } from "../patients/schemas/patient.schema";
import {
  AppointmentRequest,
  AppointmentRequestSchema,
} from "../appointments/schemas/appointment-request.schema";
import {
  PatientConsent,
  PatientConsentSchema,
} from "../patient-portal/schemas/portal.schemas";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { JwtTokenService } from "../common/auth/jwt-token.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: AppointmentRequest.name, schema: AppointmentRequestSchema },
      { name: PatientConsent.name, schema: PatientConsentSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, JwtTokenService],
  exports: [AuthService, MongooseModule, JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
