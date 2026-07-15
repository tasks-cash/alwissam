import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type DentalServiceDocument = HydratedDocument<DentalService>;

@Schema({ collection: "dental_services", timestamps: true })
export class DentalService {
  @Prop({ required: true, trim: true })
  nameAr!: string;

  @Prop({ required: true, trim: true })
  nameEn!: string;

  @Prop({ required: true, trim: true })
  nameFr!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  slug!: string;

  @Prop({ default: "", trim: true })
  descriptionAr!: string;

  @Prop({ default: "", trim: true })
  descriptionEn!: string;

  @Prop({ default: "", trim: true })
  descriptionFr!: string;

  @Prop({ default: "", trim: true })
  shortDescriptionAr!: string;

  @Prop({ default: "", trim: true })
  shortDescriptionEn!: string;

  @Prop({ default: "", trim: true })
  shortDescriptionFr!: string;

  @Prop({ type: [SchemaTypes.ObjectId], ref: "Specialty", default: [] })
  specialtyIds!: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: "User", default: [] })
  doctorIds!: Types.ObjectId[];

  @Prop({ default: "tooth", trim: true })
  icon!: string;

  @Prop({ default: "", trim: true })
  image!: string;

  @Prop({ type: Number, default: null })
  durationMinutes!: number | null;

  @Prop({ type: Number, default: null })
  priceFrom!: number | null;

  @Prop({ default: "DZD", trim: true })
  currency!: string;

  @Prop({ default: false })
  priceApproved!: boolean;

  @Prop({ default: false })
  requiresConsultation!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isPublic!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: 100 })
  displayOrder!: number;

  @Prop({ type: [String], default: [] })
  aliases!: string[];

  @Prop({ type: Date, default: null })
  archivedAt!: Date | null;
}

export const DentalServiceSchema = SchemaFactory.createForClass(DentalService);
DentalServiceSchema.index({ isActive: 1, isPublic: 1, archivedAt: 1, displayOrder: 1 });
DentalServiceSchema.index({ specialtyIds: 1, isActive: 1, isPublic: 1 });
DentalServiceSchema.index({ isFeatured: 1, displayOrder: 1 });
