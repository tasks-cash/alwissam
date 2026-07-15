import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

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

  @Prop({ type: Types.ObjectId, ref: "User", index: true })
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

  @Prop({ type: Types.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
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
