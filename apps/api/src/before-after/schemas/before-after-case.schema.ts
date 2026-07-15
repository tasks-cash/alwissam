import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type BeforeAfterCaseDocument = HydratedDocument<BeforeAfterCase>;

@Schema({ timestamps: true, collection: "before_after_cases" })
export class BeforeAfterCase {
  @Prop({ required: true, trim: true })
  titleAr!: string;

  @Prop({ trim: true })
  titleEn?: string;

  @Prop({ trim: true })
  titleFr?: string;

  @Prop({ trim: true })
  descriptionAr?: string;

  @Prop({ trim: true })
  descriptionEn?: string;

  @Prop({ trim: true })
  descriptionFr?: string;

  @Prop({ required: true })
  beforeImageUrl!: string;

  @Prop({ required: true })
  afterImageUrl!: string;

  @Prop({ trim: true })
  beforeAltAr?: string;

  @Prop({ trim: true })
  beforeAltEn?: string;

  @Prop({ trim: true })
  beforeAltFr?: string;

  @Prop({ trim: true })
  afterAltAr?: string;

  @Prop({ trim: true })
  afterAltEn?: string;

  @Prop({ trim: true })
  afterAltFr?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", index: true })
  doctorId?: Types.ObjectId;

  @Prop({ trim: true, index: true })
  serviceSlug?: string;

  @Prop({ trim: true, index: true })
  specialtySlug?: string;

  @Prop({ trim: true })
  treatmentCategory?: string;

  @Prop({ trim: true })
  treatmentDuration?: string;

  @Prop({ type: Date })
  resultDate?: Date;

  @Prop({ trim: true })
  patientAgeRange?: string;

  @Prop({ default: true })
  isAnonymous!: boolean;

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

export const BeforeAfterCaseSchema =
  SchemaFactory.createForClass(BeforeAfterCase);

BeforeAfterCaseSchema.index({
  isPublished: 1,
  isApproved: 1,
  archivedAt: 1,
  isFeatured: 1,
  displayOrder: 1,
});
BeforeAfterCaseSchema.index({ publishedAt: -1 });
