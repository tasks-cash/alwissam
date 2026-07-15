/**
 * Idempotent clinic_info contact update — single Mongo key, no duplicates.
 * Usage: pnpm exec tsx scripts/update-clinic-contact.ts
 */
import "dotenv/config";
import mongoose from "mongoose";

const CONTACT = {
  nameAr: "عيادة الوسام لطب الأسنان",
  nameEn: "Al Wissam Dental Clinic",
  nameFr: "Clinique Dentaire El Wissam",
  phone: "0663098208",
  phoneDisplay: "0663 09 82 08",
  phoneInternational: "+213663098208",
  email: "clinic.elwissam@gmail.com",
  publicEmail: "clinic.elwissam@gmail.com",
  address:
    "حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009",
  addressAr:
    "حي الأمير عبد القادر، بجانب ابتدائية زكور فرحات الصغير، الوادي، الجزائر 39009",
  addressEn:
    "Emir Abdelkader District, next to Zakour Farhat Essaghir Primary School, El Oued 39009, Algeria",
  addressFr:
    "Cité Emir Abdelkader, à côté de l’école primaire Zakour Farhat Essaghir, El Oued 39009, Algérie",
  city: "El Oued",
  stateOrWilaya: "El Oued",
  postalCode: "39009",
  countryAr: "الجزائر",
  countryEn: "Algeria",
  countryFr: "Algérie",
  whatsappNumber: "213663098208",
  whatsappEnabled: true,
  facebookUrl: "https://web.facebook.com/Clinic.ElWissam",
  timezone: "Africa/Algiers",
  fridayClosed: true,
  workingHoursAr: "من السبت إلى الخميس\n08:00–17:00\nالجمعة: مغلق",
  workingHoursEn: "Saturday to Thursday\n08:00–17:00\nFriday: Closed",
  workingHoursFr: "Du samedi au jeudi\n08:00–17:00\nVendredi : fermé",
  mapsLink: "https://maps.app.goo.gl/1KtpHq8VWw98enw8A",
  directionsUrl: "https://maps.app.goo.gl/1KtpHq8VWw98enw8A",
} as const;

async function main() {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/alwisam";
  await mongoose.connect(uri);
  const settings = mongoose.connection.db!.collection("clinic_settings");
  const before = await settings.countDocuments({ key: "clinic_info" });
  const existing = await settings.findOne({ key: "clinic_info" });
  const prev =
    existing && typeof existing.value === "object" && existing.value
      ? (existing.value as Record<string, unknown>)
      : {};

  // Canonical directions always applied; preserve optional embed/geo extras.
  const next = {
    ...prev,
    ...CONTACT,
    mapsEmbedUrl: prev.mapsEmbedUrl || prev.mapUrl || "",
    mapsLink: CONTACT.mapsLink,
    mapUrl: prev.mapUrl || prev.mapsEmbedUrl || "",
    directionsUrl: CONTACT.directionsUrl,
    latitude: prev.latitude || "",
    longitude: prev.longitude || "",
    descriptionAr: prev.descriptionAr || "",
    descriptionEn: prev.descriptionEn || "",
    descriptionFr: prev.descriptionFr || "",
    updatedAt: new Date().toISOString(),
    updatedBy: "scripts/update-clinic-contact",
  };

  await settings.updateOne(
    { key: "clinic_info" },
    {
      $set: { key: "clinic_info", value: next, updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  const after = await settings.countDocuments({ key: "clinic_info" });
  if (after !== 1) {
    throw new Error(`Expected exactly 1 clinic_info record, found ${after}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        key: "clinic_info",
        recordsBefore: before,
        recordsAfter: after,
        phoneType: typeof next.phone,
        phone: next.phone,
        phoneDisplay: next.phoneDisplay,
        phoneInternational: next.phoneInternational,
        whatsappNumber: next.whatsappNumber,
        email: next.email,
        facebookUrl: next.facebookUrl,
        addressAr: next.addressAr,
        addressEn: next.addressEn,
        addressFr: next.addressFr,
        nameEn: next.nameEn,
        nameFr: next.nameFr,
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
