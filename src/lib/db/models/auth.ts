import { Schema, models, model, type InferSchemaType, type Model } from "mongoose";
import type { AccountStatus, DoctorType, RoleCode } from "@/lib/auth/roles";

const DoctorSubSchema = new Schema(
  {
    type: { type: String, enum: ["GENERAL", "SPECIALIST"], required: true },
    specialtyAr: { type: String, default: "" },
    bioAr: { type: String },
    colorCode: { type: String, default: "#0F9A9A" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, sparse: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    roleCode: {
      type: String,
      enum: ["ADMIN", "SECRETARY", "DOCTOR_GENERAL", "DOCTOR_SPECIALIST", "PATIENT"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "INACTIVE", "LOCKED"],
      default: "ACTIVE",
    },
    doctor: { type: DoctorSubSchema, default: undefined },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
    locale: { type: String, default: "ar" },
    legacyId: { type: String, sparse: true, unique: true },
    migratedAt: { type: Date },
    migrationVersion: { type: String },
  },
  { timestamps: true, collection: "users" },
);

UserSchema.index({ roleCode: 1, status: 1 });

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    csrfToken: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    rememberMe: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: { type: Date, default: null },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "sessions" },
);

const LoginHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    identifier: { type: String, required: true },
    success: { type: Boolean, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    reason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "login_histories" },
);

const AuditLogSchema = new Schema(
  {
    userId: { type: String },
    roleCode: { type: String },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    oldValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    reason: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "audit_logs" },
);

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: Schema.Types.ObjectId;
  roleCode: RoleCode;
  status: AccountStatus;
  doctor?: {
    type: DoctorType;
    specialtyAr?: string;
    bioAr?: string;
    colorCode?: string;
    isActive?: boolean;
  } | null;
};

export type SessionDoc = InferSchemaType<typeof SessionSchema> & {
  _id: Schema.Types.ObjectId;
};

export const UserModel: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);

export const SessionModel: Model<SessionDoc> =
  (models.Session as Model<SessionDoc>) ||
  model<SessionDoc>("Session", SessionSchema);

export const LoginHistoryModel =
  models.LoginHistory || model("LoginHistory", LoginHistorySchema);

export const AuditLogModel =
  models.AuditLog || model("AuditLog", AuditLogSchema);
