import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  AuditLog,
  AuditLogSchema,
  Session,
  SessionSchema,
  User,
  UserSchema,
} from "../auth/schemas/auth.schemas";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { Patient, PatientSchema } from "../patients/schemas/patient.schema";
import {
  Appointment,
  AppointmentSchema,
} from "../appointments/schemas/appointment.schema";
import {
  AppointmentRequest,
  AppointmentRequestSchema,
} from "../appointments/schemas/appointment-request.schema";
import {
  DoctorMessagesController,
  PatientPortalController,
} from "./patient-portal.controller";
import { PatientPortalService } from "./patient-portal.service";
import {
  AccountDeletionRequest,
  AccountDeletionRequestSchema,
  DataExportRequest,
  DataExportRequestSchema,
  DoctorInstruction,
  DoctorInstructionSchema,
  FollowUpRecommendation,
  FollowUpRecommendationSchema,
  MedicalCase,
  MedicalCaseSchema,
  MedicalFile,
  MedicalFileSchema,
  MedicalMessage,
  MedicalMessageSchema,
  MedicalMessageThread,
  MedicalMessageThreadSchema,
  PatientConsent,
  PatientConsentSchema,
  PatientNotification,
  PatientNotificationSchema,
} from "./schemas/portal.schemas";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: AppointmentRequest.name, schema: AppointmentRequestSchema },
      { name: MedicalCase.name, schema: MedicalCaseSchema },
      { name: MedicalFile.name, schema: MedicalFileSchema },
      { name: DoctorInstruction.name, schema: DoctorInstructionSchema },
      { name: MedicalMessageThread.name, schema: MedicalMessageThreadSchema },
      { name: MedicalMessage.name, schema: MedicalMessageSchema },
      { name: PatientNotification.name, schema: PatientNotificationSchema },
      { name: FollowUpRecommendation.name, schema: FollowUpRecommendationSchema },
      { name: PatientConsent.name, schema: PatientConsentSchema },
      { name: AccountDeletionRequest.name, schema: AccountDeletionRequestSchema },
      { name: DataExportRequest.name, schema: DataExportRequestSchema },
    ]),
  ],
  controllers: [PatientPortalController, DoctorMessagesController],
  providers: [PatientPortalService, RolesGuard, PermissionsGuard],
  exports: [PatientPortalService],
})
export class PatientPortalModule {}
