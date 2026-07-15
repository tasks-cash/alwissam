#!/usr/bin/env tsx
/**
 * One-time Admin/Owner bootstrap.
 * Refuses to run when an owner already exists.
 *
 * Usage:
 *   BOOTSTRAP_OWNER_EMAIL=... BOOTSTRAP_OWNER_PHONE=... BOOTSTRAP_OWNER_PASSWORD=... \\
 *   BOOTSTRAP_OWNER_NAME="..." pnpm auth:bootstrap-owner
 */
import "dotenv/config";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";
import {
  normalizeEmail,
  toCanonicalPhone,
  normalizePhoneDigits,
} from "@alwisam/shared-validation";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  const email = process.env.BOOTSTRAP_OWNER_EMAIL
    ? normalizeEmail(process.env.BOOTSTRAP_OWNER_EMAIL)
    : undefined;
  const phoneRaw = process.env.BOOTSTRAP_OWNER_PHONE || "";
  const phone =
    toCanonicalPhone(phoneRaw) || normalizePhoneDigits(phoneRaw) || "";
  const password = process.env.BOOTSTRAP_OWNER_PASSWORD || "";
  const fullName = (process.env.BOOTSTRAP_OWNER_NAME || "").trim();

  if ((!email && !phone) || password.length < 8 || !fullName) {
    console.error(
      "Require BOOTSTRAP_OWNER_NAME, BOOTSTRAP_OWNER_PASSWORD (>=8), and email and/or phone.",
    );
    process.exit(1);
  }

  await mongoose.connect(uri);
  const users = mongoose.connection.collection("users");

  const existingOwner = await users.findOne({
    deletedAt: null,
    roleCode: { $in: ["ADMIN", "ADMIN_OWNER", "OWNER", "SUPER_ADMIN"] },
  });
  if (existingOwner) {
    console.error("Owner already exists — bootstrap disabled.");
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const doc = {
    fullName,
    email,
    emailNormalized: email,
    phone: phone || undefined,
    phoneCanonical: phone || undefined,
    passwordHash,
    roleCode: "ADMIN_OWNER",
    status: "ACTIVE",
    emailVerified: !!email,
    permissions: [],
    locale: "ar",
    doctor: {
      type: "SPECIALIST",
      specialtyAr: "صاحبة العيادة",
      isActive: true,
      isPublic: true,
      isBookable: true,
    },
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await users.insertOne(doc);
  await mongoose.connection.collection("audit_logs").insertOne({
    userId: result.insertedId,
    roleCode: "ADMIN_OWNER",
    action: "OWNER_BOOTSTRAP",
    entityType: "User",
    entityId: String(result.insertedId),
    createdAt: new Date(),
  });

  console.log("Owner created:", String(result.insertedId));
  console.log("Email:", email || "(none)");
  console.log("Phone:", phone || "(none)");
  // Never print plaintext password.
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
