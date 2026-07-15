#!/usr/bin/env tsx
/**
 * Idempotent Patient ↔ User link repair.
 *
 * - Syncs User.patientProfileId from Patient.userId
 * - Creates a Patient profile for PATIENT users that have none
 * - Attaches unlinked patients ONLY when phone matches and patient.userId is empty
 * - Never reassigns a Patient that already belongs to another User
 * - Does NOT reset MongoDB, delete users, or overwrite passwordHash
 *
 * Usage:
 *   pnpm repair:patient-profiles           # dry-run
 *   pnpm repair:patient-profiles -- --apply
 */
import "dotenv/config";
import mongoose from "mongoose";

const apply = process.argv.includes("--apply");

async function nextPatientNumber(
  patients: mongoose.mongo.Collection,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `P${year}`;
  const latest = await patients
    .find({ patientNumber: { $regex: `^${prefix}` } })
    .sort({ patientNumber: -1 })
    .limit(1)
    .toArray();
  let seq = 1;
  if (latest[0]?.patientNumber) {
    const n = Number(String(latest[0].patientNumber).slice(prefix.length));
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const users = mongoose.connection.collection("users");
  const patients = mongoose.connection.collection("patients");

  const report = {
    mode: apply ? "apply" : "dry-run",
    scannedPatients: 0,
    scannedPatientUsers: 0,
    syncedUserProfileId: 0,
    linkedOrphanPatientByPhone: 0,
    createdProfiles: 0,
    alreadyOk: 0,
    conflicts: [] as string[],
  };

  const patientUsers = await users
    .find({ roleCode: "PATIENT", deletedAt: null })
    .toArray();
  report.scannedPatientUsers = patientUsers.length;

  for (const u of patientUsers) {
    const uid = u._id as mongoose.Types.ObjectId;
    let linked = await patients.findOne({
      userId: uid,
      deletedAt: null,
    });

    if (!linked && u.patientProfileId) {
      const byProfile = await patients.findOne({
        _id: u.patientProfileId,
        deletedAt: null,
      });
      if (byProfile) {
        if (byProfile.userId && String(byProfile.userId) !== String(uid)) {
          report.conflicts.push(
            `user ${uid} patientProfileId points to patient owned by ${byProfile.userId}`,
          );
        } else {
          linked = byProfile;
          if (!byProfile.userId && apply) {
            await patients.updateOne(
              { _id: byProfile._id },
              { $set: { userId: uid } },
            );
          }
        }
      }
    }

    if (!linked) {
      const phone = u.phoneCanonical || u.phone;
      if (phone) {
        const orphan = await patients.findOne({
          phone,
          deletedAt: null,
          $or: [{ userId: null }, { userId: { $exists: false } }],
        });
        if (orphan) {
          report.linkedOrphanPatientByPhone += 1;
          if (apply) {
            await patients.updateOne(
              { _id: orphan._id },
              { $set: { userId: uid } },
            );
            await users.updateOne(
              { _id: uid },
              { $set: { patientProfileId: orphan._id } },
            );
          }
          linked = orphan;
        }
      }
    }

    if (!linked) {
      report.createdProfiles += 1;
      if (apply) {
        const patientNumber = await nextPatientNumber(patients);
        const created = await patients.insertOne({
          patientNumber,
          fullName: u.fullName || "مريض",
          phone: u.phoneCanonical || u.phone || `repair-${String(uid).slice(-8)}`,
          email: u.email,
          userId: uid,
          patientType: "REGULAR",
          createdById: uid,
          hasDiabetes: false,
          hasBloodPressure: false,
          isPregnant: false,
          isSmoker: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await users.updateOne(
          { _id: uid },
          { $set: { patientProfileId: created.insertedId } },
        );
      }
      continue;
    }

    if (!u.patientProfileId || String(u.patientProfileId) !== String(linked._id)) {
      report.syncedUserProfileId += 1;
      if (apply) {
        await users.updateOne(
          { _id: uid },
          { $set: { patientProfileId: linked._id } },
        );
      }
    } else {
      report.alreadyOk += 1;
    }
  }

  const allPatients = await patients.find({ deletedAt: null }).toArray();
  report.scannedPatients = allPatients.length;

  console.log(JSON.stringify(report, null, 2));
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
