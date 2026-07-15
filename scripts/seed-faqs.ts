/**
 * Idempotent FAQ seed. Safe for repeated runs. Never drops collections.
 *
 * Env:
 *   MONGODB_URI (required)
 *   SEED_FAQ_PUBLISH=true|false (default: true outside production)
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import { resolve } from "path";
import { FAQ_SEEDS } from "../apps/api/src/faqs/faq.seed-data";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "apps/api/.env") });

function normalizeFaqQuestion(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }
  if (process.env.SEED_DESTRUCTIVE === "true") {
    console.error("Refusing destructive seed flags for FAQs.");
    process.exit(1);
  }

  const publish =
    process.env.SEED_FAQ_PUBLISH === "true" ||
    (process.env.SEED_FAQ_PUBLISH !== "false" &&
      process.env.NODE_ENV !== "production");

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db");
  const faqs = db.collection("faqs");

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const seed of FAQ_SEEDS) {
    const norms = [
      seed.questionAr,
      seed.questionEn,
      seed.questionFr,
    ].map(normalizeFaqQuestion);

    let existing = await faqs.findOne({ slug: seed.slug });
    if (!existing) {
      existing = await faqs.findOne({
        $or: [
          { normalizedQuestionAr: norms[0] },
          { normalizedQuestionEn: norms[1] },
          { normalizedQuestionFr: norms[2] },
        ],
        archivedAt: null,
      });
    }

    if (!existing) {
      await faqs.insertOne({
        questionAr: seed.questionAr,
        questionEn: seed.questionEn,
        questionFr: seed.questionFr,
        answerAr: seed.answerAr,
        answerEn: seed.answerEn,
        answerFr: seed.answerFr,
        slug: seed.slug,
        category: seed.category,
        keywordsAr: seed.keywordsAr,
        keywordsEn: seed.keywordsEn,
        keywordsFr: seed.keywordsFr,
        relatedSpecialtySlugs: seed.relatedSpecialtySlugs || [],
        relatedServiceSlugs: seed.relatedServiceSlugs || [],
        relatedSpecialtyIds: [],
        relatedServiceIds: [],
        relatedDoctorIds: [],
        isActive: true,
        isPublic: publish,
        isFeatured: Boolean(seed.isFeatured),
        displayOrder: seed.displayOrder,
        publishedAt: publish ? new Date() : null,
        createdBy: null,
        updatedBy: null,
        archivedAt: null,
        normalizedQuestionAr: norms[0],
        normalizedQuestionEn: norms[1],
        normalizedQuestionFr: norms[2],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      created += 1;
      continue;
    }

    const patch: Record<string, unknown> = {};
    if (!existing.questionAr) patch.questionAr = seed.questionAr;
    if (!existing.questionEn) patch.questionEn = seed.questionEn;
    if (!existing.questionFr) patch.questionFr = seed.questionFr;
    if (!existing.answerAr) patch.answerAr = seed.answerAr;
    if (!existing.answerEn) patch.answerEn = seed.answerEn;
    if (!existing.answerFr) patch.answerFr = seed.answerFr;
    if (!existing.slug) patch.slug = seed.slug;
    if (!existing.category) patch.category = seed.category;
    if (!(existing.keywordsAr || []).length) patch.keywordsAr = seed.keywordsAr;
    if (!(existing.keywordsEn || []).length) patch.keywordsEn = seed.keywordsEn;
    if (!(existing.keywordsFr || []).length) patch.keywordsFr = seed.keywordsFr;
    if (existing.displayOrder == null) patch.displayOrder = seed.displayOrder;
    if (existing.isFeatured == null) patch.isFeatured = Boolean(seed.isFeatured);
    patch.normalizedQuestionAr = norms[0];
    patch.normalizedQuestionEn = norms[1];
    patch.normalizedQuestionFr = norms[2];
    if (publish && !existing.isPublic && !existing.updatedBy) {
      patch.isPublic = true;
      patch.isActive = true;
      patch.publishedAt = existing.publishedAt || new Date();
    }
    patch.updatedAt = new Date();

    const keys = Object.keys(patch).filter((k) => !k.startsWith("normalized") && k !== "updatedAt");
    if (!keys.length) {
      skipped += 1;
      continue;
    }
    await faqs.updateOne({ _id: existing._id }, { $set: patch });
    updated += 1;
  }

  await faqs.createIndex({ slug: 1 }, { unique: true });
  await faqs.createIndex({ category: 1, displayOrder: 1 });
  await faqs.createIndex({ isActive: 1, isPublic: 1, archivedAt: 1, displayOrder: 1 });
  await faqs.createIndex({ isFeatured: 1, displayOrder: 1 });
  await faqs.createIndex({ questionAr: 1 });
  await faqs.createIndex({ questionEn: 1 });
  await faqs.createIndex({ questionFr: 1 });

  console.log(
    JSON.stringify(
      {
        ok: true,
        created,
        updated,
        skipped,
        totalSeeds: FAQ_SEEDS.length,
        publish,
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
