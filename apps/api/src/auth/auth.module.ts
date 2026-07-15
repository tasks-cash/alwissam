import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  AuthController,
  StaffInvitationsController,
} from "./auth.controller";
import { AuthService } from "./auth.service";
import { StaffInvitationsService } from "./staff-invitations.service";
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
import {
  StaffInvitation,
  StaffInvitationSchema,
} from "./schemas/staff-invitation.schema";
import {
  VerificationToken,
  VerificationTokenSchema,
} from "./schemas/verification-token.schema";
import { Patient, PatientSchema } from "../patients/schemas/patient.schema";
import {
  AppointmentRequest,
  AppointmentRequestSchema,
} from "../appointments/schemas/appointment-request.schema";
import {
  PatientConsent,
  PatientConsentSchema,
} from "../patient-portal/schemas/portal.schemas";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
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
      { name: StaffInvitation.name, schema: StaffInvitationSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
    ]),
  ],
  controllers: [AuthController, StaffInvitationsController],
  providers: [
    AuthService,
    StaffInvitationsService,
    JwtAuthGuard,
    ClinicOwnerGuard,
    JwtTokenService,
  ],
  exports: [AuthService, MongooseModule, JwtTokenService, JwtAuthGuard],
})
export class AuthModule {}
