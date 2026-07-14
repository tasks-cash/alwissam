import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { connectMongo } from "@/lib/db/mongo";
import { SessionModel, UserModel, type UserDoc } from "@/lib/db/models/auth";
import type { RoleCode } from "@/lib/auth/roles";

export const SESSION_COOKIE = "alwisam_session";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function sessionMaxAgeMs(rememberMe: boolean) {
  if (rememberMe) {
    const days = Number(process.env.SESSION_REMEMBER_DAYS || 30);
    return days * 24 * 60 * 60 * 1000;
  }
  const hours = Number(process.env.SESSION_MAX_AGE_HOURS || 12);
  return hours * 60 * 60 * 1000;
}

/** Shape compatible with legacy Prisma session.user includes */
export type AuthUserView = {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  status: string;
  passwordHash: string;
  failedLoginCount: number;
  lockedUntil: Date | null;
  deletedAt: Date | null;
  role: { code: RoleCode };
  doctor: UserDoc["doctor"] | null;
  secretary: null;
  patientAccount: null;
};

export type AuthSessionView = {
  id: string;
  userId: string;
  csrfToken: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: AuthUserView;
};

function toUserView(user: UserDoc): AuthUserView {
  return {
    id: String(user._id),
    email: user.email ?? null,
    phone: user.phone ?? null,
    fullName: user.fullName,
    status: user.status,
    passwordHash: user.passwordHash,
    failedLoginCount: user.failedLoginCount ?? 0,
    lockedUntil: user.lockedUntil ?? null,
    deletedAt: user.deletedAt ?? null,
    role: { code: user.roleCode },
    doctor: user.doctor ?? null,
    secretary: null,
    patientAccount: null,
  };
}

export async function createSession(params: {
  userId: string;
  rememberMe?: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  /** إن true لا يضبط الكوكي هنا — يُعاد التوكن لضبطه على Response */
  skipCookie?: boolean;
}) {
  await connectMongo();
  const token = randomBytes(32).toString("hex");
  const csrfToken = randomBytes(24).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs(!!params.rememberMe));

  await SessionModel.create({
    userId: params.userId,
    tokenHash,
    csrfToken,
    ipAddress: params.ipAddress || undefined,
    userAgent: params.userAgent || undefined,
    rememberMe: !!params.rememberMe,
    expiresAt,
    lastActivityAt: new Date(),
  });

  if (!params.skipCookie) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });
  }

  return { token, csrfToken, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function getSessionFromCookie(): Promise<AuthSessionView | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await connectMongo();
  const tokenHash = hashToken(token);
  const session = await SessionModel.findOne({ tokenHash }).lean();
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }

  const user = await UserModel.findById(session.userId).lean();
  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    return null;
  }

  await SessionModel.updateOne(
    { _id: session._id },
    { $set: { lastActivityAt: new Date() } },
  );

  return {
    id: String(session._id),
    userId: String(session.userId),
    csrfToken: session.csrfToken,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt ?? null,
    user: toUserView(user as UserDoc),
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await connectMongo();
    const tokenHash = hashToken(token);
    await SessionModel.updateMany(
      { tokenHash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function revokeAllUserSessions(userId: string) {
  await connectMongo();
  await SessionModel.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}
