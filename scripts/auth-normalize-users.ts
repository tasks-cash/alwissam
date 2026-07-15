#!/usr/bin/env tsx
/**
 * Idempotent auth identity normalization (dry-run by default).
 *
 * - email → emailNormalized (lowercase)
 * - phone → phoneCanonical (Algeria-safe)
 * - Reports duplicate identities and conflicting multi-profile users
 * - Does NOT overwrite passwordHash
 * - Does NOT delete users
 * - Does NOT invent ADMIN_OWNER
 *
 * Usage:
 *   pnpm auth:normalize-users              # dry-run
 *   pnpm auth:normalize-users -- --apply   # write safe patches
 */
import "dotenv/config";
import mongoose from "mongoose";
import {
  normalizeEmail,
  toCanonicalPhone,
  normalizePhoneDigits,
} from "@alwisam/shared-validation";

const apply = process.argv.includes("--apply");

type UserDoc = {
  _id: mongoose.Types.ObjectId;
  email?: string;
  emailNormalized?: string;
  phone?: string;
  phoneCanonical?: string;
  roleCode?: string;
  passwordHash?: string;
  doctor?: unknown;
  secretary?: unknown;
  deletedAt?: Date | null;
};

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const users = mongoose.connection.collection<UserDoc>("users");
  const patients = mongoose.connection.collection("patients");

  const cursor = users.find({ deletedAt: null });
  const report = {
    scanned: 0,
    wouldPatch: 0,
    patched: 0,
    phoneConflicts: [] as string[],
    emailConflicts: [] as string[],
    missingPatientProfile: [] as string[],
    missingDoctorProfile: [] as string[],
    missingSecretaryProfile: [] as string[],
  };

  const phoneMap = new Map<string, string[]>();
  const emailMap = new Map<string, string[]>();

  const docs = await cursor.toArray();
  for (const u of docs) {
    report.scanned += 1;
    const id = String(u._id);
    const patch: Record<string, unknown> = {};

    if (u.email) {
      const norm = normalizeEmail(u.email);
      if (norm && norm !== u.emailNormalized) {
        patch.emailNormalized = norm;
      }
      const key = norm || u.email.toLowerCase();
      const list = emailMap.get(key) || [];
      list.push(id);
      emailMap.set(key, list);
    }

    if (u.phone || u.phoneCanonical) {
      const raw = u.phoneCanonical || u.phone || "";
      const canonical =
        toCanonicalPhone(raw) || normalizePhoneDigits(raw) || raw;
      if (canonical && canonical !== u.phoneCanonical) {
        patch.phoneCanonical = canonical;
      }
      if (canonical) {
        const list = phoneMap.get(canonical) || [];
        list.push(id);
        phoneMap.set(canonical, list);
      }
    }

    if (Object.keys(patch).length) {
      report.wouldPatch += 1;
      if (apply) {
        await users.updateOne({ _id: u._id }, { $set: patch });
        report.patched += 1;
      }
    }

    if (u.roleCode === "PATIENT") {
      const p = await patients.findOne({
        userId: u._id,
        deletedAt: null,
      });
      if (!p) report.missingPatientProfile.push(id);
    }
    if (
      u.roleCode === "DOCTOR" ||
      u.roleCode === "DOCTOR_GENERAL" ||
      u.roleCode === "DOCTOR_SPECIALIST"
    ) {
      if (!u.doctor) report.missingDoctorProfile.push(id);
    }
    if (u.roleCode === "SECRETARY" && !u.secretary) {
      report.missingSecretaryProfile.push(id);
    }
  }

  for (const [phone, ids] of phoneMap) {
    if (ids.length > 1) {
      report.phoneConflicts.push(`${phone}: ${ids.join(",")}`);
    }
  }
  for (const [email, ids] of emailMap) {
    if (ids.length > 1) {
      report.emailConflicts.push(`${email}: ${ids.join(",")}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        mode: apply ? "apply" : "dry-run",
        ...report,
      },
      null,
      2,
    ),
  );

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
