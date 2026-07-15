import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type MedicalCaseDocument = HydratedDocument<MedicalCase>;

export const MEDICAL_CASE_STATUSES = [
  "new",
  "under_evaluation",
  "treatment_planned",
  "treatment_in_progress",
  "follow_up",
  "completed",
  "closed",
] as const;

@Schema({ timestamps: true, collection: "medical_cases" })
export class MedicalCase {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", index: true })
  doctorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Appointment", index: true })
  appointmentId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  specialtyLabel?: string;

  @Prop({
    required: true,
    enum: MEDICAL_CASE_STATUSES,
    default: "new",
    index: true,
  })
  status!: string;

  @Prop({ type: Date, default: Date.now })
  startDate!: Date;

  @Prop({ type: Date })
  followUpDate?: Date;

  @Prop()
  patientVisibleSummary?: string;

  @Prop()
  patientVisibleTreatmentPlan?: string;

  @Prop()
  patientVisibleInstructions?: string;

  @Prop()
  internalNotes?: string;

  @Prop({ default: true })
  visibleToPatient!: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const MedicalCaseSchema = SchemaFactory.createForClass(MedicalCase);
MedicalCaseSchema.index({ patientId: 1, status: 1, updatedAt: -1 });

export const FILE_VISIBILITIES = [
  "doctor_only",
  "staff_only",
  "patient_visible",
  "patient_uploaded",
  "shared_with_patient",
] as const;

export const PATIENT_FILE_VISIBILITIES = [
  "patient_visible",
  "patient_uploaded",
  "shared_with_patient",
] as const;

@Schema({ timestamps: true, collection: "medical_files" })
export class MedicalFile {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "MedicalCase", index: true })
  medicalCaseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Appointment", index: true })
  appointmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  uploadedById?: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  fileType!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  storageKey!: string;

  @Prop()
  originalName?: string;

  @Prop({ default: 0 })
  sizeBytes!: number;

  @Prop({
    required: true,
    enum: FILE_VISIBILITIES,
    default: "doctor_only",
    index: true,
  })
  visibility!: string;

  @Prop({ default: true })
  allowDownload!: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const MedicalFileSchema = SchemaFactory.createForClass(MedicalFile);
MedicalFileSchema.index({ patientId: 1, visibility: 1, createdAt: -1 });

@Schema({ timestamps: true, collection: "doctor_instructions" })
export class DoctorInstruction {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  doctorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Appointment", index: true })
  appointmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "MedicalCase", index: true })
  medicalCaseId?: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({
    enum: [
      "post_treatment",
      "medication",
      "food_activity",
      "oral_hygiene",
      "warning_signs",
      "next_appointment",
      "other",
    ],
    default: "other",
  })
  instructionType!: string;

  @Prop({ type: Date })
  followUpDate?: Date;

  @Prop({ default: true })
  visibleToPatient!: boolean;

  @Prop({ default: false })
  approvedForPatient!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const DoctorInstructionSchema =
  SchemaFactory.createForClass(DoctorInstruction);
DoctorInstructionSchema.index({ patientId: 1, createdAt: -1 });

export const MESSAGE_THREAD_STATUSES = [
  "open",
  "awaiting_doctor",
  "awaiting_patient",
  "closed",
  "archived",
] as const;

@Schema({ timestamps: true, collection: "medical_message_threads" })
export class MedicalMessageThread {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  doctorId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true,
    index: true,
  })
  appointmentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "MedicalCase" })
  medicalCaseId?: Types.ObjectId;

  @Prop({
    enum: MESSAGE_THREAD_STATUSES,
    default: "open",
    index: true,
  })
  status!: string;

  @Prop({ type: Date, default: Date.now })
  openedAt!: Date;

  @Prop({ type: Date })
  closedAt?: Date;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ default: 0 })
  patientUnreadCount!: number;

  @Prop({ default: 0 })
  doctorUnreadCount!: number;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const MedicalMessageThreadSchema =
  SchemaFactory.createForClass(MedicalMessageThread);
