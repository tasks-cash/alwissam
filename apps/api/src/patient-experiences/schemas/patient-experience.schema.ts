import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type PatientExperienceDocument = HydratedDocument<PatientExperience>;

@Schema({ timestamps: true, collection: "patient_experiences" })
export class PatientExperience {
  @Prop({ trim: true })
  displayNameAr?: string;

  @Prop({ trim: true })
  displayNameEn?: string;

  @Prop({ trim: true })
  displayNameFr?: string;

  @Prop({ default: true })
  isAnonymous!: boolean;

  @Prop({ default: "مريض من العيادة" })
  anonymousLabelAr!: string;

  @Prop({ default: "Verified clinic patient" })
  anonymousLabelEn!: string;

  @Prop({ default: "Patient de la clinique" })
  anonymousLabelFr!: string;

  @Prop({ trim: true })
  subjectAr?: string;

  @Prop({ trim: true })
  subjectEn?: string;

  @Prop({ trim: true })
  subjectFr?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Patient", index: true })
  patientId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Appointment", index: true })
  appointmentId?: Types.ObjectId;

  @Prop({
    enum: [
      "pending_review",
      "approved",
      "rejected",
      "published",
      "archived",
    ],
    default: "pending_review",
    index: true,
  })
  moderationStatus!: string;

  @Prop({ default: "admin", index: true })
  source!: string;

  @Prop({ required: true, trim: true })
  reviewAr!: string;

  @Prop({ trim: true })
  reviewEn?: string;

  @Prop({ trim: true })
  reviewFr?: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop()
  patientImageUrl?: string;

  /** Public avatar fallback — never auto-filled from Patient account photos. */
  @Prop({
    enum: ["male", "female", "neutral", "initials", "uploaded"],
    default: "neutral",
  })
  avatarType!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", index: true })
  doctorId?: Types.ObjectId;

  @Prop({ trim: true, index: true })
  serviceSlug?: string;

  @Prop({ trim: true, index: true })
  specialtySlug?: string;

  @Prop({ trim: true })
  treatmentTitleAr?: string;

  @Prop({ trim: true })
  treatmentTitleEn?: string;

  @Prop({ trim: true })
  treatmentTitleFr?: string;

  @Prop({ type: Date })
  reviewDate?: Date;

  @Prop({ default: false })
  isVerifiedPatient!: boolean;

  @Prop({ default: false, index: true })
  isFeatured!: boolean;

  @Prop({ default: false, index: true })
  isApproved!: boolean;

  @Prop({ default: false, index: true })
  isPublished!: boolean;

  @Prop({ default: 0, index: true })
  displayOrder!: number;

  @Prop({ default: false })
  consentConfirmed!: boolean;

  /** Internal only — never expose on public APIs */
  @Prop()
  consentDocumentReference?: string;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  updatedById?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  archivedAt?: Date | null;
}

export const PatientExperienceSchema =
  SchemaFactory.createForClass(PatientExperience);

PatientExperienceSchema.index({
  isPublished: 1,
  isApproved: 1,
  archivedAt: 1,
  isFeatured: 1,
  displayOrder: 1,
});
PatientExperienceSchema.index({ publishedAt: -1 });
