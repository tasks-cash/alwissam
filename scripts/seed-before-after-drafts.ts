/**
 * Idempotent Before/After draft capacity seed (target: 10 records).
 * - Preserves existing approved/published cases
 * - Does NOT publish invented clinical results
 * - Fills unpublished Admin drafts only when capacity is below 10
 *
 * Usage: pnpm exec tsx scripts/seed-before-after-drafts.ts
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
  const col = mongoose.connection.db!.collection("before_after_cases");

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
    const sourceKey = `seed:before-after:draft:${n}`;
    const found = await col.findOne({ sourceKey });
    if (found) {
      skipped += 1;
      continue;
    }
    const totalNow = await col.countDocuments({ archivedAt: null });
    if (totalNow >= TARGET) break;

    await col.insertOne({
      sourceKey,
      titleAr: `مسودة حالة قبل/بعد ${n}`,
      titleEn: `Before/After draft case ${n}`,
      titleFr: `Brouillon avant/après ${n}`,
      descriptionAr:
        "مسودة إدارية — لا تُعرض علنًا. استبدل الصور بنتائج سريرية بموافقة المريض قبل النشر.",
      descriptionEn:
        "Admin draft — not public. Replace with consented clinical images before publish.",
      descriptionFr:
        "Brouillon admin — non public. Remplacer par des images cliniques consenties avant publication.",
      beforeImageUrl: "",
      afterImageUrl: "",
      consentConfirmed: false,
      isApproved: false,
      isPublished: false,
      isFeatured: false,
      displayOrder: i,
      source: "admin_draft",
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
        note: "Drafts only — never published as fake clinical outcomes.",
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
