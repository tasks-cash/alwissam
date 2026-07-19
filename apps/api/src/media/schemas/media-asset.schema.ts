import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

export type MediaAssetDocument = HydratedDocument<MediaAsset>;

@Schema({ timestamps: true, collection: "media_assets" })
export class MediaAsset {
  @Prop({ required: true, unique: true, index: true })
  storageKey!: string;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true, min: 1 })
  sizeBytes!: number;

  @Prop({ required: true, min: 1 })
  width!: number;

  @Prop({ required: true, min: 1 })
  height!: number;

  @Prop({ default: "public_content", index: true })
  purpose!: string;

  @Prop({ default: false, index: true })
  isPublic!: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  archivedAt?: Date | null;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
MediaAssetSchema.index({ isPublic: 1, archivedAt: 1, createdAt: -1 });
