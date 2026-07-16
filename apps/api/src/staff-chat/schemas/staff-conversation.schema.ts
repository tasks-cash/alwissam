import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, SchemaTypes, Types } from "mongoose";

export type StaffConversationDocument = HydratedDocument<StaffConversation>;

export const STAFF_CONVERSATION_TYPES = [
  "direct",
  "doctor_secretary",
  "admin_staff",
] as const;

@Schema({ timestamps: true, collection: "staff_conversations" })
export class StaffConversation {
  /** Sorted pair of participant user ObjectIds for DM uniqueness. */
  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: "User",
    required: true,
  })
  participantIds!: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  doctorId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  secretaryId?: Types.ObjectId;

  @Prop({
    enum: STAFF_CONVERSATION_TYPES,
    default: "direct",
    index: true,
  })
  conversationType!: string;

  @Prop({ default: true, index: true })
  isActive!: boolean;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ maxlength: 200, default: "" })
  lastMessagePreview!: string;

  @Prop({ type: Date, default: null })
  archivedAt?: Date | null;
}

export const StaffConversationSchema =
  SchemaFactory.createForClass(StaffConversation);
StaffConversationSchema.index({ participantIds: 1 });
StaffConversationSchema.index(
  { participantIds: 1, isActive: 1 },
  { unique: false },
);
StaffConversationSchema.index({ lastMessageAt: -1 });
StaffConversationSchema.index(
  { "participantIds.0": 1, "participantIds.1": 1 },
  { unique: true },
);
