import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcryptjs";
import { Session, User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
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
    private readonly audit: AuditService,
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

  /** Active doctors only — for appointment assignment (all clinical staff). */
  async listActiveForScheduling() {
    const doctors = await this.users
      .find({
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
        roleCode: { $in: ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST", "ADMIN"] },
      })
      .select("fullName roleCode doctor")
      .sort({ fullName: 1 })
      .lean();

    return {
      ok: true,
      doctors: doctors.map((d) => ({
        id: String(d._id),
        fullName: d.fullName,
        type: d.doctor?.type,
        specialtyAr: d.doctor?.specialtyAr,
      })),
    };
  }

  private serializePublic(d: {
    _id: unknown;
    fullName: string;
    locale?: string;
    doctor?: {
      type?: string;
      specialtyAr?: string;
      specialtyEn?: string;
      specialtyFr?: string;
      professionalTitleAr?: string;
      professionalTitleEn?: string;
      professionalTitleFr?: string;
      bioAr?: string;
      bioEn?: string;
      bioFr?: string;
      profileImage?: string;
      languages?: string[];
      isBookable?: boolean;
      isPublic?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      slug?: string;
      appointmentDurationMinutes?: number;
      availabilityNoteAr?: string;
      availabilityNoteEn?: string;
      availabilityNoteFr?: string;
      workingHours?: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        isActive?: boolean;
      }>;
      weeklySchedule?: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        isActive?: boolean;
      }>;
    };
  }) {
    const schedule =
      (Array.isArray(d.doctor?.workingHours) && d.doctor.workingHours.length
        ? d.doctor.workingHours
        : Array.isArray(d.doctor?.weeklySchedule)
          ? d.doctor.weeklySchedule
          : []) || [];
    return {
      id: String(d._id),
      fullName: d.fullName,
      slug: d.doctor?.slug || "",
      type: d.doctor?.type,
      specialtyAr: d.doctor?.specialtyAr || "",
      specialtyEn: d.doctor?.specialtyEn || d.doctor?.specialtyAr || "",
      specialtyFr:
        d.doctor?.specialtyFr ||
        d.doctor?.specialtyEn ||
        d.doctor?.specialtyAr ||
        "",
      professionalTitleAr: d.doctor?.professionalTitleAr || "",
      professionalTitleEn:
        d.doctor?.professionalTitleEn || d.doctor?.professionalTitleAr || "",
      professionalTitleFr:
        d.doctor?.professionalTitleFr ||
        d.doctor?.professionalTitleEn ||
        d.doctor?.professionalTitleAr ||
        "",
      bioAr: d.doctor?.bioAr || "",
      bioEn: d.doctor?.bioEn || d.doctor?.bioAr || "",
      bioFr: d.doctor?.bioFr || d.doctor?.bioEn || d.doctor?.bioAr || "",
      profileImage: d.doctor?.profileImage || "",
      languages: Array.isArray(d.doctor?.languages) ? d.doctor.languages : [],
      isBookable: d.doctor?.isBookable !== false,
      isPublic: d.doctor?.isPublic !== false,
      isFeatured: Boolean(d.doctor?.isFeatured),
      displayOrder:
        typeof d.doctor?.displayOrder === "number" ? d.doctor.displayOrder : 100,
      appointmentDurationMinutes:
        typeof d.doctor?.appointmentDurationMinutes === "number"
          ? d.doctor.appointmentDurationMinutes
          : 30,
      availabilityNoteAr: d.doctor?.availabilityNoteAr || "",
      availabilityNoteEn:
        d.doctor?.availabilityNoteEn || d.doctor?.availabilityNoteAr || "",
      availabilityNoteFr:
        d.doctor?.availabilityNoteFr ||
        d.doctor?.availabilityNoteEn ||
        d.doctor?.availabilityNoteAr ||
        "",
      workingHours: schedule.filter((h) => h && h.isActive !== false),
    };
  }

  async listPublic(opts?: {
    q?: string;
    specialty?: string;
    active?: string | boolean;
    public?: string | boolean;
    bookable?: string | boolean;
    featured?: string | boolean;
    limit?: string | number;
  }) {
    const wantPublic =
      opts?.public === true ||
      opts?.public === "true" ||
      opts?.public === undefined;
    const wantBookable =
      opts?.bookable === true || opts?.bookable === "true";
    const preferFeatured =
      opts?.featured === true || opts?.featured === "true";
    const limitRaw = Number(opts?.limit);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(100, Math.max(1, limitRaw))
      : preferFeatured
        ? 3
        : wantBookable
          ? 5
          : 48;

    // Public directory: real doctor roles only — never ADMIN/OWNER/SECRETARY.
    const filter: Record<string, unknown> = {
      deletedAt: null,
      status: "ACTIVE",
      doctor: { $exists: true },
      "doctor.isActive": { $ne: false },
      "doctor.archivedAt": null,
      roleCode: { $in: ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"] },
    };

    const andClauses: Record<string, unknown>[] = [];

    if (wantPublic) {
      filter["doctor.isPublic"] = { $ne: false };
      andClauses.push({
        "doctor.specialtyAr": {
          $not: /إدارة العيادة|Clinic administration|Administration de la clinique/i,
        },
      });
      andClauses.push({
        fullName: {
          $not: /مالك النظام|System Owner|طبيب اختبار|Test Doctor/i,
        },
      });
    }

    if (wantBookable) {
      filter["doctor.isBookable"] = { $ne: false };
    }

    if (opts?.specialty?.trim()) {
      const s = opts.specialty.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      andClauses.push({
        $or: [
          { "doctor.specialtyAr": { $regex: s, $options: "i" } },
          { "doctor.specialtyEn": { $regex: s, $options: "i" } },
          { "doctor.specialtyFr": { $regex: s, $options: "i" } },
        ],
      });
    }
    if (opts?.q?.trim()) {
      const q = opts.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.fullName = { $regex: q, $options: "i" };
    }
    if (andClauses.length) {
      filter.$and = andClauses;
    }

    // Prefer featured first, then fill with other public bookable doctors.
    const baseQuery = () =>
      this.users
        .find(filter)
        .select("fullName doctor")
        .sort({
          "doctor.isFeatured": -1,
          "doctor.displayOrder": 1,
          "doctor.profileImage": -1,
          createdAt: 1,
        });

    let doctors = await baseQuery().limit(limit).lean();

    if (preferFeatured && doctors.length < limit) {
      doctors = await baseQuery().limit(limit).lean();
    }

    return {
      ok: true,
      doctors: doctors.map((d) => this.serializePublic(d as never)),
    };
  }

  async getPublicById(id: string) {
    const filter: Record<string, unknown> = {
      deletedAt: null,
      status: "ACTIVE",
      doctor: { $exists: true },
      "doctor.isActive": { $ne: false },
      "doctor.isPublic": { $ne: false },
      "doctor.archivedAt": null,
      roleCode: { $in: ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"] },
      fullName: {
        $not: /مالك النظام|System Owner|طبيب اختبار|Test Doctor/i,
      },
    };
    if (Types.ObjectId.isValid(id)) {
      filter._id = id;
    } else {
      filter["doctor.slug"] = id;
    }
    const doctor = await this.users
      .findOne(filter)
      .select("fullName doctor")
      .lean();
    if (!doctor) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الطبيب غير موجود",
      });
    }
    return { ok: true, doctor: this.serializePublic(doctor as never) };
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
      await this.audit.write({
        actor,
        action: "DOCTOR_CREATED",
        entityType: "User",
        entityId: String(created._id),
        newValue: {
          fullName: created.fullName,
          email: created.email,
          roleCode,
          type: dto.type,
        },
      });

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
    await this.audit.write({
      actor,
      action: "DOCTOR_UPDATED",
      entityType: "User",
      entityId: String(target._id),
      newValue: {
        email: target.email,
        phone: target.phone,
        passwordChanged: Boolean(dto.newPassword),
      },
    });
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
    await this.audit.write({
      actor,
      action: "DOCTOR_DEACTIVATED",
      entityType: "User",
      entityId: String(target._id),
    });
    return { ok: true, message: "تم تعطيل الحساب بنجاح." };
  }
}
