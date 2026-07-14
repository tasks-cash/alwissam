import { NextRequest, NextResponse } from "next/server";
import { connectMongo } from "@/lib/db/mongo";
import { LoginHistoryModel, UserModel } from "@/lib/db/models/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/auth/rate-limit";
import { createAuditLog, roleDashboardPath } from "@/lib/audit/log";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "بيانات غير صالحة" },
      { status: 400 },
    );
  }

  const { email, password, rememberMe } = parsed.data;
  const identifier = email;
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent");

  const rl = await rateLimit({
    key: `login:${ip}:${identifier}`,
    limit: Number(process.env.MAX_LOGIN_ATTEMPTS || 5),
    windowMs: 15 * 60 * 1000,
  });

  if (!rl.allowed) {
    return NextResponse.json(
      { error: "تم تجاوز عدد محاولات الدخول. حاول لاحقًا." },
      { status: 429 },
    );
  }

  await connectMongo();

  const normalized = identifier.trim().toLowerCase();
  const user = await UserModel.findOne({
    deletedAt: null,
    $or: [{ email: normalized }, { phone: identifier.trim() }],
  });

  const fail = async (reason: string) => {
    await LoginHistoryModel.create({
      userId: user?._id,
      identifier,
      success: false,
      ipAddress: ip,
      userAgent: userAgent || undefined,
      reason,
    });
    if (user) {
      const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
      const lockMinutes = Number(process.env.LOCKOUT_MINUTES || 30);
      const failedLoginCount = (user.failedLoginCount ?? 0) + 1;
      user.failedLoginCount = failedLoginCount;
      if (failedLoginCount >= maxAttempts) {
        user.lockedUntil = new Date(Date.now() + lockMinutes * 60_000);
        user.status = "LOCKED";
      }
      await user.save();
    }
    await createAuditLog({
      userId: user ? String(user._id) : undefined,
      roleCode: user?.roleCode,
      action: "LOGIN_FAILED",
      entityType: "User",
      entityId: user ? String(user._id) : undefined,
      reason,
      ipAddress: ip,
      deviceInfo: userAgent,
    });
  };

  if (!user) {
    await fail("المستخدم غير موجود");
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 },
    );
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await fail("الحساب مقفل مؤقتًا");
    return NextResponse.json(
      { error: "الحساب مقفل مؤقتًا بسبب محاولات فاشلة متكررة" },
      { status: 423 },
    );
  }

  if (user.status !== "ACTIVE" && user.status !== "LOCKED") {
    await fail("الحساب غير نشط");
    return NextResponse.json({ error: "الحساب غير نشط" }, { status: 403 });
  }

  const portal = body?.portal === "patient" ? "patient" : "staff";
  if (portal === "patient" && user.roleCode !== "PATIENT") {
    await fail("بوابة المريض فقط");
    return NextResponse.json(
      { error: "هذا الحساب غير مخصص لبوابة المرضى" },
      { status: 403 },
    );
  }
  if (portal === "staff" && user.roleCode === "PATIENT") {
    await fail("بوابة الطاقم فقط");
    return NextResponse.json(
      { error: "يرجى استخدام بوابة المرضى" },
      { status: 403 },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await fail("كلمة مرور خاطئة");
    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 },
    );
  }

  user.failedLoginCount = 0;
  user.lockedUntil = null;
  user.status = "ACTIVE";
  user.lastLoginAt = new Date();
  await user.save();

  const { token, expiresAt } = await createSession({
    userId: String(user._id),
    rememberMe,
    ipAddress: ip,
    userAgent,
    skipCookie: true,
  });

  await LoginHistoryModel.create({
    userId: user._id,
    identifier,
    success: true,
    ipAddress: ip,
    userAgent: userAgent || undefined,
  });

  await createAuditLog({
    userId: String(user._id),
    roleCode: user.roleCode,
    action: "LOGIN_SUCCESS",
    entityType: "User",
    entityId: String(user._id),
    ipAddress: ip,
    deviceInfo: userAgent,
  });

  const res = NextResponse.json({
    ok: true,
    redirectTo: roleDashboardPath(user.roleCode),
    user: {
      id: String(user._id),
      fullName: user.fullName,
      role: user.roleCode,
    },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  return res;
}
