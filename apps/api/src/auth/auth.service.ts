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
  toCanonicalPhone,
  phoneLookupVariants,
} from "@alwisam/shared-validation";
import { defaultPermissionsForRole } from "../common/auth/permissions";
import {
  invitationRoleToStored,
  roleDashboardPath,
  sanitizeInternalRedirect,
  toCanonicalRole,
} from "../common/auth/roles";
import {
  SECRETARY_OUTSIDE_SHIFT_MESSAGE,
  isWithinSecretaryShift,
} from "../common/auth/secretary-shift";
import {
  StaffInvitation,
} from "./schemas/staff-invitation.schema";
import { VerificationToken } from "./schemas/verification-token.schema";
import {
  changePasswordLimiter,
  forgotPasswordLimiter,
  loginIdLimiter,
  loginIpLimiter,
  verifyResendLimiter,
} from "../common/auth/auth-rate-limit";

const BCRYPT_ROUNDS = 12;
const GENERIC_SERVER =
  "تعذر إكمال العملية حاليًا. حاول مرة أخرى.";
const GENERIC_VERIFY =
  "إذا كانت البيانات صحيحة، فسيتم تأكيد الحساب عند نجاح التحقق.";

export { roleDashboardPath };

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
    @InjectModel(StaffInvitation.name)
    private readonly invitations: Model<StaffInvitation>,
    @InjectModel(VerificationToken.name)
    private readonly verificationTokens: Model<VerificationToken>,
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

    const phone = toCanonicalPhone(dto.phone) || normalizePhoneDigits(dto.phone) || dto.phone.trim();
    const email = dto.email ? normalizeEmail(dto.email) : undefined;
    const phoneVariants = phoneLookupVariants(dto.phone);

    const existingUser = await this.users.findOne({
      deletedAt: null,
      $or: [
        { phoneCanonical: phone },
        { phone: { $in: phoneVariants } },
        ...(email ? [{ email }, { emailNormalized: email }] : []),
      ],
    });
    if (existingUser) {
      throw new ConflictException({
        code: existingUser.phoneCanonical === phone || phoneVariants.includes(existingUser.phone || "")
          ? ErrorCodes.DUPLICATE_PHONE
          : ErrorCodes.DUPLICATE_EMAIL,
        message: "تعذر إنشاء الحساب بهذه البيانات. جرّب تسجيل الدخول أو استعادة كلمة المرور.",
      });
    }

    const linkedPatient = await this.patients.findOne({
      deletedAt: null,
      $or: [{ phone }, { phone: { $in: phoneVariants } }],
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
      phoneCanonical: phone,
      email,
      emailNormalized: email,
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

    await this.users.updateOne(
      { _id: user._id },
      { $set: { patientProfileId: patient._id } },
    );

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

  private normalizeIdentifier(raw: string): {
    email?: string;
    phone?: string;
    phoneVariants: string[];
    lookup: string;
  } {
    const trimmed = raw.trim();
    if (isEmailLike(trimmed)) {
      const email = normalizeEmail(trimmed);
      return { email, phoneVariants: [], lookup: email };
    }
    const phone = toCanonicalPhone(trimmed) || normalizePhoneDigits(trimmed) || trimmed;
    return { phone, phoneVariants: phoneLookupVariants(trimmed), lookup: phone };
  }

  async login(
    dto: LoginDto,
    meta: { ip?: string; userAgent?: string },
    opts?: { next?: string },
  ) {
    const identifier = (dto.email || dto.identifier || dto.loginId || "").trim();
    loginIpLimiter.prune();
    loginIdLimiter.prune();
    loginIpLimiter.assertAllowed(`login:ip:${meta.ip || "unknown"}`);
    if (identifier.length >= 3) {
      loginIdLimiter.assertAllowed(`login:id:${identifier.toLowerCase()}`);
    }

    if (!identifier || identifier.length < 3) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "بيانات تسجيل الدخول غير صحيحة.",
      });
    }

    const { email, phone, phoneVariants, lookup } = this.normalizeIdentifier(identifier);
    const user = await this.users.findOne({
      deletedAt: null,
      $or: [
        ...(email ? [{ email }, { emailNormalized: email }] : []),
        ...(phone
          ? [
              { phoneCanonical: phone },
              { phone },
              { phone: { $in: phoneVariants } },
            ]
          : []),
        { email: lookup },
        { phone: lookup },
      ],
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "بيانات تسجيل الدخول غير صحيحة.",
      });
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new HttpException(
        {
          code: ErrorCodes.ACCOUNT_DISABLED,
          message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
        },
        HttpStatus.LOCKED,
      );
    }

    if (user.status === "INACTIVE" || user.status === "PENDING") {
      throw new ForbiddenException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
      });
    }

    if (user.status !== "ACTIVE" && user.status !== "LOCKED") {
      throw new ForbiddenException({
        code: ErrorCodes.ACCOUNT_DISABLED,
        message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
      });
    }

    // Optional portal hint — never trust portal for privilege; only soft UX warn.
    // Unified login accepts all roles.

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
      await this.auditLogs.create({
        userId: user._id,
        roleCode: user.roleCode,
        action: "LOGIN_FAILED",
        entityType: "User",
        entityId: String(user._id),
        ipAddress: meta.ip,
      });
      throw new UnauthorizedException({
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: "بيانات تسجيل الدخول غير صحيحة.",
      });
    }

    if (user.roleCode === "SECRETARY") {
      if (!user.secretary) {
        throw new ForbiddenException({
          code: ErrorCodes.FORBIDDEN,
          message: SECRETARY_OUTSIDE_SHIFT_MESSAGE,
        });
      }
      if (!isWithinSecretaryShift(user.secretary)) {
        await this.auditLogs.create({
          userId: user._id,
          roleCode: user.roleCode,
          action: "LOGIN_DENIED_OUTSIDE_SHIFT",
          entityType: "User",
          entityId: String(user._id),
          ipAddress: meta.ip,
        });
        throw new ForbiddenException({
          code: ErrorCodes.FORBIDDEN,
          message: SECRETARY_OUTSIDE_SHIFT_MESSAGE,
        });
      }
    }

    if (user.roleCode === "PATIENT") {
      const patient = await this.patients.findOne({
        userId: user._id,
        deletedAt: null,
      });
      if (!patient) {
        throw new ForbiddenException({
          code: ErrorCodes.FORBIDDEN,
          message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
        });
      }
    }

    if (
      user.roleCode === "DOCTOR" ||
      user.roleCode === "DOCTOR_GENERAL" ||
      user.roleCode === "DOCTOR_SPECIALIST" ||
      user.roleCode === "ADMIN" ||
      user.roleCode === "ADMIN_OWNER"
    ) {
      if (
        (user.roleCode === "DOCTOR" ||
          user.roleCode === "DOCTOR_GENERAL" ||
          user.roleCode === "DOCTOR_SPECIALIST") &&
        !user.doctor
      ) {
        throw new ForbiddenException({
          code: ErrorCodes.FORBIDDEN,
          message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
        });
      }
      if (user.doctor && user.doctor.isActive === false) {
        throw new ForbiddenException({
          code: ErrorCodes.ACCOUNT_DISABLED,
          message: "هذا الحساب غير متاح حاليًا. تواصل مع إدارة العيادة.",
        });
      }
    }

    user.failedLoginCount = 0;
    user.lockedUntil = null;
    user.status = "ACTIVE";
    user.lastLoginAt = new Date();
    if (!user.phoneCanonical && user.phone) {
      user.phoneCanonical = toCanonicalPhone(user.phone) || user.phone;
    }
    if (!user.emailNormalized && user.email) {
      user.emailNormalized = normalizeEmail(user.email);
    }
    await user.save();

    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action: "LOGIN",
      entityType: "User",
      entityId: String(user._id),
      ipAddress: meta.ip,
      newValue: { portal: dto.portal || "unified" },
    });

    const issued = await this.issueTokens(user, meta, !!dto.rememberMe);
    const locale = user.locale || "ar";
    const redirectTo = sanitizeInternalRedirect(
      opts?.next,
      locale,
      user.roleCode,
    );
    issued.body.redirectTo = redirectTo;
    issued.body.user = {
      ...issued.body.user,
      canonicalRole: toCanonicalRole(user.roleCode),
      dashboardPath: roleDashboardPath(user.roleCode, locale),
    };
    return issued;
  }

  private async issueTokens(
    user: User & { _id: { toString(): string }; locale?: string },
    meta: { ip?: string; userAgent?: string },
    rememberMe: boolean,
  ) {
    const jti = randomUUID();
    const accessToken = await this.tokens.signAccess({
      sub: String(user._id),
      roleCode: user.roleCode,
      fullName: user.fullName,
      sessionJti: jti,
    });

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
          canonicalRole: toCanonicalRole(user.roleCode),
          locale: user.locale || "ar",
          permissions: permissionsForUser(user),
          dashboardPath: roleDashboardPath(user.roleCode, user.locale || "ar"),
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

    if (user.roleCode === "SECRETARY" && !isWithinSecretaryShift(user.secretary)) {
      session.revokedAt = new Date();
      session.revokedReason = "shift_ended";
      await session.save();
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: SECRETARY_OUTSIDE_SHIFT_MESSAGE,
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
      { $set: { revokedAt: new Date(), revokedReason: "logout" } },
    );
  }

  async logoutAll(userId: string) {
    await this.sessions.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: "logout_all" } },
    );
    await this.auditLogs.create({
      userId,
      action: "LOGOUT_ALL",
      entityType: "User",
      entityId: userId,
    });
    return { ok: true };
  }

  async listSessions(userId: string, currentSessionJti?: string) {
    const currentSessionKey = currentSessionJti
      ? createHash("sha256")
          .update(currentSessionJti)
          .digest("hex")
          .slice(0, 32)
      : undefined;
    const rows = await this.sessions
      .find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } })
      .sort({ lastActivityAt: -1 })
      .select(
        "userAgent ipAddress createdAt lastActivityAt expiresAt rememberMe csrfToken",
      )
      .lean();
    return {
      ok: true,
      sessions: rows.map((s) => ({
        id: String(s._id),
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        createdAt: (s as { createdAt?: Date }).createdAt,
        lastActivityAt: s.lastActivityAt,
        expiresAt: s.expiresAt,
        rememberMe: s.rememberMe,
        current: Boolean(
          currentSessionKey && s.csrfToken === currentSessionKey,
        ),
      })),
    };
  }

  async logoutOtherSessions(userId: string, currentSessionJti?: string) {
    if (!currentSessionJti) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "أعد تسجيل الدخول لتحديد الجهاز الحالي بأمان.",
      });
    }
    const currentSessionKey = createHash("sha256")
      .update(currentSessionJti)
      .digest("hex")
      .slice(0, 32);
    const result = await this.sessions.updateMany(
      {
        userId,
        revokedAt: null,
        csrfToken: { $ne: currentSessionKey },
      },
      {
        $set: {
          revokedAt: new Date(),
          revokedReason: "logout_others",
        },
      },
    );
    await this.auditLogs.create({
      userId: new Types.ObjectId(userId),
      action: "OTHER_SESSIONS_REVOKED",
      entityType: "User",
      entityId: userId,
      newValue: { revoked: result.modifiedCount },
    });
    return {
      ok: true,
      revoked: result.modifiedCount,
      message: "تم تسجيل الخروج من جميع الأجهزة الأخرى.",
    };
  }

  async revokeSession(userId: string, sessionId: string) {
    if (!Types.ObjectId.isValid(sessionId)) {
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: "الجلسة غير موجودة",
      });
    }
    const updated = await this.sessions.updateOne(
      { _id: sessionId, userId, revokedAt: null },
      { $set: { revokedAt: new Date(), revokedReason: "user_revoke" } },
    );
    if (!updated.modifiedCount) {
      throw new BadRequestException({
        code: ErrorCodes.NOT_FOUND,
        message: "الجلسة غير موجودة",
      });
    }
    await this.auditLogs.create({
      userId: new Types.ObjectId(userId),
      action: "SESSION_REVOKED_BY_USER",
      entityType: "Session",
      entityId: sessionId,
    });
    return { ok: true };
  }

  private resolveInvitationStatus(inv: StaffInvitation) {
    if (inv.status === "revoked" || inv.revokedAt) return "revoked";
    if (inv.status === "accepted" || inv.acceptedAt) return "accepted";
    if (inv.expiresAt.getTime() < Date.now()) return "expired";
    return "pending";
  }

  async validateInvitationToken(rawToken: string) {
    if (!rawToken?.trim()) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "دعوة التسجيل غير صالحة.",
      });
    }
    const inv = await this.invitations.findOne({
      tokenHash: hashToken(rawToken.trim()),
    });
    if (!inv) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "دعوة التسجيل غير صالحة.",
      });
    }
    const status = this.resolveInvitationStatus(inv);
    if (status === "expired") {
      if (inv.status === "pending") {
        inv.status = "expired";
        await inv.save();
      }
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "انتهت صلاحية دعوة التسجيل. اطلب دعوة جديدة من إدارة العيادة.",
      });
    }
    if (status === "revoked") {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "دعوة التسجيل غير صالحة.",
      });
    }
    if (status === "accepted") {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "تم استخدام دعوة التسجيل مسبقًا.",
      });
    }
    return {
      ok: true,
      invitation: {
        role: inv.role,
        doctorType: inv.doctorType,
        email: inv.email,
        phoneCanonical: inv.phoneCanonical,
        fullName: inv.fullName,
        expiresAt: inv.expiresAt,
        mode:
          inv.role === "DOCTOR"
            ? "doctor_invitation"
            : "secretary_invitation",
      },
    };
  }

  async registerFromInvitation(
    rawToken: string,
    dto: {
      fullName: string;
      email?: string;
      phone: string;
      password: string;
      confirmPassword: string;
      locale?: "ar" | "en" | "fr";
      privacyAccepted?: boolean;
      termsAccepted?: boolean;
    },
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

    const validated = await this.validateInvitationToken(rawToken);
    const inv = await this.invitations.findOne({
      tokenHash: hashToken(rawToken.trim()),
      status: "pending",
    });
    if (!inv) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "دعوة التسجيل غير صالحة.",
      });
    }

    // Role comes ONLY from invitation — ignore any client role claim.
    if (inv.role !== "DOCTOR" && inv.role !== "SECRETARY") {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "دعوة التسجيل غير صالحة.",
      });
    }

    const phone =
      toCanonicalPhone(dto.phone) ||
      normalizePhoneDigits(dto.phone) ||
      dto.phone.trim();
    const email = dto.email
      ? normalizeEmail(dto.email)
      : inv.email
        ? normalizeEmail(inv.email)
        : undefined;

    if (inv.email && email && normalizeEmail(inv.email) !== email) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يجب استخدام البريد المحدد في الدعوة.",
        fieldErrors: { email: ["يجب استخدام البريد المحدد في الدعوة."] },
      });
    }
    if (inv.phoneCanonical && inv.phoneCanonical !== phone) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يجب استخدام رقم الهاتف المحدد في الدعوة.",
        fieldErrors: { phone: ["يجب استخدام رقم الهاتف المحدد في الدعوة."] },
      });
    }

    const phoneVariants = phoneLookupVariants(phone);
    const taken = await this.users.findOne({
      deletedAt: null,
      $or: [
        { phoneCanonical: phone },
        { phone: { $in: phoneVariants } },
        ...(email ? [{ email }, { emailNormalized: email }] : []),
      ],
    });
    if (taken) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "تعذر إنشاء الحساب بهذه البيانات. جرّب تسجيل الدخول.",
      });
    }

    const storedRole = invitationRoleToStored(inv.role, inv.doctorType);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const fullName = (dto.fullName || inv.fullName || "").trim();
    if (!fullName) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "الاسم الكامل مطلوب.",
      });
    }

    const userPayload: Record<string, unknown> = {
      fullName,
      phone,
      phoneCanonical: phone,
      email,
      emailNormalized: email,
      passwordHash,
      roleCode: storedRole,
      status: "ACTIVE",
      emailVerified: !!inv.email,
      permissions: defaultPermissionsForRole(storedRole),
      locale: dto.locale || "ar",
    };

    if (inv.role === "DOCTOR") {
      userPayload.doctor = {
        type: inv.doctorType || "GENERAL",
        specialtyAr: inv.doctorType === "SPECIALIST" ? "اختصاصي" : "طب عام",
        isActive: true,
        isPublic: false,
        isBookable: false,
      };
    } else {
      userPayload.secretary = {
        shiftCode: inv.scheduleDraft?.shiftCode || "MORNING",
        workStartTime: inv.scheduleDraft?.workStartTime || "07:00",
        workEndTime: inv.scheduleDraft?.workEndTime || "14:30",
        workDays:
          inv.scheduleDraft?.workDays || "SUN,MON,TUE,WED,THU,SAT",
      };
    }

    const user = await this.users.create(userPayload);

    inv.status = "accepted";
    inv.acceptedAt = new Date();
    inv.acceptedByUserId = user._id as Types.ObjectId;
    await inv.save();

    await this.auditLogs.create({
      userId: user._id,
      roleCode: storedRole,
      action: "STAFF_INVITATION_ACCEPTED",
      entityType: "StaffInvitation",
      entityId: String(inv._id),
      ipAddress: meta.ip,
      newValue: { role: inv.role, storedRole },
    });

    void validated;

    const issued = await this.issueTokens(user as never, meta, false);
    return {
      ...issued,
      body: {
        ...issued.body,
        message: "تم إنشاء الحساب بنجاح.",
        redirectTo: roleDashboardPath(storedRole, dto.locale || "ar"),
      },
    };
  }

  async me(userId: string) {
    const user = await this.users.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.UNAUTHORIZED,
        message: "يلزم تسجيل الدخول",
      });
    }
    let patientProfileId = user.patientProfileId
      ? String(user.patientProfileId)
      : undefined;
    if (user.roleCode === "PATIENT" && !patientProfileId) {
      const linked = await this.patients
        .findOne({ userId: user._id, deletedAt: null })
        .select("_id")
        .lean();
      if (linked) {
        patientProfileId = String(linked._id);
        await this.users.updateOne(
          { _id: user._id },
          { $set: { patientProfileId: linked._id } },
        );
      }
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
        adminDashboardMode:
          user.adminDashboardMode === "full" ? "full" : "quick",
        permissions: permissionsForUser(user),
        patientProfileId,
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
    changePasswordLimiter.prune();
    changePasswordLimiter.assertAllowed(`change-password:${userId}`);
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
    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action: "PASSWORD_CHANGED",
      entityType: "User",
      entityId: String(user._id),
    });
    return { ok: true, message: "تم تغيير كلمة المرور بنجاح." };
  }

  async requestPasswordReset(identifier: string) {
    forgotPasswordLimiter.prune();
    forgotPasswordLimiter.assertAllowed(
      `forgot:${identifier.trim().toLowerCase().slice(0, 80)}`,
    );

    const { email, phone, phoneVariants, lookup } =
      this.normalizeIdentifier(identifier);
    const user = await this.users.findOne({
      deletedAt: null,
      $or: [
        ...(email ? [{ email }, { emailNormalized: email }] : []),
        ...(phone
          ? [
              { phoneCanonical: phone },
              { phone },
              { phone: { $in: phoneVariants } },
            ]
          : []),
        { email: lookup },
        { phone: lookup },
      ],
    });

    const generic = {
      ok: true,
      message:
        "إذا كانت البيانات مطابقة لحساب مسجل، فستصلك تعليمات استعادة كلمة المرور.",
    };

    if (!user) return generic;

    await this.resetTokens.updateMany(
      { userId: user._id, usedAt: null },
      { $set: { usedAt: new Date() } },
    );

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.resetTokens.create({
      userId: user._id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action: "PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: String(user._id),
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

  async resendVerification(
    userId: string,
    channel: "email" | "phone" = "email",
  ) {
    verifyResendLimiter.assertAllowed(`verify-resend:${userId}:${channel}`);
    const user = await this.users.findOne({ _id: userId, deletedAt: null });
    if (!user) {
      return { ok: true, message: GENERIC_VERIFY };
    }
    if (channel === "email" && (!user.email || user.emailVerified)) {
      return { ok: true, message: GENERIC_VERIFY };
    }
    if (channel === "phone" && !user.phoneCanonical && !user.phone) {
      return { ok: true, message: GENERIC_VERIFY };
    }

    const raw = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60_000);
    await this.verificationTokens.updateMany(
      { userId: user._id, channel, usedAt: null },
      { $set: { usedAt: new Date() } },
    );
    await this.verificationTokens.create({
      userId: user._id,
      channel,
      tokenHash: hashToken(raw),
      expiresAt,
      attempts: 0,
    });
    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action: "VERIFICATION_RESENT",
      entityType: "User",
      entityId: String(user._id),
      newValue: { channel },
    });

    if (process.env.NODE_ENV === "development") {
      return { ok: true, message: GENERIC_VERIFY, devToken: raw, channel };
    }
    return { ok: true, message: GENERIC_VERIFY };
  }

  async verifyContact(
    token: string,
    channelHint?: "email" | "phone",
  ) {
    const record = await this.verificationTokens.findOne({
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { $gt: new Date() },
      ...(channelHint ? { channel: channelHint } : {}),
    });
    if (!record) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "رمز التحقق غير صالح أو منتهٍ.",
      });
    }
    if ((record.attempts ?? 0) >= 8) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "رمز التحقق غير صالح أو منتهٍ.",
      });
    }
    record.attempts = (record.attempts ?? 0) + 1;
    await record.save();

    const user = await this.users.findOne({
      _id: record.userId,
      deletedAt: null,
    });
    if (!user) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: GENERIC_SERVER,
      });
    }

    if (record.channel === "email") {
      user.emailVerified = true;
    }
    await user.save();
    record.usedAt = new Date();
    await record.save();

    await this.auditLogs.create({
      userId: user._id,
      roleCode: user.roleCode,
      action:
        record.channel === "email" ? "EMAIL_VERIFIED" : "PHONE_VERIFIED",
      entityType: "User",
      entityId: String(user._id),
    });

    return {
      ok: true,
      message:
        record.channel === "email"
          ? "تم تأكيد البريد الإلكتروني بنجاح."
          : "تم تأكيد رقم الهاتف بنجاح.",
      channel: record.channel,
    };
  }
}
