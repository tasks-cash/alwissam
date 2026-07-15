import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type PatientDocument = HydratedDocument<Patient>;

@Schema({ timestamps: true, collection: "patients" })
export class Patient {
  @Prop({ required: true, unique: true, index: true })
  patientNumber!: string;

  @Prop({ required: true, trim: true, index: true })
  fullName!: string;

  @Prop({ required: true, trim: true, index: true })
  phone!: string;

  @Prop({ sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ type: Date })
  dateOfBirth?: Date;

  @Prop()
  age?: number;

  @Prop({ enum: ["MALE", "FEMALE"] })
  gender?: string;

  @Prop()
  city?: string;

  @Prop()
  address?: string;

  @Prop()
  emergencyContact?: string;

  @Prop()
  emergencyPhone?: string;

  @Prop()
  allergies?: string;

  @Prop()
  chronicIllnesses?: string;

  @Prop()
  currentMedication?: string;

  @Prop({ default: false })
  hasDiabetes!: boolean;

  @Prop({ default: false })
  hasBloodPressure!: boolean;

  @Prop({ default: false })
  isPregnant!: boolean;

  @Prop({ default: false })
  isSmoker!: boolean;

  @Prop({ enum: ["REGULAR", "LONG_TERM"], default: "REGULAR" })
  patientType!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  primaryDoctorId?: Types.ObjectId;

  /** Linked auth user for patient portal — unique when set. */
  @Prop({ type: SchemaTypes.ObjectId, ref: "User", unique: true, sparse: true, index: true })
  userId?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;

  @Prop()
  legacyId?: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ fullName: "text", phone: "text", patientNumber: "text" });
