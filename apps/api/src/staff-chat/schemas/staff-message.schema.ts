import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

export type StaffMessageDocument = HydratedDocument<StaffMessage>;

export const STAFF_MESSAGE_KINDS = ["TEXT", "VOICE"] as const;

@Schema({ timestamps: true, collection: "staff_messages" })
export class StaffMessage {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: "StaffConversation",
    index: true,
  })
  conversationId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  senderId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  receiverId!: Types.ObjectId;

  @Prop({ required: true, enum: STAFF_MESSAGE_KINDS, index: true })
  kind!: string;

  /** Alias for messageType: text | voice (API-facing). */
  @Prop({ maxlength: 4000, default: "" })
  body!: string;

  /** Relative private storage key — never a public URL or Base64 blob. */
  @Prop()
  audioStorageKey?: string;

  @Prop()
  audioMimeType?: string;

  @Prop({ type: Number })
  audioSizeBytes?: number;

  /** Client-supplied idempotency key to prevent duplicate sends. */
  @Prop({ sparse: true, index: true })
  clientMessageId?: string;

  @Prop({ type: Date, default: null })
  deliveredAt?: Date | null;

  @Prop({ type: Date, default: null })
  readAt?: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  deletedBy?: Types.ObjectId;
}

export const StaffMessageSchema = SchemaFactory.createForClass(StaffMessage);
StaffMessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
StaffMessageSchema.index({ receiverId: 1, readAt: 1, deletedAt: 1 });
StaffMessageSchema.index({ conversationId: 1, createdAt: -1 });
StaffMessageSchema.index(
  { senderId: 1, clientMessageId: 1 },
  { unique: true, sparse: true },
);
