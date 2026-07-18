import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

/**
 * Public patient-facing reviews (collection: reviews).
 * Legacy rows used `status: APPROVED|PENDING|...`.
 * New rows also set isApproved/isPublished for clearer workflow.
 */
export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: "reviews" })
export class Review {
  @Prop({ required: true, trim: true })
  displayName!: string;

  @Prop({ trim: true })
  displayNameAr?: string;

  @Prop({ trim: true })
  displayNameEn?: string;

  @Prop({ trim: true })
  displayNameFr?: string;

  @Prop({ default: true })
  isAnonymous!: boolean;

  @Prop({ required: true, trim: true })
  quoteAr!: string;

  @Prop({ trim: true })
  quoteEn?: string;

  @Prop({ trim: true })
  quoteFr?: string;

  /** Aliases for prompt field names — map to quote* in API. */
  @Prop({ trim: true })
  reviewAr?: string;

  @Prop({ trim: true })
  reviewEn?: string;

  @Prop({ trim: true })
  reviewFr?: string;

  @Prop({ min: 1, max: 5, default: 5, index: true })
  rating!: number;

  @Prop({ type: Date })
  reviewDate?: Date;

  @Prop()
  patientImage?: string;

  @Prop({
    enum: ["male", "female", "neutral", "initials", "uploaded"],
    default: "neutral",
  })
  avatarType!: string;

  @Prop({ enum: ["ar", "en", "fr"], default: "ar", index: true })
  locale!: string;

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

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", index: true })
  doctorId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, index: true })
  specialtyId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, index: true })
  serviceId?: Types.ObjectId;

  @Prop()
  specialtySlug?: string;

  @Prop()
  serviceSlug?: string;

  @Prop({ default: false, index: true })
  isVerified!: boolean;

  /** @deprecated use isVerified */
  @Prop({ default: false })
  verified!: boolean;

  @Prop({ default: false })
  consentConfirmed!: boolean;

  @Prop({ default: false, index: true })
  isApproved!: boolean;

  @Prop({ default: false, index: true })
  isPublished!: boolean;

  @Prop({ default: false, index: true })
  isFeatured!: boolean;

  @Prop({ default: 0, index: true })
  displayOrder!: number;

  @Prop({
    enum: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"],
    default: "DRAFT",
    index: true,
  })
  status!: string;

  /** Patient-facing moderation workflow (public submissions start as pending_review). */
  @Prop({
    enum: [
      "pending_review",
      "draft",
      "approved",
      "rejected",
      "published",
      "archived",
    ],
    default: "pending_review",
    index: true,
  })
  moderationStatus!: string;

  @Prop({ default: "clinic", index: true })
  source!: string;

  /** Stable seed key for idempotent imports (e.g. seed:review:01). */
  @Prop({ unique: true, sparse: true, index: true })
  sourceKey?: string;

  @Prop({ type: Date, index: true })
  publishedAt?: Date;

  @Prop({ type: Date, default: null })
  approvedAt?: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", default: null })
  approvedBy?: Types.ObjectId | null;

  @Prop({ default: false, index: true })
  isSample!: boolean;

  @Prop({ type: SchemaTypes.ObjectId })
  createdBy?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId })
  updatedBy?: Types.ObjectId;

  @Prop()
  ipAddress?: string;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;

  @Prop({ type: Date, default: null })
  archivedAt?: Date | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ isPublished: 1, isApproved: 1, displayOrder: 1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ isFeatured: 1, rating: -1 });
