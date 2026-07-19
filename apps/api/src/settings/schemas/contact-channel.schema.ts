import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

export const CONTACT_CHANNEL_TYPES = [
  "phone",
  "whatsapp",
  "viber",
  "instagram",
  "messenger",
  "telegram",
  "email",
  "custom",
] as const;

export const CONTACT_CHANNEL_PLACEMENTS = [
  "global_floating",
  "homepage",
  "contact_page",
  "footer",
  "patient_help",
  "booking_page",
] as const;

export type ContactChannelType = (typeof CONTACT_CHANNEL_TYPES)[number];
export type ContactChannelPlacement =
  (typeof CONTACT_CHANNEL_PLACEMENTS)[number];
export type ContactChannelDocument = HydratedDocument<ContactChannel>;

@Schema({ timestamps: true, collection: "contact_channels" })
export class ContactChannel {
  @Prop({ required: true, enum: CONTACT_CHANNEL_TYPES, index: true })
  type!: ContactChannelType;

  @Prop({ required: true, trim: true })
  labelAr!: string;

  @Prop({ trim: true })
  labelEn?: string;

  @Prop({ trim: true })
  labelFr?: string;

  @Prop({ required: true, trim: true })
  value!: string;

  @Prop({ required: true, trim: true })
  publicUrl!: string;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ default: true, index: true })
  isEnabled!: boolean;

  @Prop({ default: false, index: true })
  isPrimary!: boolean;

  @Prop({ default: 0, index: true })
  displayOrder!: number;

  @Prop({
    type: [String],
    enum: CONTACT_CHANNEL_PLACEMENTS,
    default: ["global_floating"],
    index: true,
  })
  placement!: ContactChannelPlacement[];

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdBy?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date, default: null, index: true })
  archivedAt?: Date | null;
}

export const ContactChannelSchema =
  SchemaFactory.createForClass(ContactChannel);

ContactChannelSchema.index(
  { type: 1, value: 1 },
  {
    unique: true,
    partialFilterExpression: { archivedAt: null },
  },
);
ContactChannelSchema.index({
  archivedAt: 1,
  isEnabled: 1,
  placement: 1,
  displayOrder: 1,
});
