/**
 * Idempotent Patient Experience draft capacity seed (target: 10 records).
 * - Preserves existing approved/published experiences
 * - Does NOT publish invented patient identities or clinical claims
 * - Fills unpublished Admin drafts when capacity is below 10
 *
 * Usage: pnpm exec tsx scripts/seed-patient-experience-drafts.ts
 */
import "dotenv/config";
import mongoose from "mongoose";

function resolveMongoUri(): string {
  let uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/alwisam";
  try {
    const u = new URL(uri);
    if (
      u.hostname === "mongodb" ||
      (!u.port && (u.hostname === "127.0.0.1" || u.hostname === "localhost"))
    ) {
      if (!uri.includes("27018")) {
        uri =
          "mongodb://alwisam:alwisam_mongo_change_me@127.0.0.1:27018/alwisam?authSource=admin";
      }
    }
  } catch {
    // keep
  }
  return uri;
}

const TARGET = 10;

async function main() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  const col = mongoose.connection.db!.collection("patient_experiences");

  const existing = await col.countDocuments({ archivedAt: null });
  const published = await col.countDocuments({
    archivedAt: null,
    isPublished: true,
    isApproved: true,
    consentConfirmed: true,
  });

  let created = 0;
  let skipped = 0;

  for (let i = 1; i <= TARGET; i += 1) {
    const n = String(i).padStart(2, "0");
    const sourceKey = `seed:experience:draft:${n}`;
    const found = await col.findOne({ sourceKey });
    if (found) {
      skipped += 1;
      continue;
    }
    const totalNow = await col.countDocuments({ archivedAt: null });
    if (totalNow >= TARGET) break;

    await col.insertOne({
      sourceKey,
      displayNameAr: "مسودة مجهولة",
      displayNameEn: "Anonymous draft",
      displayNameFr: "Brouillon anonyme",
      isAnonymous: true,
      anonymousLabelAr: "مريض من العيادة",
      anonymousLabelEn: "Verified clinic patient",
      anonymousLabelFr: "Patient de la clinique",
      subjectAr: `مسودة تجربة ${n}`,
      subjectEn: `Draft experience ${n}`,
      subjectFr: `Brouillon expérience ${n}`,
      treatmentTitleAr: `مسودة تجربة ${n}`,
      reviewAr: `مسودة إدارية رقم ${n} — جاهزة للمراجعة والاعتماد. لا تُعرض علنًا قبل موافقة العيادة.`,
      reviewEn: `Admin draft experience ${n} — ready for clinic review. Not public until approved.`,
      reviewFr: `Brouillon d’expérience admin ${n} — non public tant que non validé.`,
      rating: ((i % 5) + 1) as number,
      moderationStatus: "pending_review",
      isVerifiedPatient: false,
      isFeatured: false,
      isApproved: false,
      isPublished: false,
      displayOrder: i,
      consentConfirmed: false,
      source: "admin_draft",
      reviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    });
    created += 1;
  }

  const afterTotal = await col.countDocuments({ archivedAt: null });
  const afterPublished = await col.countDocuments({
    archivedAt: null,
    isPublished: true,
    isApproved: true,
    consentConfirmed: true,
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        before: { existing, published },
        created,
        skipped,
        after: { total: afterTotal, published: afterPublished },
        note: "Drafts only — fabricated experiences were not published.",
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
