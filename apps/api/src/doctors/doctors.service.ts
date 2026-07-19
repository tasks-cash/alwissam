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
  ChangeDoctorPasswordDto,
  CreateDoctorDto,
  DeleteDoctorDto,
  ListDoctorsQueryDto,
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

  async list(query: ListDoctorsQueryDto = new ListDoctorsQueryDto()) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const filter: Record<string, unknown> = {
      deletedAt: null,
      roleCode: {
        $in: [
          "DOCTOR_GENERAL",
          "DOCTOR_SPECIALIST",
          "ADMIN",
          "ADMIN_OWNER",
          "OWNER",
        ],
      },
      doctor: { $exists: true },
    };
    if (query.search?.trim()) {
      const search = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "doctor.specialtyAr": { $regex: search, $options: "i" } },
      ];
    }
    if (query.type) filter["doctor.type"] = query.type;
    if (query.status === "ARCHIVED") {
      filter["doctor.archivedAt"] = { $ne: null };
    } else {
      filter["doctor.archivedAt"] = null;
      if (query.status) filter.status = query.status;
    }
    if (query.public !== undefined) {
      filter["doctor.isPublic"] =
        query.public === "true" ? { $ne: false } : false;
    }

    const sortField =
      query.sort === "createdAt"
        ? "createdAt"
        : query.sort === "specialty"
          ? "doctor.specialtyAr"
          : query.sort === "status"
            ? "status"
            : "fullName";
    const sort = { [sortField]: query.order === "desc" ? -1 : 1 } as Record<
      string,
      1 | -1
    >;
    const [doctors, total] = await Promise.all([
      this.users
        .find(filter)
        .select(
          "fullName email phone roleCode status doctor createdAt updatedAt lastLoginAt",
        )
        .sort(sort)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      this.users.countDocuments(filter),
    ]);

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
        professionalTitleAr: d.doctor?.professionalTitleAr,
        bioAr: d.doctor?.bioAr,
        isPublic: d.doctor?.isPublic !== false,
        isBookable: d.doctor?.isBookable !== false,
        isOwner:
          d.roleCode === "ADMIN" ||
          d.roleCode === "ADMIN_OWNER" ||
          d.roleCode === "OWNER",
        isActive: d.doctor?.isActive !== false && d.status === "ACTIVE",
        profileImage: d.doctor?.profileImage,
        specialtyIds: d.doctor?.specialtyIds || [],
        serviceIds: d.doctor?.serviceIds || [],
        weeklySchedule: d.doctor?.weeklySchedule || [],
        archivedAt: d.doctor?.archivedAt || null,
        createdAt: (d as { createdAt?: Date }).createdAt,
        updatedAt: (d as { updatedAt?: Date }).updatedAt,
        lastLoginAt: (d as { lastLoginAt?: Date }).lastLoginAt,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
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

  private assertValidSchedule(
    schedule?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      isActive?: boolean;
    }>,
  ) {
    if (!schedule) return;
    const byDay = new Map<string, Array<{ start: number; end: number }>>();
    for (const entry of schedule.filter((item) => item.isActive !== false)) {
      const toMinutes = (value: string) => {
        const [hours, minutes] = value.split(":").map(Number);
        return hours * 60 + minutes;
      };
      const start = toMinutes(entry.startTime);
      const end = toMinutes(entry.endTime);
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "وقت نهاية الدوام يجب أن يكون بعد وقت البداية.",
          fieldErrors: { weeklySchedule: ["تحقق من أوقات بداية ونهاية الدوام."] },
        });
      }
      const periods = byDay.get(entry.dayOfWeek) || [];
      if (periods.some((period) => start < period.end && end > period.start)) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "لا يمكن حفظ ورديات متداخلة في اليوم نفسه.",
          fieldErrors: { weeklySchedule: ["توجد ورديات متداخلة."] },
        });
      }
      periods.push({ start, end });
      byDay.set(entry.dayOfWeek, periods);
    }
  }

  async create(dto: CreateDoctorDto, actor: AuthUser) {
    await this.assertUniqueEmailPhone(dto.email, dto.phone);
    this.assertValidSchedule(dto.weeklySchedule);

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
          professionalTitleAr: dto.professionalTitleAr,
          bioAr: dto.bioAr,
          profileImage: dto.profileImage,
          specialtyIds: dto.specialtyIds || [],
          serviceIds: dto.serviceIds || [],
          weeklySchedule: dto.weeklySchedule || [],
          colorCode: dto.type === "SPECIALIST" ? "#0F9A9A" : "#176B87",
          isActive: true,
          isPublic: dto.isPublic === true,
          isBookable: dto.isBookable !== false,
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
          doctor: created.doctor,
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

    const oldValue = {
      fullName: target.fullName,
      email: target.email,
      phone: target.phone,
      roleCode: target.roleCode,
      status: target.status,
      doctor: target.doctor ? { ...target.doctor } : undefined,
    };

    if (dto.newPassword) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "إعادة تعيين كلمة المرور إجراء مستقل ومحمي.",
        fieldErrors: {
          newPassword: ["استخدم إجراء إعادة تعيين كلمة المرور."],
        },
      });
    }
    this.assertValidSchedule(dto.weeklySchedule);

    if (dto.fullName) target.fullName = dto.fullName;
    if (dto.email) target.email = dto.email;
    if (dto.phone) target.phone = dto.phone;

    if (!target.doctor) {
      target.doctor = { type: "GENERAL", isActive: true };
    }
    if (dto.type !== undefined) {
      target.doctor.type = dto.type;
      target.roleCode =
        dto.type === "SPECIALIST" ? "DOCTOR_SPECIALIST" : "DOCTOR_GENERAL";
    }
    if (dto.specialtyAr !== undefined) {
      target.doctor.specialtyAr = dto.specialtyAr;
    }
    if (dto.professionalTitleAr !== undefined) {
      target.doctor.professionalTitleAr = dto.professionalTitleAr;
    }
    if (dto.bioAr !== undefined) {
      target.doctor.bioAr = dto.bioAr;
    }
    if (dto.isPublic !== undefined) {
      target.doctor.isPublic = dto.isPublic;
    }
    if (dto.isBookable !== undefined) {
      target.doctor.isBookable = dto.isBookable;
    }
    if (dto.profileImage !== undefined) {
      target.doctor.profileImage = dto.profileImage;
    }
    if (dto.specialtyIds !== undefined) {
      target.doctor.specialtyIds = dto.specialtyIds;
    }
    if (dto.serviceIds !== undefined) {
      target.doctor.serviceIds = dto.serviceIds;
    }
    if (dto.weeklySchedule !== undefined) {
      target.doctor.weeklySchedule = dto.weeklySchedule;
      target.doctor.workingHours = dto.weeklySchedule;
    }
    if (dto.status === "INACTIVE") {
      target.status = "INACTIVE";
      target.doctor.isActive = false;
      await this.sessions.updateMany(
        { userId: target._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    } else if (dto.status === "ACTIVE") {
      target.status = "ACTIVE";
      target.doctor.isActive = true;
    }
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_UPDATED",
      entityType: "User",
      entityId: String(target._id),
      oldValue,
      newValue: {
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        roleCode: target.roleCode,
        status: target.status,
        specialtyAr: target.doctor?.specialtyAr,
        bioUpdated: dto.bioAr !== undefined,
        scheduleChanged: dto.weeklySchedule !== undefined,
      },
    });
    return {
      ok: true,
      message: "تم حفظ التعديلات بنجاح.",
      doctor: {
        id: String(target._id),
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        roleCode: target.roleCode,
        status: target.status,
        ...target.doctor,
      },
    };
  }

  async resetPassword(dto: ChangeDoctorPasswordDto, actor: AuthUser) {
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف الطبيب غير صالح.",
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
    target.passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    target.failedLoginCount = 0;
    target.lockedUntil = null;
    await target.save({ validateModifiedOnly: true });
    await this.sessions.updateMany(
      { userId: target._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "DOCTOR_PASSWORD_RESET",
      entityType: "User",
      entityId: String(target._id),
      newValue: { sessionsRevoked: true },
    });
    return {
      ok: true,
      message: "تم تعيين كلمة مرور مؤقتة وإنهاء الجلسات السابقة.",
    };
  }

  async restore(dto: DeleteDoctorDto, actor: AuthUser) {
    if (!Types.ObjectId.isValid(dto.userId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف الطبيب غير صالح.",
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
    if (!target.doctor) target.doctor = { type: "GENERAL" };
    target.doctor.archivedAt = null;
    target.doctor.isActive = true;
    target.status = "ACTIVE";
    await target.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_RESTORED",
      entityType: "User",
      entityId: String(target._id),
      newValue: { status: "ACTIVE", archivedAt: null },
    });
    return { ok: true, message: "تمت استعادة الطبيب بنجاح." };
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
    if (
      target.roleCode === "ADMIN" ||
      target.roleCode === "ADMIN_OWNER" ||
      target.roleCode === "OWNER" ||
      target.roleCode === "SUPER_ADMIN"
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن تعطيل حساب مالك العيادة الأساسي.",
      });
    }

    target.status = "INACTIVE";
    if (target.doctor) {
      target.doctor.isActive = false;
      target.doctor.isPublic = false;
      target.doctor.isBookable = false;
      target.doctor.archivedAt = new Date();
    }
    await target.save();
    await this.sessions.updateMany(
      { userId: target._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "DOCTOR_ARCHIVED",
      entityType: "User",
      entityId: String(target._id),
      newValue: {
        status: "INACTIVE",
        public: false,
        bookable: false,
        archivedAt: target.doctor?.archivedAt,
      },
    });
    return {
      ok: true,
      message:
        "تمت أرشفة الطبيب. حُفظت المواعيد والسجلات السابقة، وعُطّل تسجيل الدخول والظهور العام.",
    };
  }
}
