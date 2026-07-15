import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { APPOINTMENT_TYPES } from "./appointment.schema";

export type AppointmentRequestDocument = HydratedDocument<AppointmentRequest>;

export const ASSIGNMENT_MODES = [
  "patient_selected_doctor",
  "patient_selected_specialty",
  "reception_assignment_required",
] as const;

export type AssignmentMode = (typeof ASSIGNMENT_MODES)[number];

@Schema({ timestamps: true, collection: "appointment_requests" })
export class AppointmentRequest {
  @Prop({ required: true, unique: true, index: true })
  requestNumber!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, trim: true, index: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ required: true, enum: APPOINTMENT_TYPES })
  appointmentType!: string;

  @Prop({ default: false })
  isEmergency!: boolean;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  preferredDoctorId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: "User", default: null })
  doctorId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  specialtyId?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, default: null })
  serviceId?: Types.ObjectId | null;

  @Prop()
  specialtySlug?: string;

  @Prop()
  serviceSlug?: string;

  @Prop()
  preferredDate?: Date;

  @Prop()
  preferredTime?: string;

  @Prop({ default: false })
  consentAccepted!: boolean;

  @Prop({
    enum: ASSIGNMENT_MODES,
    default: "reception_assignment_required",
    index: true,
  })
  assignmentMode!: AssignmentMode;

  @Prop({ type: Types.ObjectId, ref: "User" })
  assignedBy?: Types.ObjectId;

  @Prop({ type: Date })
  assignedAt?: Date;

  @Prop()
  assignmentNotes?: string;

  @Prop({
    default: "NEW_REQUEST",
    enum: [
      "NEW_REQUEST",
      "pending_confirmation",
      "pending_reception_assignment",
      "UNDER_SECRETARY_REVIEW",
      "DOCTOR_ASSIGNED",
      "CONFIRMED",
      "CANCELLED_BY_PATIENT",
      "CANCELLED_BY_CLINIC",
      "EMERGENCY",
      "NEEDS_MORE_INFO",
    ],
    index: true,
  })
  status!: string;

  @Prop()
  additionalNotes?: string;

  @Prop()
  queueNumber?: string;

  @Prop({ default: "public_website" })
  source?: string;

  /** Linked only when phone matches an authenticated patient account (not by name). */
  @Prop({ type: Types.ObjectId, ref: "Patient", index: true })
  linkedPatientId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", index: true })
  linkedUserId?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const AppointmentRequestSchema =
  SchemaFactory.createForClass(AppointmentRequest);
AppointmentRequestSchema.index({ status: 1, createdAt: -1 });
AppointmentRequestSchema.index({ assignmentMode: 1, status: 1 });
