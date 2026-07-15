import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

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

  /** Public default status is `new` (legacy rows may use NEW/READ/ARCHIVED). */
  @Prop({
    default: "new",
    enum: ["new", "NEW", "READ", "read", "ARCHIVED", "archived"],
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
