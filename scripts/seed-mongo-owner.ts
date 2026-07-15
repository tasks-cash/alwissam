/**
 * Idempotent MongoDB owner/admin upsert for NestJS + Mongoose.
 * Credentials from OWNER_EMAIL / OWNER_PASSWORD only (never logged / never hardcoded).
 */
import "dotenv/config";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/** Mirror of active Nest permission set for ADMIN/owner. */
const OWNER_PERMISSIONS = [
  "manage_users",
  "manage_doctors",
  "manage_secretaries",
  "manage_roles",
  "manage_services",
  "manage_schedules",
  "manage_settings",
  "view_audit_logs",
  "view_all_reports",
  "manage_appointments",
  "manage_waiting_room",
  "manage_patients",
  "record_payments",
  "view_payments",
  "edit_diagnosis",
  "edit_prescription",
  "edit_surgery",
  "edit_orthodontics",
  "edit_dental_chart",
  "approve_patient_account",
  "view_own_medical",
  "request_appointment_change",
] as const;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function main() {
  let uri = requireEnv("MONGODB_URI");
  try {
    const u = new URL(uri);
    if (
      u.hostname === "mongodb" ||
      u.port === "27017" ||
      (!u.port && (u.hostname === "127.0.0.1" || u.hostname === "localhost"))
    ) {
      if (!uri.includes("27018")) {
        uri =
          "mongodb://alwisam:alwisam_mongo_change_me@127.0.0.1:27018/alwisam?authSource=admin";
      }
    }
  } catch {
    // keep uri
  }
  const email = requireEnv("OWNER_EMAIL").trim().toLowerCase();
  const password = requireEnv("OWNER_PASSWORD");
  const phone = process.env.OWNER_PHONE?.trim() || null;
  const fullName = process.env.OWNER_FULL_NAME?.trim() || "System Owner";

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection has no database handle");

  const users = db.collection("users");
  const sessions = db.collection("sessions");
  const auditLogs = db.collection("audit_logs");

  await users.createIndex({ email: 1 }, { unique: true, sparse: true });
  await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
  await sessions.createIndex({ userId: 1 });
  await sessions.createIndex({ tokenHash: 1 }, { unique: true });
  await auditLogs.createIndex({ createdAt: -1 });

  const existing = await users.findOne({ email });
  if (phone) {
    const phoneConflict = await users.findOne({
      phone,
      ...(existing ? { _id: { $ne: existing._id } } : {}),
    });
    if (phoneConflict) {
      throw new Error(
        `OWNER_PHONE is already used by another account (${String(phoneConflict._id)}).`,
      );
    }
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const passwordChanged =
    !existing ||
    !(await bcrypt.compare(password, String(existing.passwordHash || "")));

  const doctor = {
    type: "SPECIALIST",
    specialtyAr: "إدارة العيادة",
    specialtyEn: "Clinic administration",
    specialtyFr: "Administration de la clinique",
    bioAr: "حساب مالك النظام — صلاحيات إدارية كاملة",
    bioEn: "System owner account — full administrative permissions",
    bioFr: "Compte propriétaire — permissions administratives complètes",
    colorCode: "#0F9A9A",
    isActive: true,
  };

  const now = new Date();
  let action: "created" | "updated";
  let userId: mongoose.Types.ObjectId;

  const setFields = {
    email,
    fullName,
    phone: phone ?? existing?.phone ?? null,
    passwordHash,
    roleCode: "ADMIN",
    status: "ACTIVE",
    emailVerified: true,
    permissions: [...OWNER_PERMISSIONS],
    locale: existing?.locale || "ar",
    doctor,
    failedLoginCount: 0,
    lockedUntil: null,
    deletedAt: null,
    updatedAt: now,
  };

  if (existing) {
    await users.updateOne({ _id: existing._id }, { $set: setFields });
    userId = existing._id as mongoose.Types.ObjectId;
    action = "updated";
  } else {
    const result = await users.insertOne({
      ...setFields,
      createdAt: now,
    });
    userId = result.insertedId;
    action = "created";
  }

  if (passwordChanged) {
    await sessions.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: now } },
    );
  }

  await auditLogs.insertOne({
    userId,
    roleCode: "ADMIN",
    action: action === "created" ? "OWNER_SEEDED" : "OWNER_UPDATED",
    entityType: "User",
    entityId: String(userId),
    newValue: {
      email,
      roleCode: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
      permissionCount: OWNER_PERMISSIONS.length,
      passwordRotated: passwordChanged,
    },
    reason: "pnpm seed:owner",
    createdAt: now,
  });

  const verify = await users.findOne({ email });
  if (!verify) {
    throw new Error("Owner user missing after upsert");
  }
  const duplicateCount = await users.countDocuments({ email });
  if (duplicateCount !== 1) {
    throw new Error(
      `Expected exactly one user for ${email}, found ${duplicateCount}`,
    );
  }
  if (!verify.passwordHash || typeof verify.passwordHash !== "string") {
    throw new Error("Password was not hashed correctly");
  }
  if (!String(verify.passwordHash).startsWith("$2")) {
    throw new Error("Password hash does not look like bcrypt");
  }
  if (verify.passwordHash === password) {
    throw new Error("Password stored in plaintext");
  }

  console.log(
    JSON.stringify(
      {
        action,
        userId: String(userId),
        email: verify.email,
        role: verify.roleCode,
        status: verify.status,
        emailVerified: verify.emailVerified === true,
        permissionCount: Array.isArray(verify.permissions)
          ? verify.permissions.length
          : 0,
        passwordRotated: passwordChanged,
        sessionsRevokedOnPasswordChange: passwordChanged,
        dashboardPath: "/doctor/specialist/dashboard",
        store: "mongodb",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
