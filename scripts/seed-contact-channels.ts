/**
 * Idempotently enables the clinic phone and WhatsApp contact channels.
 *
 * Usage:
 *   pnpm seed:contact-channels
 *   SEED_DRY_RUN=true pnpm seed:contact-channels
 */
import "dotenv/config";
import mongoose from "mongoose";

const dryRun = process.env.SEED_DRY_RUN === "true";

const channels = [
  {
    type: "phone",
    value: "0663 09 82 08",
    labelAr: "اتصل بنا",
    labelEn: "Call us",
    labelFr: "Appelez-nous",
    publicUrl: "tel:+213663098208",
    icon: "phone",
    isEnabled: true,
    isPrimary: false,
    displayOrder: 2,
    placement: [
      "global_floating",
      "homepage",
      "contact_page",
      "footer",
      "patient_help",
      "booking_page",
    ],
  },
  {
    type: "whatsapp",
    value: "213663098208",
    labelAr: "تواصل معنا عبر واتساب",
    labelEn: "Contact us on WhatsApp",
    labelFr: "Contactez-nous sur WhatsApp",
    publicUrl: "https://wa.me/213663098208",
    icon: "whatsapp",
    isEnabled: true,
    isPrimary: true,
    displayOrder: 1,
    placement: [
      "global_floating",
      "homepage",
      "contact_page",
      "footer",
      "patient_help",
      "booking_page",
    ],
  },
] as const;

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required.");

  await mongoose.connect(uri);
  const collection = mongoose.connection.db!.collection("contact_channels");

  if (dryRun) {
    const existing = await collection
      .find({
        $or: channels.map((channel) => ({
          type: channel.type,
          value: channel.value,
        })),
      })
      .project({ _id: 1, type: 1, value: 1 })
      .toArray();
    console.log(
      JSON.stringify({
        ok: true,
        dryRun: true,
        wouldUpsert: channels.length,
        existing: existing.length,
      }),
    );
    return;
  }

  await collection.createIndex(
    { type: 1, value: 1 },
    {
      unique: true,
      partialFilterExpression: { archivedAt: null },
    },
  );

  for (const channel of channels) {
    await collection.updateOne(
      { type: channel.type, value: channel.value },
      {
        $set: {
          ...channel,
          archivedAt: null,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }

  await collection.updateMany(
    {
      type: { $ne: "whatsapp" },
      isPrimary: true,
      archivedAt: null,
    },
    { $set: { isPrimary: false, updatedAt: new Date() } },
  );

  const count = await collection.countDocuments({
    type: { $in: ["phone", "whatsapp"] },
    archivedAt: null,
    isEnabled: true,
  });
  console.log(JSON.stringify({ ok: true, dryRun: false, activeCount: count }));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
