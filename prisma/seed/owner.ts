import "dotenv/config";
import {
  DoctorType,
  PrismaClient,
  RoleCode,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "../../src/lib/auth/password";
import { PERMISSIONS } from "../../src/lib/auth/permissions";

/**
 * Idempotent production owner/admin upsert.
 * Credentials come from OWNER_EMAIL / OWNER_PASSWORD (never logged).
 * Highest admin role in this schema: RoleCode.ADMIN (no OWNER/SUPER_ADMIN enum).
 * Clinic-owner parity: ADMIN + specialist doctor profile (matches existing owner model).
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function upsertRole(code: RoleCode, nameAr: string) {
  return prisma.role.upsert({
    where: { code },
    update: { nameAr },
    create: { code, nameAr },
  });
}

async function upsertPermission(code: string, nameAr: string, module: string) {
  return prisma.permission.upsert({
    where: { code },
    update: { nameAr, module },
    create: { code, nameAr, module },
  });
}

async function ensureAllPermissionsOnAdmin(adminRoleId: string) {
  for (const [key, code] of Object.entries(PERMISSIONS)) {
    await upsertPermission(code, key, code.split("_")[0] || "general");
  }

  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRoleId,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: adminRoleId, permissionId: permission.id },
    });
  }
  return allPermissions.length;
}

async function main() {
  const email = normalizeEmail(requireEnv("OWNER_EMAIL"));
  const password = requireEnv("OWNER_PASSWORD");
  const phone =
    process.env.OWNER_PHONE?.trim() ||
    process.env.SEED_OWNER_PHONE?.trim() ||
    null;
  const fullName =
    process.env.OWNER_FULL_NAME?.trim() || "مالك النظام";

  const adminRole = await upsertRole(RoleCode.ADMIN, "مدير النظام");
  const permissionCount = await ensureAllPermissionsOnAdmin(adminRole.id);

  const passwordHash = await hashPassword(password);

  const existingByEmail = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    include: { doctor: true },
  });

  if (phone) {
    const phoneConflict = await prisma.user.findFirst({
      where: {
        phone,
        ...(existingByEmail ? { id: { not: existingByEmail.id } } : {}),
      },
      select: { id: true, email: true },
    });
    if (phoneConflict) {
      throw new Error(
        `OWNER_PHONE is already used by another account (${phoneConflict.email ?? phoneConflict.id}).`,
      );
    }
  }

  let userId: string;
  let created = false;

  if (existingByEmail) {
    const updated = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        email,
        fullName,
        phone: phone ?? existingByEmail.phone,
        passwordHash,
        roleId: adminRole.id,
        status: "ACTIVE",
        deletedAt: null,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    });
    userId = updated.id;
  } else {
    const createdUser = await prisma.user.create({
      data: {
        email,
        fullName,
        phone: phone ?? undefined,
        passwordHash,
        roleId: adminRole.id,
        status: "ACTIVE",
      },
    });
    userId = createdUser.id;
    created = true;
  }

  // Match clinic-owner architecture: ADMIN + specialist doctor profile
  await prisma.doctor.upsert({
    where: { userId },
    update: {
      type: DoctorType.SPECIALIST,
      specialtyAr: "إدارة العيادة",
      bioAr: "حساب مالك النظام — صلاحيات إدارية كاملة",
      colorCode: "#0F9A9A",
      isActive: true,
    },
    create: {
      userId,
      type: DoctorType.SPECIALIST,
      specialtyAr: "إدارة العيادة",
      bioAr: "حساب مالك النظام — صلاحيات إدارية كاملة",
      colorCode: "#0F9A9A",
      isActive: true,
    },
  });

  // Explicit user-level grants for every permission (idempotent; no duplicates)
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id,
        },
      },
      update: { granted: true },
      create: {
        userId,
        permissionId: permission.id,
        granted: true,
      },
    });
  }

  const verify = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true,
      doctor: true,
      userPermissions: true,
    },
  });

  if (!verify) {
    throw new Error("Owner user missing after upsert");
  }

  const duplicateCount = await prisma.user.count({
    where: { email: { equals: email, mode: "insensitive" } },
  });

  if (duplicateCount !== 1) {
    throw new Error(
      `Expected exactly one user for ${email}, found ${duplicateCount}`,
    );
  }

  if (!verify.passwordHash || verify.passwordHash === password) {
    throw new Error("Password was not hashed correctly");
  }

  if (!verify.passwordHash.startsWith("$2")) {
    throw new Error("Password hash does not look like bcrypt");
  }

  console.log(
    JSON.stringify(
      {
        action: created ? "created" : "updated",
        userId: verify.id,
        email: verify.email,
        role: verify.role.code,
        status: verify.status,
        doctorType: verify.doctor?.type ?? null,
        rolePermissionCount: permissionCount,
        userPermissionCount: verify.userPermissions.length,
        passwordHashed: true,
        emailVerifiedField: "not_in_schema",
        dashboardPath: "/doctor/specialist/dashboard",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
