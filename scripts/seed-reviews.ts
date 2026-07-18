/**
 * Idempotent review capacity seed.
 * - Preserves existing approved/published reviews
 * - Does NOT publish fabricated patient reviews in production
 * - Fills up to 30 total records using unpublished admin drafts when needed
 *
 * Usage: pnpm exec tsx scripts/seed-reviews.ts
 * Optional: SEED_REVIEW_PUBLISH_FIXTURES=true (non-production only) publishes marked fixtures
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

const isProd =
  process.env.NODE_ENV === "production" ||
  process.env.APP_ENV === "production";
const publishFixtures =
  !isProd && process.env.SEED_REVIEW_PUBLISH_FIXTURES === "true";

/** Clinic-approved tone templates — stored as drafts unless fixtures publishing enabled. */
const DRAFT_TEMPLATES: Array<{
  key: string;
  quoteAr: string;
  quoteEn: string;
  quoteFr: string;
  rating: number;
}> = Array.from({ length: 30 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    key: `seed:review:draft:${n}`,
    quoteAr: `مسودة تقييم إدارية رقم ${n} — محتوى جاهز للمراجعة والاعتماد قبل أي نشر علني. لا يُعرض للزوار إلا بعد موافقة العيادة.`,
    quoteEn: `Admin draft review ${n} — content ready for clinic approval before any public publication.`,
    quoteFr: `Brouillon d’avis admin ${n} — contenu prêt pour validation clinique avant toute publication.`,
    rating: ((i % 5) + 1) as number,
  };
});

async function main() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  const reviews = mongoose.connection.db!.collection("reviews");

  await reviews.createIndex({ sourceKey: 1 }, { unique: true, sparse: true });
  await reviews.createIndex({ isPublished: 1, isApproved: 1, displayOrder: 1 });
  await reviews.createIndex({ status: 1, createdAt: -1 });
  await reviews.createIndex({ isFeatured: 1, rating: -1 });
  await reviews.createIndex({ doctorId: 1 });
  await reviews.createIndex({ publishedAt: -1 });

  const existing = await reviews.countDocuments({ deletedAt: null });
  const published = await reviews.countDocuments({
    deletedAt: null,
    archivedAt: null,
    $or: [
      { isPublished: true, isApproved: true },
      { status: "APPROVED", isPublished: { $ne: false } },
    ],
  });

  let created = 0;
  let skipped = 0;

  for (const [i, t] of DRAFT_TEMPLATES.entries()) {
    const found = await reviews.findOne({ sourceKey: t.key });
    if (found) {
      skipped += 1;
      continue;
    }
    const totalNow = await reviews.countDocuments({ deletedAt: null });
    if (totalNow >= 30 && !publishFixtures) {
      break;
    }
    // Demo samples stay unpublished and marked isSample — never auto-publish as genuine reviews.
    await reviews.insertOne({
      displayName: `زائر تجريبي ${String(i + 1).padStart(2, "0")}`,
      displayNameAr: `زائر تجريبي ${String(i + 1).padStart(2, "0")}`,
      displayNameEn: `Sample visitor ${String(i + 1).padStart(2, "0")}`,
      displayNameFr: `Visiteur exemple ${String(i + 1).padStart(2, "0")}`,
      isAnonymous: true,
      quoteAr: t.quoteAr,
      quoteEn: t.quoteEn,
      quoteFr: t.quoteFr,
      reviewAr: t.quoteAr,
      reviewEn: t.quoteEn,
      reviewFr: t.quoteFr,
      subjectAr: "مسودة تقييم إدارية",
      rating: t.rating,
      reviewDate: new Date(),
      avatarType: i % 2 === 0 ? "male" : "female",
      locale: "ar",
      isVerified: false,
      verified: false,
      consentConfirmed: true,
      isSample: true,
      isApproved: false,
      isPublished: false,
      isFeatured: false,
      displayOrder: i + 1,
      status: "DRAFT",
      moderationStatus: "draft",
      source: "admin_draft_sample",
      sourceKey: t.key,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      archivedAt: null,
    });
    created += 1;
  }

  const afterTotal = await reviews.countDocuments({ deletedAt: null });
  const afterPublished = await reviews.countDocuments({
    deletedAt: null,
    archivedAt: null,
    $or: [
      { isPublished: true, isApproved: true },
      { status: "APPROVED", isPublished: { $ne: false } },
    ],
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        isProd,
        publishFixtures,
        before: { existing, published },
        created,
        skipped,
        after: { total: afterTotal, published: afterPublished },
        note: isProd
          ? "Production: drafts only — fabricated reviews were not published."
          : publishFixtures
            ? "Dev fixtures published (SEED_REVIEW_PUBLISH_FIXTURES=true)."
            : "Draft capacity seeded; approve/publish from admin before public display.",
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
