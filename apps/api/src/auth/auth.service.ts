import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { createHash, randomBytes, randomUUID } from "crypto";
import * as bcrypt from "bcryptjs";
import { LoginDto } from "./dto/login.dto";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import {
  AuditLog,
  PasswordResetToken,
  Session,
  User,
} from "./schemas/auth.schemas";
import { Patient } from "../patients/schemas/patient.schema";
import { AppointmentRequest } from "../appointments/schemas/appointment-request.schema";
import { PatientConsent } from "../patient-portal/schemas/portal.schemas";
import { JwtTokenService } from "../common/auth/jwt-token.service";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  hashToken,
} from "../common/auth/token.util";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  normalizeEmail,
  normalizePhoneDigits,
  isEmailLike,
} from "@alwisam/shared-validation";
import { defaultPermissionsForRole } from "../common/auth/permissions";

const BCRYPT_ROUNDS = 12;

export function roleDashboardPath(role: string, locale = "ar"): string {
  const prefix = `/${locale}`;
  switch (role) {
    case "ADMIN":
    case "OWNER":
    case "SUPER_ADMIN":
    case "DOCTOR_SPECIALIST":
      return `${prefix}/doctor/specialist/dashboard`;
    case "SECRETARY":
      return `${prefix}/secretary/dashboard`;
    case "DOCTOR_GENERAL":
      return `${prefix}/doctor/general/dashboard`;
    case "PATIENT":
      return `${prefix}/patient/dashboard`;
    default:
      return `${prefix}`;
  }
}

