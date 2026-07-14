import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Session, User } from "../auth/schemas/auth.schemas";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  CreateSecretaryDto,
  DeleteSecretaryDto,
  UpdateSecretaryDto,
} from "./dto/secretary.dto";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class SecretariesService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
  ) {}

  async list() {
    const rows = await this.users
      .find({ deletedAt: null, roleCode: "SECRETARY" })
      .select("fullName email phone roleCode status secretary createdAt")
      .sort({ createdAt: -1 })
      .lean();

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
      })),
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
    if (dto.email) target.email = dto.email;
    if (dto.phone) target.phone = dto.phone;
    if (dto.newPassword) {
      target.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      await this.sessions.updateMany(
        { userId: target._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    }

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
    target.status = "ACTIVE";
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save();
    void actor;
    return { ok: true, message: "تم حفظ التعديلات بنجاح." };
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
    return { ok: true, message: "تم تعطيل الحساب بنجاح." };
  }
}
