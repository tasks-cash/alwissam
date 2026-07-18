import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type SpecialtyDocument = HydratedDocument<Specialty>;

@Schema({ collection: "specialties", timestamps: true })
export class Specialty {
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

  @Prop({ default: "tooth", trim: true })
  icon!: string;

  @Prop({ default: "", trim: true })
  image!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: true })
  isPublic!: boolean;

  @Prop({ default: false })
  isFeatured!: boolean;

  @Prop({ default: true })
  isBookable!: boolean;

  @Prop({ default: 100 })
  displayOrder!: number;

  @Prop({ type: [SchemaTypes.ObjectId], ref: "User", default: [] })
  doctorIds!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  aliases!: string[];

  @Prop({ type: Date, default: null })
  archivedAt!: Date | null;
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty);
SpecialtySchema.index({ isActive: 1, isPublic: 1, archivedAt: 1, displayOrder: 1 });
SpecialtySchema.index({ isFeatured: 1, displayOrder: 1 });
SpecialtySchema.index({ nameAr: 1 });
SpecialtySchema.index({ nameEn: 1 });
