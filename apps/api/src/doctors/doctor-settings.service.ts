import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { basename, join } from "path";
import { Model } from "mongoose";
import { User, type UserDocument } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  UpdateDoctorNotificationsDto,
  UpdateDoctorPersonalDto,
  UpdateDoctorPreferencesDto,
  UpdateDoctorProfessionalDto,
  UpdateDoctorScheduleDto,
} from "./dto/doctor-settings.dto";

const DEFAULT_NOTIFICATIONS = {
  appointmentNotifications: true,
  patientWaitingNotifications: true,
  staffMessageNotifications: true,
  followUpReminders: true,
  scheduleChanges: true,
  securityAlerts: true,
  inAppNotifications: true,
  soundNotifications: true,
  emailNotifications: false,
};

const DEFAULT_PREFERENCES = {
  dateFormat: "dd/MM/yyyy" as const,
  timeFormat: "24h" as const,
  reducedMotion: false,
  compactDashboard: false,
  notificationSound: true,
};

@Injectable()
export class DoctorSettingsService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
  ) {}

  private async loadDoctor(userId: string): Promise<UserDocument> {
    const user = await this.users.findOne({
      _id: userId,
      deletedAt: null,
      status: "ACTIVE",
      doctor: { $exists: true },
    });
    if (!user?.doctor) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "تعذر العثور على ملف الطبيب المرتبط بالحساب.",
      });
    }
    return user;
  }

  private safePayload(user: UserDocument) {
    const doctor = user.doctor!;
    return {
      ok: true,
      settings: {
        personal: {
          fullName: user.fullName,
          email: user.email || "",
          phone: user.phone || "",
          locale: user.locale || "ar",
          address: user.address || "",
          emailVerified: Boolean(user.emailVerified),
        },
        professional: {
          type: doctor.type,
          specialtyAr: doctor.specialtyAr || "",
          specialtyEn: doctor.specialtyEn || "",
          specialtyFr: doctor.specialtyFr || "",
          professionalTitleAr: doctor.professionalTitleAr || "",
          professionalTitleEn: doctor.professionalTitleEn || "",
          professionalTitleFr: doctor.professionalTitleFr || "",
          shortDescriptionAr: doctor.shortDescriptionAr || "",
          bioAr: doctor.bioAr || "",
          bioEn: doctor.bioEn || "",
          bioFr: doctor.bioFr || "",
          licenseNumber: doctor.licenseNumber || "",
          yearsExperience: doctor.yearsExperience,
          languages: Array.isArray(doctor.languages) ? doctor.languages : [],
          specialtyIds: Array.isArray(doctor.specialtyIds)
            ? doctor.specialtyIds
            : [],
          serviceIds: Array.isArray(doctor.serviceIds) ? doctor.serviceIds : [],
          isPublic: doctor.isPublic !== false,
          isBookable: doctor.isBookable !== false,
        },
        avatar: {
          url: doctor.profileImage || "",
        },
        schedule: {
          timezone: "Africa/Algiers",
          workingHours: Array.isArray(doctor.workingHours)
            ? doctor.workingHours
            : [],
          appointmentDurationMinutes:
            doctor.appointmentDurationMinutes || 30,
          leaveDates: Array.isArray(doctor.leaveDates)
            ? doctor.leaveDates
            : [],
        },
        notifications: {
          ...DEFAULT_NOTIFICATIONS,
          ...(user.notificationPreferences || {}),
        },
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(user.preferences || {}),
          locale: user.locale || "ar",
        },
      },
    };
  }

  async get(actor: AuthUser) {
    return this.safePayload(await this.loadDoctor(actor.id));
  }

  async updatePersonal(dto: UpdateDoctorPersonalDto, actor: AuthUser) {
    const user = await this.loadDoctor(actor.id);
    const conflicts: Array<Record<string, unknown>> = [];
    if (dto.email && dto.email !== user.email) {
      conflicts.push({ emailNormalized: dto.email });
      conflicts.push({ email: dto.email });
    }
    if (dto.phone && dto.phone !== user.phone) {
      conflicts.push({ phoneCanonical: dto.phone });
      conflicts.push({ phone: dto.phone });
    }
    if (conflicts.length) {
      const existing = await this.users
        .findOne({
          _id: { $ne: user._id },
          deletedAt: null,
          $or: conflicts,
        })
        .select("email emailNormalized phone phoneCanonical")
        .lean();
      if (existing) {
        const emailTaken =
          Boolean(dto.email) &&
          (existing.email?.toLowerCase() === dto.email ||
            existing.emailNormalized === dto.email);
        throw new ConflictException({
          code: emailTaken
            ? ErrorCodes.DUPLICATE_EMAIL
            : ErrorCodes.DUPLICATE_PHONE,
          message: emailTaken
            ? "البريد الإلكتروني مستخدم في حساب آخر."
            : "رقم الهاتف مستخدم في حساب آخر.",
          fieldErrors: emailTaken
            ? { email: ["البريد الإلكتروني مستخدم في حساب آخر."] }
            : { phone: ["رقم الهاتف مستخدم في حساب آخر."] },
        });
      }
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) {
      const emailChanged = dto.email !== user.email;
      user.email = dto.email;
      user.emailNormalized = dto.email;
      if (emailChanged) user.emailVerified = false;
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone;
      user.phoneCanonical = dto.phone;
    }
    if (dto.locale !== undefined) user.locale = dto.locale;
    if (dto.address !== undefined) user.address = dto.address;
    await user.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_PERSONAL_SETTINGS_UPDATED",
      entityType: "User",
      entityId: actor.id,
      newValue: {
        fullNameUpdated: dto.fullName !== undefined,
        emailUpdated: dto.email !== undefined,
        phoneUpdated: dto.phone !== undefined,
        locale: user.locale,
      },
    });
    return {
      ...this.safePayload(user),
      message: "تم حفظ المعلومات الشخصية.",
    };
  }

  async updateProfessional(
    dto: UpdateDoctorProfessionalDto,
    actor: AuthUser,
  ) {
    const user = await this.loadDoctor(actor.id);
    Object.assign(user.doctor!, dto);
    user.markModified("doctor");
    await user.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_PROFESSIONAL_SETTINGS_UPDATED",
      entityType: "User",
      entityId: actor.id,
      newValue: {
        fields: Object.keys(dto),
      },
    });
    return {
      ...this.safePayload(user),
      message: "تم حفظ الملف المهني.",
    };
  }

  private validateSchedule(dto: UpdateDoctorScheduleDto) {
    const byDay = new Map<string, Array<{ start: number; end: number }>>();
    const toMinutes = (value: string) => {
      const [hours, minutes] = value.split(":").map(Number);
      return hours * 60 + minutes;
    };
    for (const window of dto.workingHours) {
      if (window.isActive === false) continue;
      const start = toMinutes(window.startTime);
      const end = toMinutes(window.endTime);
      if (end <= start) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "يجب أن يكون وقت نهاية الدوام بعد وقت البداية.",
        });
      }
      const rows = byDay.get(window.dayOfWeek) || [];
      rows.push({ start, end });
      byDay.set(window.dayOfWeek, rows);
    }
    for (const rows of byDay.values()) {
      rows.sort((a, b) => a.start - b.start);
      for (let index = 1; index < rows.length; index += 1) {
        if (rows[index].start < rows[index - 1].end) {
          throw new BadRequestException({
            code: ErrorCodes.VALIDATION_ERROR,
            message: "فترات الدوام في اليوم نفسه متداخلة.",
          });
        }
      }
    }
  }

  async updateSchedule(dto: UpdateDoctorScheduleDto, actor: AuthUser) {
    this.validateSchedule(dto);
    const user = await this.loadDoctor(actor.id);
    user.doctor!.workingHours = dto.workingHours.map((window) => ({
      dayOfWeek: window.dayOfWeek,
      startTime: window.startTime,
      endTime: window.endTime,
      isActive: window.isActive !== false,
    }));
    user.doctor!.appointmentDurationMinutes = dto.appointmentDurationMinutes;
    user.doctor!.leaveDates = [...new Set(dto.leaveDates || [])].sort();
    user.markModified("doctor");
    await user.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_SCHEDULE_UPDATED",
      entityType: "User",
      entityId: actor.id,
      newValue: {
        windows: user.doctor!.workingHours.length,
        appointmentDurationMinutes: dto.appointmentDurationMinutes,
        leaveDays: user.doctor!.leaveDates.length,
        timezone: "Africa/Algiers",
      },
    });
    return {
      ...this.safePayload(user),
      message: "تم حفظ مواعيد العمل.",
    };
  }

  async updateNotifications(
    dto: UpdateDoctorNotificationsDto,
    actor: AuthUser,
  ) {
    const user = await this.loadDoctor(actor.id);
    user.notificationPreferences = {
      ...dto,
      emailNotifications:
        process.env.EMAIL_PROVIDER_CONFIGURED === "true"
          ? Boolean(dto.emailNotifications)
          : false,
    };
    user.markModified("notificationPreferences");
    await user.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_NOTIFICATION_SETTINGS_UPDATED",
      entityType: "User",
      entityId: actor.id,
    });
    return {
      ...this.safePayload(user),
      message: "تم حفظ إعدادات الإشعارات.",
    };
  }

  async updatePreferences(
    dto: UpdateDoctorPreferencesDto,
    actor: AuthUser,
  ) {
    const user = await this.loadDoctor(actor.id);
    user.locale = dto.locale;
    user.preferences = {
      dateFormat: dto.dateFormat,
      timeFormat: dto.timeFormat,
      reducedMotion: dto.reducedMotion,
      compactDashboard: dto.compactDashboard,
      notificationSound: dto.notificationSound,
    };
    user.markModified("preferences");
    await user.save({ validateModifiedOnly: true });
    await this.audit.write({
      actor,
      action: "DOCTOR_ACCOUNT_PREFERENCES_UPDATED",
      entityType: "User",
      entityId: actor.id,
      newValue: { locale: dto.locale },
    });
    return {
      ...this.safePayload(user),
      message: "تم حفظ تفضيلات الحساب.",
    };
  }

  private imageDimensions(buffer: Buffer, mimeType: string) {
    if (mimeType === "image/png" && buffer.length >= 24) {
      const signature = buffer.subarray(0, 8).toString("hex");
      if (signature !== "89504e470d0a1a0a") return null;
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
        extension: ".png",
      };
    }
    if (
      mimeType === "image/jpeg" &&
      buffer.length > 4 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8
    ) {
      let offset = 2;
      while (offset + 9 < buffer.length) {
        if (buffer[offset] !== 0xff) {
          offset += 1;
          continue;
        }
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        if (
          [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb].includes(
            marker,
          )
        ) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7),
            extension: ".jpg",
          };
        }
        if (length < 2) break;
        offset += 2 + length;
      }
    }
    return null;
  }

  private avatarDirectory() {
    const root = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
    const directory = join(root, "doctor-avatars");
    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
    return directory;
  }

  private deleteOwnedAvatar(reference?: string) {
    if (!reference?.startsWith("/uploads/doctor-avatars/")) return;
    const file = join(this.avatarDirectory(), basename(reference));
    if (existsSync(file)) unlinkSync(file);
  }

  async updateAvatar(
    file: { buffer: Buffer; mimetype: string; size: number },
    actor: AuthUser,
  ) {
    const dimensions = this.imageDimensions(file.buffer, file.mimetype);
    if (!dimensions) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "ملف الصورة غير صالح. استخدم JPEG أو PNG.",
      });
    }
    if (
      dimensions.width < 128 ||
      dimensions.height < 128 ||
      dimensions.width > 4096 ||
      dimensions.height > 4096
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "أبعاد الصورة يجب أن تكون بين 128 و4096 بكسل.",
      });
    }
    const user = await this.loadDoctor(actor.id);
    const previous = user.doctor!.profileImage;
    const filename = `${randomUUID()}${dimensions.extension}`;
    const storedFile = join(this.avatarDirectory(), filename);
    writeFileSync(storedFile, file.buffer, {
      flag: "wx",
    });
    try {
      user.doctor!.profileImage = `/uploads/doctor-avatars/${filename}`;
      user.markModified("doctor");
      await user.save({ validateModifiedOnly: true });
    } catch (error) {
      if (existsSync(storedFile)) unlinkSync(storedFile);
      throw error;
    }
    this.deleteOwnedAvatar(previous);
    await this.audit.write({
      actor,
      action: "DOCTOR_AVATAR_UPDATED",
      entityType: "User",
      entityId: actor.id,
      newValue: {
        mimeType: file.mimetype,
        sizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
      },
    });
    return {
      ...this.safePayload(user),
      message: "تم تحديث الصورة الشخصية.",
    };
  }

  async removeAvatar(actor: AuthUser) {
    const user = await this.loadDoctor(actor.id);
    const previous = user.doctor!.profileImage;
    user.doctor!.profileImage = "";
    user.markModified("doctor");
    await user.save({ validateModifiedOnly: true });
    this.deleteOwnedAvatar(previous);
    await this.audit.write({
      actor,
      action: "DOCTOR_AVATAR_REMOVED",
      entityType: "User",
      entityId: actor.id,
    });
    return {
      ...this.safePayload(user),
      message: "تم حذف الصورة الشخصية.",
    };
  }
}
