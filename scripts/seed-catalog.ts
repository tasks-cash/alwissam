/**
 * Idempotent specialty + dental service catalog seed.
 * Safe for repeated runs. Never drops collections.
 *
 * Env:
 *   MONGODB_URI (required)
 *   SEED_CATALOG_PUBLISH=true|false (default: true outside production)
 */
import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";
import { resolve } from "path";
import {
  SERVICE_SEEDS,
  SPECIALTY_SEEDS,
} from "../apps/api/src/catalog/catalog.seed-data";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), "apps/api/.env") });

function normalizeName(value: string): string {
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
    console.error("Refusing destructive seed flags for catalog.");
    process.exit(1);
  }

  const publish =
    process.env.SEED_CATALOG_PUBLISH === "true" ||
    (process.env.SEED_CATALOG_PUBLISH !== "false" &&
      process.env.NODE_ENV !== "production");

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  if (!db) throw new Error("No db");

  const specialties = db.collection("specialties");
  const services = db.collection("dental_services");

  const specialtyIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  let specialtiesUpserted = 0;
  let servicesUpserted = 0;

  for (const seed of SPECIALTY_SEEDS) {
    const keys = [seed.slug, ...(seed.aliases || [])];
    let existing = await specialties.findOne({
      $or: [{ slug: { $in: keys } }, { aliases: { $in: keys } }],
    });
    if (!existing) {
      const all = await specialties.find({ archivedAt: null }).limit(200).toArray();
      const norms = [seed.nameAr, seed.nameEn, seed.nameFr].map(normalizeName);
      existing =
        all.find((s) =>
          [s.nameAr, s.nameEn, s.nameFr]
            .filter(Boolean)
            .map((n: string) => normalizeName(n))
            .some((n: string) => norms.includes(n)),
        ) || null;
    }

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (!existing.nameAr) patch.nameAr = seed.nameAr;
      if (!existing.nameEn) patch.nameEn = seed.nameEn;
      if (!existing.nameFr) patch.nameFr = seed.nameFr;
      if (!existing.descriptionAr) patch.descriptionAr = seed.descriptionAr;
      if (!existing.descriptionEn) patch.descriptionEn = seed.descriptionEn;
      if (!existing.descriptionFr) patch.descriptionFr = seed.descriptionFr;
      if (!existing.icon) patch.icon = seed.icon;
      const aliases = new Set([
        ...((existing.aliases as string[]) || []),
        ...(seed.aliases || []),
        seed.slug,
      ]);
      patch.aliases = [...aliases];
      if (existing.slug !== seed.slug) {
        const clash = await specialties.findOne({
          slug: seed.slug,
          _id: { $ne: existing._id },
        });
        if (!clash) patch.slug = seed.slug;
      }
      if (Object.keys(patch).length) {
        await specialties.updateOne({ _id: existing._id }, { $set: patch });
        specialtiesUpserted += 1;
      }
      specialtyIdBySlug.set(seed.slug, existing._id as mongoose.Types.ObjectId);
    } else {
      const _id = new mongoose.Types.ObjectId();
      await specialties.insertOne({
        _id,
        ...seed,
        aliases: [...(seed.aliases || []), seed.slug],
        isActive: true,
        isPublic: publish,
        doctorIds: [],
        image: "",
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      specialtyIdBySlug.set(seed.slug, _id);
      specialtiesUpserted += 1;
    }
  }

  const allSpecs = await specialties.find({ archivedAt: null }).toArray();
  for (const s of allSpecs) {
    specialtyIdBySlug.set(s.slug, s._id as mongoose.Types.ObjectId);
    for (const a of (s.aliases as string[]) || []) {
      specialtyIdBySlug.set(a, s._id as mongoose.Types.ObjectId);
    }
  }

  for (const seed of SERVICE_SEEDS) {
    const specialtyIds = seed.specialtySlugs
      .map((slug) => specialtyIdBySlug.get(slug))
      .filter(Boolean);
    const keys = [seed.slug, ...(seed.aliases || [])];
    let existing = await services.findOne({
      $or: [{ slug: { $in: keys } }, { aliases: { $in: keys } }],
    });
    if (!existing) {
      const all = await services.find({ archivedAt: null }).limit(400).toArray();
      const norms = [seed.nameAr, seed.nameEn, seed.nameFr].map(normalizeName);
      existing =
        all.find((s) =>
          [s.nameAr, s.nameEn, s.nameFr]
            .filter(Boolean)
            .map((n: string) => normalizeName(n))
            .some((n: string) => norms.includes(n)),
        ) || null;
    }

    if (existing) {
      const patch: Record<string, unknown> = {};
      if (!existing.nameAr) patch.nameAr = seed.nameAr;
      if (!existing.nameEn) patch.nameEn = seed.nameEn;
      if (!existing.nameFr) patch.nameFr = seed.nameFr;
      if (!existing.descriptionAr) patch.descriptionAr = seed.descriptionAr;
      if (!existing.descriptionEn) patch.descriptionEn = seed.descriptionEn;
      if (!existing.descriptionFr) patch.descriptionFr = seed.descriptionFr;
      if (!existing.shortDescriptionAr)
        patch.shortDescriptionAr = seed.shortDescriptionAr;
      if (!existing.shortDescriptionEn)
        patch.shortDescriptionEn = seed.shortDescriptionEn;
      if (!existing.shortDescriptionFr)
        patch.shortDescriptionFr = seed.shortDescriptionFr;
      if (!existing.icon) patch.icon = seed.icon;
      if (!existing.specialtyIds?.length && specialtyIds.length) {
        patch.specialtyIds = specialtyIds;
      }
      const aliases = new Set([
        ...((existing.aliases as string[]) || []),
        ...(seed.aliases || []),
        seed.slug,
      ]);
      patch.aliases = [...aliases];
      if (existing.slug !== seed.slug) {
        const clash = await services.findOne({
          slug: seed.slug,
          _id: { $ne: existing._id },
        });
        if (!clash) patch.slug = seed.slug;
      }
      if (Object.keys(patch).length) {
        await services.updateOne({ _id: existing._id }, { $set: patch });
        servicesUpserted += 1;
      }
    } else {
      await services.insertOne({
        ...seed,
        specialtyIds,
        doctorIds: [],
        aliases: [...(seed.aliases || []), seed.slug],
        isActive: true,
        isPublic: publish,
        requiresConsultation: seed.requiresConsultation === true,
        durationMinutes: null,
        priceFrom: null,
        priceApproved: false,
        currency: "DZD",
        image: "",
        archivedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      servicesUpserted += 1;
    }
  }

  const dentistryDup = await specialties.countDocuments({
    archivedAt: null,
    $or: [
      { slug: { $in: ["general-dentistry", "dentistry", "general"] } },
      { aliases: { $in: ["dentistry", "general-dentistry"] } },
      { nameEn: /general dentistry/i },
    ],
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        publish,
        specialtiesUpserted,
        servicesUpserted,
        specialtyCount: await specialties.countDocuments({ archivedAt: null }),
        serviceCount: await services.countDocuments({ archivedAt: null }),
        dentistryRelatedCount: dentistryDup,
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
