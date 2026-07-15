import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: "users" })
export class User {
  @Prop({ sparse: true, unique: true, lowercase: true, trim: true })
  email?: string;

  @Prop({ sparse: true, unique: true, trim: true })
  phone?: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  fullName!: string;

  @Prop({
    required: true,
    enum: ["ADMIN", "SECRETARY", "DOCTOR_GENERAL", "DOCTOR_SPECIALIST", "PATIENT"],
  })
  roleCode!: string;

  @Prop({
    enum: ["PENDING", "ACTIVE", "INACTIVE", "LOCKED"],
    default: "ACTIVE",
  })
  status!: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ type: [String], default: [] })
  permissions!: string[];

  /** UI language preference: ar | en | fr */
  @Prop({ enum: ["ar", "en", "fr"], default: "ar" })
  locale!: string;

  @Prop({ type: Object })
  doctor?: {
    type: "GENERAL" | "SPECIALIST";
    specialtyAr?: string;
    specialtyEn?: string;
    specialtyFr?: string;
    bioAr?: string;
    bioEn?: string;
    bioFr?: string;
    colorCode?: string;
    isActive?: boolean;
    /** Public-facing availability summary lines, e.g. "Sun–Thu 09:00–14:00" */
    availabilityNoteAr?: string;
    availabilityNoteEn?: string;
    availabilityNoteFr?: string;
    workingHours?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }>;
  };

  @Prop({ type: Object })
  secretary?: {
    shiftCode?: "MORNING" | "EVENING" | "CUSTOM";
    workStartTime?: string;
    workEndTime?: string;
    workDays?: string;
    employeeCode?: string;
  };

  @Prop({ default: 0 })
  failedLoginCount!: number;

  @Prop({ type: Date, default: null })
  lockedUntil?: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt?: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type SessionDocument = HydratedDocument<Session>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: "sessions" })
export class Session {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  csrfToken!: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: false })
  rememberMe!: boolean;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  revokedAt?: Date | null;

  @Prop({ type: Date, default: Date.now })
  lastActivityAt!: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetToken>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "password_reset_tokens",
})
export class PasswordResetToken {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ type: Date, default: null })
  usedAt?: Date | null;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: "audit_logs",
})
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: "User", index: true })
  userId?: Types.ObjectId;

  @Prop()
  roleCode?: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  entityType!: string;

  @Prop()
  entityId?: string;

  @Prop({ type: Object })
  oldValue?: Record<string, unknown>;

  @Prop({ type: Object })
  newValue?: Record<string, unknown>;

  @Prop()
  reason?: string;

  @Prop()
  ipAddress?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
