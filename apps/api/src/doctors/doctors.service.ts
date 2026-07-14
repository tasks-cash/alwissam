import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Session, User } from "../auth/schemas/auth.schemas";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  CreateDoctorDto,
  DeleteDoctorDto,
  UpdateDoctorDto,
} from "./dto/doctor.dto";

const BCRYPT_ROUNDS = 12;

@Injectable()
export class DoctorsService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
  ) {}

  async list() {
    const doctors = await this.users
      .find({
        deletedAt: null,
        roleCode: { $in: ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST", "ADMIN"] },
        doctor: { $exists: true },
      })
      .select("fullName email phone roleCode status doctor createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return {
      ok: true,
      doctors: doctors.map((d) => ({
        id: String(d._id),
        fullName: d.fullName,
        email: d.email,
        phone: d.phone,
        roleCode: d.roleCode,
        status: d.status,
        type: d.doctor?.type,
        specialtyAr: d.doctor?.specialtyAr,
        isActive: d.doctor?.isActive !== false && d.status === "ACTIVE",
      })),
    };
  }

  private async assertUniqueEmailPhone(
    email: string | undefined,
    phone: string | undefined,
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

  async create(dto: CreateDoctorDto, actor: AuthUser) {
    await this.assertUniqueEmailPhone(dto.email, dto.phone);

    const roleCode =
      dto.type === "SPECIALIST" ? "DOCTOR_SPECIALIST" : "DOCTOR_GENERAL";
    const specialtyAr =
      dto.specialtyAr ||
      (dto.type === "SPECIALIST"
        ? "تقويم الأسنان · التركيبات · الجراحة"
        : "الحالات الاستعجالية · العلاج العام");

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      const created = await this.users.create({
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        roleCode,
        status: "ACTIVE",
        doctor: {
          type: dto.type,
          specialtyAr,
          colorCode: dto.type === "SPECIALIST" ? "#0F9A9A" : "#176B87",
          isActive: true,
        },
      });

      void actor;
      return {
        ok: true,
        message: "تم إنشاء حساب الطبيب بنجاح.",
        user: {
          id: String(created._id),
          fullName: created.fullName,
          email: created.email,
          phone: created.phone,
          type: dto.type,
        },
      };
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        throw new ConflictException({
          code: ErrorCodes.DUPLICATE_EMAIL,
          message: "يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل.",
          fieldErrors: {
            email: ["يوجد حساب مسجل بهذا البريد الإلكتروني بالفعل."],
          },
        });
      }
      throw err;
    }
  }

  async update(dto: UpdateDoctorDto, actor: AuthUser) {
    const target = await this.users.findOne({
      _id: dto.userId,
      deletedAt: null,
      doctor: { $exists: true },
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الطبيب غير موجود",
      });
    }

    await this.assertUniqueEmailPhone(
      dto.email,
      dto.phone,
      String(target._id),
    );

    if (dto.email) target.email = dto.email;
    if (dto.phone) target.phone = dto.phone;
    if (dto.newPassword) {
      target.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
      await this.sessions.updateMany(
        { userId: target._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    }

    target.status = "ACTIVE";
    if (target.doctor) target.doctor.isActive = true;
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save({ validateModifiedOnly: true });
    void actor;
    return { ok: true, message: "تم حفظ التعديلات بنجاح." };
  }

  async remove(dto: DeleteDoctorDto, actor: AuthUser) {
    if (dto.userId === actor.id) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن تعطيل حسابك الحالي",
      });
    }
    const target = await this.users.findOne({
      _id: dto.userId,
      deletedAt: null,
      doctor: { $exists: true },
    });
    if (!target) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الطبيب غير موجود",
      });
    }

    target.status = "INACTIVE";
    if (target.doctor) target.doctor.isActive = false;
    await target.save();
    await this.sessions.updateMany(
      { userId: target._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    return { ok: true, message: "تم تعطيل الحساب بنجاح." };
  }
}
