import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export const APPOINTMENT_STATUSES = [
  "NEW_REQUEST",
  "UNDER_SECRETARY_REVIEW",
  "DOCTOR_ASSIGNED",
  "WAITING_DOCTOR_APPROVAL",
  "CONFIRMED",
  "REMINDER_SENT",
  "PATIENT_ARRIVED",
  "WAITING_ROOM",
  "IN_TREATMENT",
  "COMPLETED",
  "FOLLOW_UP_REQUIRED",
  "RESCHEDULED",
  "CANCELLED_BY_PATIENT",
  "CANCELLED_BY_CLINIC",
  "NO_SHOW",
  "EMERGENCY",
  "REFERRED_TO_OTHER_DOCTOR",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = [
  "GENERAL_EXAM",
  "EMERGENCY",
  "TOOTHACHE",
  "CLEANING",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "ORTHO_CONSULT",
  "ORTHO_FOLLOWUP",
  "PROSTHETICS",
  "SURGERY_CONSULT",
  "SURGERY",
  "POST_OP_FOLLOWUP",
  "OTHER",
] as const;

export const WAITING_ROOM_STATUSES = [
  "ARRIVED",
  "WAITING",
  "WITH_DOCTOR",
  "SESSION_DONE",
  "NEEDS_FOLLOWUP",
  "LEFT",
] as const;

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ timestamps: true, collection: "appointments" })
export class Appointment {
  @Prop({ required: true, unique: true, index: true })
  appointmentNumber!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  doctorId!: Types.ObjectId;

  @Prop({ required: true, enum: APPOINTMENT_TYPES })
  appointmentType!: string;

  @Prop({
    required: true,
    enum: APPOINTMENT_STATUSES,
    default: "CONFIRMED",
    index: true,
  })
  status!: string;

  @Prop({ required: true, index: true })
  startAt!: Date;

  @Prop({ required: true })
  endAt!: Date;

  @Prop({ default: 30 })
  durationMinutes!: number;

  @Prop({ default: false })
  isEmergency!: boolean;

  @Prop()
  room?: string;

  @Prop()
  notes?: string;

  @Prop()
  cancelReason?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop()
  legacyId?: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
AppointmentSchema.index({ doctorId: 1, startAt: 1 });
AppointmentSchema.index({ status: 1, startAt: 1 });

export type WaitingRoomEntryDocument = HydratedDocument<WaitingRoomEntry>;

@Schema({ timestamps: true, collection: "waiting_room_entries" })
export class WaitingRoomEntry {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true,
  })
  appointmentId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  doctorId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: WAITING_ROOM_STATUSES,
    default: "ARRIVED",
    index: true,
  })
  status!: string;

  @Prop({ default: () => new Date() })
  arrivedAt!: Date;

  @Prop({ type: Date })
  calledAt?: Date;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ default: false })
  urgency!: boolean;

  @Prop()
  note?: string;

  @Prop()
  legacyId?: string;
}

export const WaitingRoomEntrySchema =
  SchemaFactory.createForClass(WaitingRoomEntry);
WaitingRoomEntrySchema.index({ status: 1, doctorId: 1 });
