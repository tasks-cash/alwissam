import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Session, User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  CreateSecretaryDto,
  DeleteSecretaryDto,
  ListSecretariesQueryDto,
  UpdateSecretaryDto,
} from "./dto/secretary.dto";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class SecretariesService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    private readonly audit: AuditService,
  ) {}

  async list(query: ListSecretariesQueryDto = new ListSecretariesQueryDto()) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const filter: Record<string, unknown> = {
      deletedAt: null,
      roleCode: "SECRETARY",
    };
    if (query.search?.trim()) {
      const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (query.status) filter.status = query.status;
    if (query.shiftCode) filter["secretary.shiftCode"] = query.shiftCode;
    const [rows, total] = await Promise.all([
      this.users
        .find(filter)
        .select(
          "fullName email phone roleCode status secretary createdAt updatedAt lastLoginAt",
        )
        .sort({ fullName: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.users.countDocuments(filter),
    ]);

    return {
      ok: true,
      secretaries: rows.map((s) => ({
        id: String(s._id),
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        status: s.status,
        shiftCode: s.secretary?.shiftCode,
        workStartTime: s.secretary?.workStartTime,
        workEndTime: s.secretary?.workEndTime,
        workDays: s.secretary?.workDays,
        isActive: s.status === "ACTIVE",
        createdAt: (s as { createdAt?: Date }).createdAt,
        updatedAt: (s as { updatedAt?: Date }).updatedAt,
        lastLoginAt: (s as { lastLoginAt?: Date }).lastLoginAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  private async assertUnique(
    email?: string,
    phone?: string,
    excludeId?: string,
  ) {
    if (email) {
      const taken = await this.users.findOne({
        email,
        deletedAt: null,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      });
      if (taken) {
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE_EMAIL,
          message: "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.",
          fieldErrors: {
            email: ["يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل."],
          },
        });
      }
    }
    if (phone) {
      const taken = await this.users.findOne({
        phone,
        deletedAt: null,
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
      });
      if (taken) {
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE_PHONE,
          message: "يوجد حساب مسجل بهذا الرقم بالفعل.",
          fieldErrors: {
            phone: ["يوجد حساب مسجل بهذا الرقم بالفعل."],
          },
        });
      }
    }
  }

  async create(dto: CreateSecretaryDto, actor: AuthUser) {
    await this.assertUnique(dto.email, dto.phone);
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const created = await this.users.create({
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      roleCode: "SECRETARY",
      status: "ACTIVE",
      secretary: {
        shiftCode: dto.shiftCode,
        workStartTime: dto.workStartTime || "07:00",
        workEndTime: dto.workEndTime || "14:30",
        workDays: dto.workDays || "SUN,MON,TUE,WED,THU,SAT",
      },
    });
    void actor;
    await this.audit.write({
      actor,
      action: "SECRETARY_CREATED",
      entityType: "User",
      entityId: String(created._id),
      newValue: {
        fullName: created.fullName,
        email: created.email,
        roleCode: "SECRETARY",
      },
    });
    return {
      ok: true,
      message: "تم إنشاء حساب السكرتير بنجاح.",
      user: {
        id: String(created._id),
        fullName: created.fullName,
        email: created.email,
        phone: created.phone,
      },
    };
  }

  async update(dto: UpdateSecretaryDto, actor: AuthUser) {
    const target = await this.users.findOne({
      _id: dto.userId,
      deletedAt: null,
      roleCode: "SECRETARY",
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "السكرتير غير موجود",
      });
    }

    await this.assertUnique(dto.email, dto.phone, String(target._id));
    if (dto.newPassword) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "إعادة تعيين كلمة المرور إجراء مستقل ومحمي.",
      });
    }
    const oldValue = {
      fullName: target.fullName,
      email: target.email,
      phone: target.phone,
      status: target.status,
      secretary: target.secretary ? { ...target.secretary } : undefined,
    };
    if (dto.fullName) target.fullName = dto.fullName;
    if (dto.email) target.email = dto.email;
    if (dto.phone) target.phone = dto.phone;

    target.secretary = {
      ...(target.secretary || {}),
      shiftCode: dto.shiftCode || target.secretary?.shiftCode || "MORNING",
      workStartTime:
        dto.workStartTime || target.secretary?.workStartTime || "07:00",
      workEndTime: dto.workEndTime || target.secretary?.workEndTime || "14:30",
      workDays:
        dto.workDays ||
        target.secretary?.workDays ||
        "SUN,MON,TUE,WED,THU,SAT",
    };
    if (dto.status) {
      target.status = dto.status;
      if (dto.status === "INACTIVE") {
        await this.sessions.updateMany(
          { userId: target._id, revokedAt: null },
          { $set: { revokedAt: new Date() } },
        );
      }
    }
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save();
    await this.audit.write({
      actor,
      action: "SECRETARY_UPDATED",
      entityType: "User",
      entityId: String(target._id),
      oldValue,
      newValue: {
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        status: target.status,
        secretary: target.secretary,
      },
    });
    return { ok: true, message: "تم حفظ التعديلات بنجاح." };
  }

  async resetPassword(userId: string, newPassword: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف السكرتير غير صالح.",
      });
    }
    const target = await this.users.findOne({
      _id: userId,
      deletedAt: null,
      roleCode: "SECRETARY",
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "السكرتير غير موجود",
      });
    }
    target.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save({ validateModifiedOnly: true });
    await this.sessions.updateMany(
      { userId: target._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "SECRETARY_PASSWORD_RESET",
      entityType: "User",
      entityId: String(target._id),
      newValue: { sessionsRevoked: true },
    });
    return {
      ok: true,
      message: "تم تعيين كلمة مرور مؤقتة وإنهاء الجلسات السابقة.",
    };
  }

  async remove(dto: DeleteSecretaryDto, actor: AuthUser) {
    if (dto.userId === actor.id) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن تعطيل حسابك الحالي",
      });
    }
    const target = await this.users.findOne({
      _id: dto.userId,
      deletedAt: null,
      roleCode: "SECRETARY",
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "السكرتير غير موجود",
      });
    }
    target.status = "INACTIVE";
    await target.save();
    await this.sessions.updateMany(
      { userId: target._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "SECRETARY_DEACTIVATED",
      entityType: "User",
      entityId: String(target._id),
    });
    return { ok: true, message: "تم تعطيل الحساب بنجاح." };
  }
}