MedicalMessageThreadSchema.index({ patientId: 1, lastMessageAt: -1 });
MedicalMessageThreadSchema.index({ doctorId: 1, status: 1, lastMessageAt: -1 });

@Schema({ timestamps: true, collection: "medical_messages" })
export class MedicalMessage {
  @Prop({
    type: Types.ObjectId,
    ref: "MedicalMessageThread",
    required: true,
    index: true,
  })
  threadId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  senderId!: Types.ObjectId;

  @Prop({ required: true, enum: ["PATIENT", "DOCTOR", "STAFF"] })
  senderRole!: string;

  @Prop({ required: true, maxlength: 4000 })
  message!: string;

  @Prop({ type: [Types.ObjectId], ref: "MedicalFile", default: [] })
  attachments!: Types.ObjectId[];

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const MedicalMessageSchema =
  SchemaFactory.createForClass(MedicalMessage);
MedicalMessageSchema.index({ threadId: 1, createdAt: 1 });

@Schema({ timestamps: true, collection: "patient_notifications" })
export class PatientNotification {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true, index: true })
  type!: string;

  @Prop()
  relatedRoute?: string;

  @Prop({ default: false, index: true })
  isRead!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const PatientNotificationSchema =
  SchemaFactory.createForClass(PatientNotification);
PatientNotificationSchema.index({ patientId: 1, isRead: 1, createdAt: -1 });

@Schema({ timestamps: true, collection: "follow_up_recommendations" })
export class FollowUpRecommendation {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  doctorId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Appointment" })
  appointmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "MedicalCase" })
  medicalCaseId?: Types.ObjectId;

  @Prop({ required: true })
  reason!: string;

  @Prop({ type: Date })
  recommendedFrom?: Date;

  @Prop({ type: Date })
  recommendedTo?: Date;

  @Prop({
    enum: ["recommended", "booked", "completed", "missed", "cancelled"],
    default: "recommended",
    index: true,
  })
  status!: string;

  @Prop()
  patientInstructions?: string;

  @Prop({ default: true })
  visibleToPatient!: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const FollowUpRecommendationSchema =
  SchemaFactory.createForClass(FollowUpRecommendation);
FollowUpRecommendationSchema.index({ patientId: 1, status: 1, recommendedFrom: 1 });

@Schema({ timestamps: true, collection: "patient_consents" })
export class PatientConsent {
  @Prop({ type: Types.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  consentType!: string;

  @Prop({ default: true })
  accepted!: boolean;

  @Prop({ type: Date, default: Date.now })
  acceptedAt!: Date;

  @Prop({ type: Date })
  withdrawnAt?: Date;

  @Prop({ default: false })
  required!: boolean;

  @Prop()
  notes?: string;
}

export const PatientConsentSchema =
  SchemaFactory.createForClass(PatientConsent);
PatientConsentSchema.index({ patientId: 1, consentType: 1 }, { unique: true });

@Schema({ timestamps: true, collection: "account_deletion_requests" })
export class AccountDeletionRequest {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Patient", required: true })
  patientId!: Types.ObjectId;

  @Prop()
  reason?: string;

  @Prop({
    enum: ["pending", "under_review", "approved", "rejected", "completed"],
    default: "pending",
    index: true,
  })
  status!: string;

  @Prop({ type: Date })
  reviewedAt?: Date;
}

export const AccountDeletionRequestSchema =
  SchemaFactory.createForClass(AccountDeletionRequest);

@Schema({ timestamps: true, collection: "data_export_requests" })
export class DataExportRequest {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Patient", required: true })
  patientId!: Types.ObjectId;

  @Prop({
    enum: ["pending", "ready", "expired", "failed"],
    default: "pending",
    index: true,
  })
  status!: string;

  @Prop()
  storageKey?: string;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Date })
  readyAt?: Date;
}

export const DataExportRequestSchema =
  SchemaFactory.createForClass(DataExportRequest);
