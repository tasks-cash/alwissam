import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type VerificationTokenDocument = HydratedDocument<VerificationToken>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "verification_tokens",
})
export class VerificationToken {
  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: ["email", "phone"] })
  channel!: "email" | "phone";

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ type: Date, default: null })
  usedAt?: Date | null;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
VerificationTokenSchema.index({ userId: 1, channel: 1, createdAt: -1 });
