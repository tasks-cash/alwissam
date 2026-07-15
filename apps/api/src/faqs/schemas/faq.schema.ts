import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";
import { FAQ_CATEGORIES } from "../faq.categories";

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ collection: "faqs", timestamps: true })
export class Faq {
  @Prop({ required: true, trim: true })
  questionAr!: string;

  @Prop({ required: true, trim: true })
  questionEn!: string;

  @Prop({ required: true, trim: true })
  questionFr!: string;

  @Prop({ required: true, trim: true })
  answerAr!: string;

  @Prop({ required: true, trim: true })
  answerEn!: string;

  @Prop({ required: true, trim: true })
  answerFr!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  slug!: string;

  @Prop({
    required: true,
    enum: FAQ_CATEGORIES,
    index: true,
  })
  category!: string;

  @Prop({ type: [String], default: [] })
  keywordsAr!: string[];

  @Prop({ type: [String], default: [] })
  keywordsEn!: string[];

  @Prop({ type: [String], default: [] })
  keywordsFr!: string[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: "Specialty", default: [] })
  relatedSpecialtyIds!: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: "DentalService", default: [] })
  relatedServiceIds!: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: "User", default: [] })
  relatedDoctorIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  relatedSpecialtySlugs!: string[];

  @Prop({ type: [String], default: [] })
  relatedServiceSlugs!: string[];

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ default: true, index: true })
  isPublic!: boolean;

  @Prop({ default: false, index: true })
  isFeatured!: boolean;

  @Prop({ default: 100, index: true })
  displayOrder!: number;

  @Prop({ type: Date, default: null })
  publishedAt!: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", default: null })
  updatedBy!: Types.ObjectId | null;

  @Prop({ type: Date, default: null, index: true })
  archivedAt!: Date | null;

  @Prop({ default: "", trim: true, index: true })
  normalizedQuestionAr!: string;

  @Prop({ default: "", trim: true, index: true })
  normalizedQuestionEn!: string;

  @Prop({ default: "", trim: true, index: true })
  normalizedQuestionFr!: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
FaqSchema.index({
  isActive: 1,
  isPublic: 1,
  archivedAt: 1,
  displayOrder: 1,
});
FaqSchema.index({ category: 1, displayOrder: 1 });
FaqSchema.index({ isFeatured: 1, displayOrder: 1 });
FaqSchema.index({ questionAr: 1 });
FaqSchema.index({ questionEn: 1 });
FaqSchema.index({ questionFr: 1 });
