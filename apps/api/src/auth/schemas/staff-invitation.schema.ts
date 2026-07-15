import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export type StaffInvitationDocument = HydratedDocument<StaffInvitation>;

@Schema({ timestamps: true, collection: "staff_invitations" })
export class StaffInvitation {
  @Prop({ required: true, unique: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, enum: ["DOCTOR", "SECRETARY"] })
  role!: "DOCTOR" | "SECRETARY";

  @Prop({ enum: ["GENERAL", "SPECIALIST"] })
  doctorType?: "GENERAL" | "SPECIALIST";

  @Prop({ lowercase: true, trim: true })
  email?: string;

  @Prop({ trim: true })
  phoneCanonical?: string;

  @Prop({ trim: true })
  fullName?: string;

  @Prop({ type: [SchemaTypes.ObjectId], default: [] })
  assignedDoctorIds!: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, ref: "User", required: true, index: true })
  createdBy!: Types.ObjectId;

  @Prop({ required: true, index: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  acceptedAt?: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  acceptedByUserId?: Types.ObjectId;

  @Prop({ type: Date, default: null })
  revokedAt?: Date | null;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  revokedBy?: Types.ObjectId;

  @Prop({
    enum: ["pending", "accepted", "expired", "revoked"],
    default: "pending",
    index: true,
  })
  status!: string;

  @Prop({ type: Object })
  scheduleDraft?: {
    shiftCode?: string;
    workStartTime?: string;
    workEndTime?: string;
    workDays?: string;
  };
}

export const StaffInvitationSchema =
  SchemaFactory.createForClass(StaffInvitation);
StaffInvitationSchema.index({ email: 1, status: 1 });
