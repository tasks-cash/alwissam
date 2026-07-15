/**
 * Idempotent upsert of the two real clinic-approved doctors (Mongo / Nest).
 * Does NOT invent additional public doctors to reach a count of five.
 *
 * Usage: pnpm exec tsx scripts/ensure-clinic-doctors.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import * as bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

type SeedDoctor = {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  roleCode: "ADMIN" | "DOCTOR_SPECIALIST" | "DOCTOR_GENERAL";
  doctor: Record<string, unknown>;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function resolveMongoUri(): string {
  let uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/alwisam";
  try {
    const u = new URL(uri);
    if (
      u.hostname === "mongodb" ||
      u.port === "27017" ||
      (!u.port && (u.hostname === "127.0.0.1" || u.hostname === "localhost"))
    ) {
      if (!uri.includes("27018")) {
        uri =
          "mongodb://alwisam:alwisam_mongo_change_me@127.0.0.1:27018/alwisam?authSource=admin";
      }
    }
  } catch {
    // keep uri
  }
  return uri;
}

const WEEKLY = [
  { dayOfWeek: "SATURDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "SUNDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "MONDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "TUESDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "WEDNESDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "THURSDAY", startTime: "08:00", endTime: "17:00", isActive: true },
  { dayOfWeek: "FRIDAY", startTime: "08:00", endTime: "17:00", isActive: false },
];

async function upsertDoctor(users: mongoose.Collection, seed: SeedDoctor) {
  const existing = await users.findOne({
    email: seed.email.toLowerCase(),
    deletedAt: null,
  });
  const passwordHash = await bcrypt.hash(seed.password, BCRYPT_ROUNDS);
  const now = new Date();
  const base = {
    email: seed.email.toLowerCase(),
    phone: seed.phone,
    fullName: seed.fullName,
    passwordHash,
    roleCode: seed.roleCode,
    status: "ACTIVE",
    emailVerified: true,
    doctor: seed.doctor,
    updatedAt: now,
  };

  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      {
        $set: {
          fullName: seed.fullName,
          phone: seed.phone,
          roleCode: seed.roleCode,
          status: "ACTIVE",
          doctor: {
            ...(typeof existing.doctor === "object" && existing.doctor
              ? existing.doctor
              : {}),
            ...seed.doctor,
          },
          updatedAt: now,
        },
      },
    );
    return { action: "updated", id: String(existing._id), fullName: seed.fullName };
  }

  const result = await users.insertOne({
    ...base,
    permissions: [],
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    deletedAt: null,
    locale: "ar",
    createdAt: now,
  });
  return {
    action: "created",
    id: String(result.insertedId),
    fullName: seed.fullName,
  };
}

async function main() {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
  const users = mongoose.connection.db!.collection("users");

  await users.createIndex({ "doctor.slug": 1 }, { sparse: true });
  await users.createIndex({ "doctor.isActive": 1 });
  await users.createIndex({ "doctor.isPublic": 1 });
  await users.createIndex({ "doctor.isBookable": 1 });
  await users.createIndex({ "doctor.displayOrder": 1 });

  const seeds: SeedDoctor[] = [
    {
      email: requireEnv("SEED_DOCTOR_SPECIALIST_EMAIL"),
      phone: requireEnv("SEED_DOCTOR_SPECIALIST_PHONE"),
      password: requireEnv("SEED_DOCTOR_SPECIALIST_PASSWORD"),
      fullName: "الدكتور منانة فؤاد",
      roleCode: "DOCTOR_SPECIALIST",
      doctor: {
        type: "SPECIALIST",
        slug: "manana-fouad",
        specialtyAr: "تقويم الأسنان · التركيبات · الجراحة",
        specialtyEn: "Orthodontics · Prosthetics · Surgery",
        specialtyFr: "Orthodontie · Prothèses · Chirurgie",
        professionalTitleAr: "طبيبة أسنان أخصائية",
        professionalTitleEn: "Specialist Dentist",
        professionalTitleFr: "Chirurgien-dentiste spécialiste",
        bioAr:
          "صاحبة العيادة — تقويم الأسنان والتركيبات والجراحة والحالات متعددة الحصص.",
        bioEn:
          "Clinic principal — orthodontics, prosthetics, surgery, and multi-visit care.",
        bioFr:
          "Responsable de la clinique — orthodontie, prothèses, chirurgie et soins en plusieurs séances.",
        colorCode: "#0F9A9A",
        isActive: true,
        isPublic: true,
        isBookable: true,
        isFeatured: true,
        displayOrder: 1,
        languages: ["ar", "fr"],
        appointmentDurationMinutes: 30,
        workingHours: WEEKLY,
        weeklySchedule: WEEKLY,
        availabilityNoteAr: "السبت–الخميس 08:00–17:00",
        availabilityNoteEn: "Sat–Thu 08:00–17:00",
        availabilityNoteFr: "Sam–jeu 08:00–17:00",
      },
    },
    {
      email: requireEnv("SEED_DOCTOR_GENERAL_EMAIL"),
      phone: requireEnv("SEED_DOCTOR_GENERAL_PHONE"),
      password: requireEnv("SEED_DOCTOR_GENERAL_PASSWORD"),
      fullName: "الدكتور قعري أسامة",
      roleCode: "DOCTOR_GENERAL",
      doctor: {
        type: "GENERAL",
        slug: "oukari-oussama",
        specialtyAr: "الحالات الاستعجالية · العلاج العام",
        specialtyEn: "Emergency care · General dentistry",
        specialtyFr: "Urgences · Soins dentaires généraux",
        professionalTitleAr: "طبيب أسنان عام",
        professionalTitleEn: "General Dentist",
        professionalTitleFr: "Chirurgien-dentiste généraliste",
        bioAr: "طبيب عام للحالات الاستعجالية والعلاج الروتيني والخلع البسيط.",
        bioEn: "General dentist for urgent cases, routine care, and simple extractions.",
        bioFr:
          "Dentiste généraliste pour urgences, soins de routine et extractions simples.",
        colorCode: "#176B87",
        isActive: true,
        isPublic: true,
        isBookable: true,
        isFeatured: true,
        displayOrder: 2,
        languages: ["ar", "fr"],
        appointmentDurationMinutes: 30,
        workingHours: WEEKLY,
        weeklySchedule: WEEKLY,
        availabilityNoteAr: "السبت–الخميس 08:00–17:00",
        availabilityNoteEn: "Sat–Thu 08:00–17:00",
        availabilityNoteFr: "Sam–jeu 08:00–17:00",
      },
    },
  ];

  const results = [];
  for (const seed of seeds) {
    results.push(await upsertDoctor(users, seed));
  }

  // Hide known placeholder doctor profiles from the public directory.
  await users.updateMany(
    {
      deletedAt: null,
      $or: [
        { fullName: /طبيب اختبار|Test Doctor|مالك النظام|System Owner/i },
        { "doctor.specialtyAr": /إدارة العيادة/i },
      ],
    },
    {
      $set: {
        "doctor.isPublic": false,
        "doctor.isBookable": false,
        updatedAt: new Date(),
      },
    },
  );

  const publicCount = await users.countDocuments({
    deletedAt: null,
    status: "ACTIVE",
    "doctor.isActive": { $ne: false },
    "doctor.isPublic": true,
    "doctor.isBookable": { $ne: false },
    roleCode: { $in: ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST", "ADMIN"] },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        upserted: results,
        approvedPublicBookableCount: publicCount,
        missingToReachFive: Math.max(0, 5 - publicCount),
        note:
          "Only two real clinic-approved doctor identities exist in project data. Do not invent three more public doctors.",
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
