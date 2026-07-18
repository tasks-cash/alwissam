import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

@Schema({ timestamps: true, collection: "contact_messages" })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  fullName!: string;

  /** Optional legacy field — public form no longer collects email. */
  @Prop({ sparse: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ required: true, trim: true, index: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  subject!: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({ enum: ["ar", "en", "fr"] })
  locale?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", default: null })
  doctorId?: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Specialty", default: null })
  specialtyId?: Types.ObjectId | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "DentalService", default: null })
  serviceId?: Types.ObjectId | null;

  /** Legacy uppercase values remain readable; all new writes use lowercase. */
  @Prop({
    default: "new",
    enum: [
      "new",
      "in_review",
      "contacted",
      "resolved",
      "archived",
      "NEW",
      "READ",
      "read",
      "ARCHIVED",
    ],
    index: true,
  })
  status!: string;

  @Prop({ default: "contact", trim: true, index: true })
  sourcePage?: string;

  @Prop()
  ipAddress?: string;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ status: 1, createdAt: -1 });
