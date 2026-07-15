import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type ReviewDocument = HydratedDocument<Review>;

@Schema({ timestamps: true, collection: "reviews" })
export class Review {
  @Prop({ required: true, trim: true })
  displayName!: string;

  @Prop({ required: true, trim: true })
  quoteAr!: string;

  @Prop({ trim: true })
  quoteEn?: string;

  @Prop({ trim: true })
  quoteFr?: string;

  @Prop({ min: 1, max: 5, default: 5 })
  rating!: number;

  @Prop({ type: Types.ObjectId, ref: "User" })
  doctorId?: Types.ObjectId;

  @Prop()
  serviceSlug?: string;

  @Prop({
    enum: ["PENDING", "APPROVED", "REJECTED", "ARCHIVED"],
    default: "PENDING",
    index: true,
  })
  status!: string;

  @Prop({ default: false })
  verified!: boolean;

  @Prop()
  ipAddress?: string;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ status: 1, createdAt: -1 });
