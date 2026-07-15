import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { createHash, randomBytes } from "crypto";
import {
  StaffInvitation,
} from "./schemas/staff-invitation.schema";
import { AuditLog } from "./schemas/auth.schemas";
import type { AuthUser } from "../common/auth/session.guard";
import { CreateStaffInvitationDto } from "./dto/invitation.dto";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  normalizeEmail,
  toCanonicalPhone,
  normalizePhoneDigits,
} from "@alwisam/shared-validation";

function hashToken(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

@Injectable()
export class StaffInvitationsService {
  constructor(
    @InjectModel(StaffInvitation.name)
    private readonly invitations: Model<StaffInvitation>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
  ) {}

  async create(dto: CreateStaffInvitationDto, actor: AuthUser) {
    if (dto.role !== "DOCTOR" && dto.role !== "SECRETARY") {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "الدور غير مسموح به في الدعوة.",
      });
    }
    if (!dto.email && !dto.phone) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يلزم البريد أو الهاتف في الدعوة.",
      });
    }

    const rawToken = randomBytes(32).toString("hex");
    const hours = Math.min(168, Math.max(1, Number(dto.expiresInHours) || 72));
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
    const phoneCanonical = dto.phone
      ? toCanonicalPhone(dto.phone) || normalizePhoneDigits(dto.phone)
      : undefined;
    const email = dto.email ? normalizeEmail(dto.email) : undefined;

    const inv = await this.invitations.create({
      tokenHash: hashToken(rawToken),
      role: dto.role,
      doctorType:
        dto.role === "DOCTOR" ? dto.doctorType || "GENERAL" : undefined,
      email,
      phoneCanonical,
      fullName: dto.fullName?.trim(),
      createdBy: new Types.ObjectId(actor.id),
      expiresAt,
      status: "pending",
      scheduleDraft:
        dto.role === "SECRETARY"
          ? {
              shiftCode: "CUSTOM",
              workStartTime: dto.workStartTime || "07:00",
              workEndTime: dto.workEndTime || "14:30",
              workDays: dto.workDays || "SUN,MON,TUE,WED,THU,SAT",
            }
          : undefined,
    });

    await this.auditLogs.create({
      userId: new Types.ObjectId(actor.id),
      roleCode: actor.roleCode,
      action: "STAFF_INVITATION_CREATED",
      entityType: "StaffInvitation",
      entityId: String(inv._id),
      newValue: { role: dto.role, email, phoneCanonical },
    });

    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000";
    const locale = "ar";
    const inviteUrl = `${base.replace(/\/$/, "")}/${locale}/auth/register?invitation=${rawToken}`;

    return {
      ok: true,
      message: "تم إنشاء الدعوة.",
      invitation: {
        id: String(inv._id),
        role: inv.role,
        email: inv.email,
        phoneCanonical: inv.phoneCanonical,
        fullName: inv.fullName,
        expiresAt: inv.expiresAt,
        status: inv.status,
      },
      // Raw token returned once for admin to share securely.
      invitationToken: rawToken,
      inviteUrl,
    };
  }

  async list() {
    const rows = await this.invitations
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return {
      ok: true,
      invitations: rows.map((r) => ({
        id: String(r._id),
        role: r.role,
        doctorType: r.doctorType,
        email: r.email,
        phoneCanonical: r.phoneCanonical,
        fullName: r.fullName,
        status: r.status,
        expiresAt: r.expiresAt,
        acceptedAt: r.acceptedAt,
        revokedAt: r.revokedAt,
        createdAt: (r as { createdAt?: Date }).createdAt,
      })),
    };
  }

  async revoke(id: string, actor: AuthUser) {
    const inv = await this.invitations.findById(id);
    if (!inv) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الدعوة غير موجودة",
      });
    }
    if (inv.status !== "pending") {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن إلغاء هذه الدعوة.",
      });
    }
    inv.status = "revoked";
    inv.revokedAt = new Date();
    inv.revokedBy = new Types.ObjectId(actor.id);
    await inv.save();
    await this.auditLogs.create({
      userId: new Types.ObjectId(actor.id),
      roleCode: actor.roleCode,
      action: "STAFF_INVITATION_REVOKED",
      entityType: "StaffInvitation",
      entityId: id,
    });
    return { ok: true, message: "تم إلغاء الدعوة." };
  }

  async resend(id: string, actor: AuthUser) {
    const existing = await this.invitations.findById(id);
    if (!existing) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الدعوة غير موجودة",
      });
    }
    // Revoke old pending invitation and create a fresh token.
    if (existing.status === "pending") {
      existing.status = "revoked";
      existing.revokedAt = new Date();
      existing.revokedBy = new Types.ObjectId(actor.id);
      await existing.save();
    }
    return this.create(
      {
        role: existing.role,
        doctorType: existing.doctorType,
        fullName: existing.fullName,
        email: existing.email,
        phone: existing.phoneCanonical,
        workStartTime: existing.scheduleDraft?.workStartTime,
        workEndTime: existing.scheduleDraft?.workEndTime,
        workDays: existing.scheduleDraft?.workDays,
      },
      actor,
    );
  }
}
