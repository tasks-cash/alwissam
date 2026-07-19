/**
 * Idempotent review draft seed (up to 30 sample drafts).
 * - isSample: true, status: draft, never auto-published
 * - Dry-run: SEED_DRY_RUN=true
 * - Preserves Admin-edited rows (skips existing sourceKey)
 *
 * Usage: pnpm exec tsx scripts/seed-reviews.ts
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

const dryRun = process.env.SEED_DRY_RUN === "true";

const NAMES = [
  "محمد",
  "فاطمة",
  "عبد الرحمن",
  "خديجة",
  "يوسف",
  "أمينة",
  "إبراهيم",
  "مريم",
  "عمر",
  "سارة",
  "حسن",
  "نورة",
  "علي",
  "هدى",
  "رياض",
  "سمية",
  "كمال",
  "ليلى",
  "ناصر",
  "إيمان",
  "سليم",
  "رقية",
  "بلال",
  "حنان",
  "وليد",
  "أسماء",
  "طارق",
  "زينب",
  "أمين",
  "دعاء",
];

const SUBJECTS = [
  "تجربة الحجز",
  "استقبال العيادة",
  "نظافة المكان",
  "شرح العلاج",
  "متابعة بعد الزيارة",
  "سهولة الموعد",
  "تعامل الطاقم",
  "وضوح التعليمات",
];

const QUOTES = [
  "الحجز كان واضح والحمد لله الاستقبال منظم، حسّيت بالراحة من أول ما دخلت.",
  "الدكتور شرح لي الخطوة بهدوء وفهمت وش راح يصير قبل ما نبداو.",
  "العيادة نظيفة والتنظيم مليح، ما طوّلتش برّا بزاف.",
  "السكيرتيرة كانت متعاونة وساعدتني نفهم المواعيد كيما لازم.",
  "ما نقدرش نحكم على نتيجة علاجية من زيارة وحدة، لكن المعاملة كانت محترمة.",
  "جاوني للمواعيد بالتوقيت تقريبًا، وهذا سهّل عليّا اليوم.",
  "اللغة واضحة والتعليمات بعد الزيارة مكتوبة بشكل مفهوم.",
  "المكان مرتب والطاقم يحترم خصوصية المريض.",
  "كنت متردد في البداية، لكن الاستقبال طمّنني وخفّف عليّا التوتر.",
  "خدمة الحجز عبر الموقع سهلة وما احتجتش ندور برّا على معلومة.",
];

type Draft = {
  key: string;
  displayName: string;
  subjectAr: string;
  quoteAr: string;
  rating: number;
  avatarType: "male" | "female" | "neutral";
};

const DRAFTS: Draft[] = Array.from({ length: 30 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  const name = NAMES[i % NAMES.length];
  const avatarType: Draft["avatarType"] =
    i % 3 === 0 ? "male" : i % 3 === 1 ? "female" : "neutral";
  return {
    key: `seed:review:draft:${n}`,
    displayName: `${name}`,
    subjectAr: SUBJECTS[i % SUBJECTS.length],
    quoteAr: QUOTES[i % QUOTES.length],
    rating: ([5, 5, 4, 5, 4, 3, 5, 4, 5, 4] as const)[i % 10],
    avatarType,
  };
});

async function main() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  const reviews = mongoose.connection.db!.collection("reviews");

  await reviews.createIndex({ sourceKey: 1 }, { unique: true, sparse: true });
  await reviews.createIndex({ isPublished: 1, isApproved: 1, displayOrder: 1 });
  await reviews.createIndex({ isSample: 1, status: 1 });

  let created = 0;
  let skipped = 0;
  let repairedSafetyFlags = 0;

  for (const [i, t] of DRAFTS.entries()) {
    const found = await reviews.findOne({ sourceKey: t.key });
    if (found) {
      if (
        found.isSample !== true ||
        found.isPublished === true ||
        found.isApproved === true
      ) {
        repairedSafetyFlags += 1;
        if (!dryRun) {
          await reviews.updateOne(
            { _id: found._id },
            {
              $set: {
                isSample: true,
                isApproved: false,
                isPublished: false,
                isVerified: false,
                verified: false,
                status: "DRAFT",
                moderationStatus: "draft",
                publishedAt: null,
                updatedAt: new Date(),
              },
            },
          );
        }
      }
      skipped += 1;
      continue;
    }
    if (dryRun) {
      created += 1;
      continue;
    }
    await reviews.insertOne({
      displayName: t.displayName,
      displayNameAr: t.displayName,
      displayNameEn: `Sample visitor ${String(i + 1).padStart(2, "0")}`,
      displayNameFr: `Visiteur exemple ${String(i + 1).padStart(2, "0")}`,
      isAnonymous: true,
      quoteAr: t.quoteAr,
      quoteEn:
        "Admin sample draft — not a verified patient testimonial. Requires clinic approval before any public display.",
      quoteFr:
        "Brouillon d’exemple admin — pas un avis patient vérifié. Validation clinique requise avant publication.",
      reviewAr: t.quoteAr,
      subjectAr: t.subjectAr,
      subjectEn: "Admin sample draft",
      subjectFr: "Brouillon d’exemple",
      rating: t.rating,
      reviewDate: new Date(),
      avatarType: t.avatarType,
      avatarMediaId: `/images/avatars/${t.avatarType}.svg`,
      patientImage: `/images/avatars/${t.avatarType}.svg`,
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

  const sampleDrafts = await reviews.countDocuments({
    deletedAt: null,
    isSample: true,
    isPublished: { $ne: true },
  });
  const published = await reviews.countDocuments({
    deletedAt: null,
    archivedAt: null,
    isPublished: true,
    isApproved: true,
    isSample: { $ne: true },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        dryRun,
        created,
        skipped,
        repairedSafetyFlags,
        sampleDrafts,
        publishedGenuine: published,
        note: "Sample drafts stay unpublished. Admin must explicitly approve/publish.",
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