function permissionsForUser(user: User): string[] {
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions;
  }
  return defaultPermissionsForRole(user.roleCode);
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    @InjectModel(PasswordResetToken.name)
    private readonly resetTokens: Model<PasswordResetToken>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(AppointmentRequest.name)
    private readonly appointmentRequests: Model<AppointmentRequest>,
    @InjectModel(PatientConsent.name)
    private readonly consents: Model<PatientConsent>,
    private readonly tokens: JwtTokenService,
  ) {}

  private async nextPatientNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `P${year}`;
    const latest = await this.patients
      .findOne({ patientNumber: { $regex: `^${prefix}` } })
      .sort({ patientNumber: -1 })
      .select("patientNumber")
      .lean();
    let seq = 1;
    if (latest?.patientNumber) {
      const n = Number(latest.patientNumber.slice(prefix.length));
      if (Number.isFinite(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(5, "0")}`;
  }

  async registerPatient(
    dto: RegisterPatientDto,
    meta: { ip?: string; userAgent?: string },
  ) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "كلمتا المرور غير متطابقتين.",
        fieldErrors: { confirmPassword: ["كلمتا المرور غير متطابقتين."] },
      });
    }
    if (!dto.privacyAccepted || !dto.termsAccepted) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يلزم الموافقة على سياسة الخصوصية وشروط الاستخدام.",
      });
    }

    const phone = normalizePhoneDigits(dto.phone) || dto.phone.trim();
    const email = dto.email ? normalizeEmail(dto.email) : undefined;

    const existingUser = await this.users.findOne({
      deletedAt: null,
      $or: [
        { phone },
        ...(email ? [{ email }] : []),
      ],
    });
    if (existingUser) {
      throw new ConflictException({
        code: existingUser.phone === phone
          ? ErrorCodes.DUPLICATE_PHONE
          : ErrorCodes.DUPLICATE_EMAIL,
        message: "تعذر إنشاء الحساب بهذه البيانات. جرّب تسجيل الدخول أو استعادة كلمة المرور.",
      });
    }

    const linkedPatient = await this.patients.findOne({
      phone,
      deletedAt: null,
    });
    if (linkedPatient?.userId) {
      throw new ConflictException({
        code: ErrorCodes.DUPLICATE_PHONE,
        message: "تعذر إنشاء الحساب بهذه البيانات. جرّب تسجيل الدخول أو استعادة كلمة المرور.",
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      fullName: dto.fullName.trim(),
      phone,
      email,
      passwordHash,
      roleCode: "PATIENT",
      status: "ACTIVE",
      emailVerified: false,
      permissions: defaultPermissionsForRole("PATIENT"),
      locale: dto.locale || "ar",
    });

    let patient = linkedPatient;
    if (patient) {
      patient.userId = user._id as Types.ObjectId;
      if (email && !patient.email) patient.email = email;
      if (dto.fullName.trim()) patient.fullName = dto.fullName.trim();
      await patient.save();
    } else {
      patient = await this.patients.create({
        patientNumber: await this.nextPatientNumber(),
        fullName: dto.fullName.trim(),
        phone,
        email,
        userId: user._id,
        patientType: "REGULAR",
        createdById: user._id,
      });
    }

    // Link guest booking requests that share this phone (not by name).
    await this.appointmentRequests.updateMany(
      {
        phone,
        deletedAt: null,
        $or: [
          { linkedPatientId: { $exists: false } },
          { linkedPatientId: null },
        ],
      },
      {
        $set: {
          linkedPatientId: patient._id,
          linkedUserId: user._id,
        },
      },
    );

    await this.auditLogs.create({
      userId: user._id,
      roleCode: "PATIENT",
      action: "PATIENT_REGISTERED",
      entityType: "User",
      entityId: String(user._id),
      ipAddress: meta.ip,
      newValue: { patientId: String(patient._id) },
    });

    await this.consents.bulkWrite(
      [
        {
          updateOne: {
            filter: { patientId: patient._id, consentType: "privacy_policy" },
            update: {
              $set: {
                accepted: true,
                acceptedAt: new Date(),
                required: true,
              },
            },
            upsert: true,
          },
        },
        {
          updateOne: {
            filter: { patientId: patient._id, consentType: "terms_of_use" },
            update: {
              $set: {
                accepted: true,
                acceptedAt: new Date(),
                required: true,
              },
            },
            upsert: true,
          },
        },
      ],
      { ordered: false },
    );

    const issued = await this.issueTokens(user, meta, false);
    const locale = dto.locale || "ar";
    return {
      ...issued,
      body: {
        ok: true,
        message: "تم إنشاء حساب المريض بنجاح.",
        redirectTo: `/${locale}/patient/dashboard`,
        user: {
          id: String(user._id),
          fullName: user.fullName,
          role: user.roleCode,
        },
      },
    };
  }

  private normalizeIdentifier(raw: string): { email?: string; phone?: string; lookup: string } {
    const trimmed = raw.trim();
    if (isEmailLike(trimmed)) {
      const email = normalizeEmail(trimmed);
      return { email, lookup: email };
    }
    const phone = normalizePhoneDigits(trimmed) || trimmed;
    return { phone, lookup: phone };
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }) {
    const identifier = dto.loginId;
    if (!identifier || identifier.length < 3) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    }

    const { email, phone, lookup } = this.normalizeIdentifier(identifier);
    const user = await this.users.findOne({
      deletedAt: null,
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        { email: lookup },
        { phone: lookup },
      ],
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException(
        {
          code: ErrorCodes.ACCOUNT_DISABLED,
          message: "الحساب مقفل مؤقتًا بسبب محاولات فاشلة متكررة",
        },
        HttpStatus.LOCKED,
      );
    }

    if (user.status === "INACTIVE") {
      throw new ForbiddenException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "تم تعطيل هذا الحساب.",
      });
    }

    if (user.status !== "ACTIVE" && user.status !== "LOCKED") {
      throw new ForbiddenException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "الحساب غير نشط",
      });
    }

    const portal = dto.portal === "patient" ? "patient" : "staff";
    if (portal === "patient" && user.roleCode !== "PATIENT") {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "هذا الحساب غير مخصص لبوابة المرضى",
      });
    }
    if (portal === "staff" && user.roleCode === "PATIENT") {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "يرجى استخدام بوابة المرضى",
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      user.failedLoginCount = (user.failedLoginCount ?? 0) + 1;
      const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
      if (user.failedLoginCount >= maxAttempts) {
        const lockMinutes = Number(process.env.LOCKOUT_MINUTES || 30);
        user.lockedUntil = new Date(Date.now() + lockMinutes * 60_000);
        user.status = "LOCKED";
      }
      await user.save();
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
      });
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.status = "ACTIVE";
    user.lastLoginAt = new Date();
    await user.save();

    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action: "LOGIN",
      entityType: "User",
      entityId: String(user._id),
      ipAddress: meta.ip,
      newValue: { portal: dto.portal || "staff" },
    });

    return this.issueTokens(user, meta, !!dto.rememberMe);
  }

  private async issueTokens(
    user: User & { _id: { toString(): string }; locale?: string },
    meta: { ip?: string; userAgent?: string },
    rememberMe: boolean,
  ) {
    const accessToken = await this.tokens.signAccess({
      sub: String(user._id),
      roleCode: user.roleCode,
      fullName: user.fullName,
    });

    const jti = randomUUID();
    const refreshToken = await this.tokens.signRefresh({
      sub: String(user._id),
      jti,
    });
    const refreshHash = hashToken(refreshToken);
    const ttl = this.tokens.getRefreshTtlMs();
    const expiresAt = new Date(Date.now() + ttl);

    await this.sessions.create({
      userId: user._id,
      tokenHash: refreshHash,
      csrfToken: createHash("sha256").update(jti).digest("hex").slice(0, 32),
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      rememberMe,
      expiresAt,
      lastActivityAt: new Date(),
    });

    return {
      accessCookie: ACCESS_COOKIE,
      refreshCookie: REFRESH_COOKIE,
      accessToken,
      refreshToken,
      accessExpiresAt: new Date(Date.now() + this.tokens.getAccessTtlMs()),
      refreshExpiresAt: expiresAt,
      body: {
        ok: true,
        redirectTo: roleDashboardPath(user.roleCode, user.locale || "ar"),
        accessToken,
        user: {
          id: String(user._id),
          fullName: user.fullName,
          role: user.roleCode,
          locale: user.locale || "ar",
          permissions: permissionsForUser(user),
        },
      },
    };
  }

  async refresh(rawRefresh?: string, meta?: { ip?: string; userAgent?: string }) {
    if (!rawRefresh) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }

    let verified;
    try {
      verified = await this.tokens.verifyRefresh(rawRefresh);
    } catch {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "انتهت الجلسة",
      });
    }

    const tokenHash = hashToken(rawRefresh);
    const session = await this.sessions.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    // Refresh-token reuse: revoked token presented again → revoke all sessions.
    if (session?.revokedAt) {
      await this.sessions.updateMany(
        { userId: session.userId, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "تم رفض إعادة استخدام رمز التحديث",
      });
    }

    if (!session || session.revokedAt) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "انتهت الجلسة",
      });
    }

    const user = await this.users.findOne({
      _id: verified.sub,
      deletedAt: null,
      status: "ACTIVE",
    });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "الحساب غير متاح",
      });
    }

    // Rotate refresh token
    session.revokedAt = new Date();
    await session.save();

    return this.issueTokens(user, meta || {}, !!session.rememberMe);
  }

  async logout(rawRefresh?: string) {
    if (!rawRefresh) return;
    await this.sessions.updateOne(
      { tokenHash: hashToken(rawRefresh), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  async me(userId: string) {
    const user = await this.users.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    return {
      ok: true,
      user: {
        id: String(user._id),
        fullName: user.fullName,
        role: user.roleCode,
        email: user.email,
        phone: user.phone,
        status: user.status,
        emailVerified: !!user.emailVerified,
        locale: user.locale || "ar",
        permissions: permissionsForUser(user),
        doctor: user.doctor
          ? {
              type: user.doctor.type,
              isActive: user.doctor.isActive !== false,
            }
          : undefined,
      },
    };
  }

  async updateLocale(userId: string, locale: "ar" | "en" | "fr") {
    const user = await this.users.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      { $set: { locale } },
      { new: true },
    );
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    return { ok: true, locale: user.locale || locale };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.users.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "كلمة المرور الحالية غير صحيحة",
        fieldErrors: { currentPassword: ["كلمة المرور الحالية غير صحيحة"] },
      });
    }
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    await this.sessions.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    return { ok: true, message: "تم تحديث كلمة المرور بنجاح" };
  }

  async requestPasswordReset(identifier: string) {
    const { email, phone, lookup } = this.normalizeIdentifier(identifier);
    const user = await this.users.findOne({
      deletedAt: null,
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        { email: lookup },
        { phone: lookup },
      ],
    });

    const generic = {
      ok: true,
      message: "إذا وُجد الحساب، ستصلك تعليمات إعادة تعيين كلمة المرور.",
    };

    if (!user) return generic;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.resetTokens.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    if (process.env.NODE_ENV === "development") {
      return { ...generic, devToken: token };
    }
    return generic;
  }

  async resetPassword(token: string, password: string) {
    const record = await this.resetTokens.findOne({
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "رابط إعادة التعيين غير صالح أو منتهٍ",
      });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await this.users.updateOne(
      { _id: record.userId },
      {
        $set: {
          passwordHash,
          failedLoginCount: 0,
          lockedUntil: null,
          status: "ACTIVE",
        },
      },
    );
    record.usedAt = new Date();
    await record.save();
    await this.sessions.updateMany(
      { userId: record.userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    return { ok: true, message: "تم تحديث كلمة المرور بنجاح" };
  }
}
