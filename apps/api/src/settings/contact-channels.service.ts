import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  ReorderContactChannelsDto,
  UpsertContactChannelDto,
} from "./dto/contact-channel.dto";
import {
  ContactChannel,
  ContactChannelDocument,
  type ContactChannelPlacement,
  type ContactChannelType,
} from "./schemas/contact-channel.schema";

type ChannelRow = ContactChannel & {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class ContactChannelsService {
  constructor(
    @InjectModel(ContactChannel.name)
    private readonly channels: Model<ContactChannelDocument>,
    private readonly audit: AuditService,
  ) {}

  private validationError(message: string): never {
    throw new BadRequestException({
      code: ErrorCodes.VALIDATION_ERROR,
      message,
    });
  }

  private validateUrl(type: ContactChannelType, raw: string): string {
    const value = raw.trim();
    if (/^(?:javascript|data|file):/i.test(value)) {
      return this.validationError("رابط وسيلة التواصل غير آمن.");
    }

    if (type === "phone") {
      if (!/^tel:\+[1-9]\d{7,14}$/.test(value)) {
        return this.validationError(
          "رابط الهاتف يجب أن يكون بصيغة دولية مثل tel:+213...",
        );
      }
      return value;
    }
    if (type === "email") {
      if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value)) {
        return this.validationError("رابط البريد الإلكتروني غير صالح.");
      }
      return value;
    }
    if (type === "viber") {
      if (!/^viber:\/\/chat\?number=%?\+?\d{8,15}$/i.test(value)) {
        return this.validationError("رابط Viber غير صالح.");
      }
      return value;
    }

    let url: URL;
    try {
      url = new URL(value);
    } catch {
      return this.validationError("الرابط العام غير صالح.");
    }
    if (url.protocol !== "https:") {
      return this.validationError("يجب استخدام رابط HTTPS آمن.");
    }

    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const allowedHosts: Partial<Record<ContactChannelType, string[]>> = {
      whatsapp: ["wa.me", "api.whatsapp.com"],
      instagram: ["instagram.com"],
      messenger: ["m.me", "messenger.com"],
      telegram: ["t.me", "telegram.me"],
    };
    const allowed = allowedHosts[type];
    if (
      allowed &&
      !allowed.some((candidate) =>
        host === candidate || host.endsWith(`.${candidate}`),
      )
    ) {
      return this.validationError("الرابط لا يطابق نوع وسيلة التواصل.");
    }
    if (
      type === "whatsapp" &&
      !/^\/\d{8,15}\/?$/.test(url.pathname)
    ) {
      return this.validationError("رقم واتساب في الرابط غير صالح.");
    }
    return url.toString();
  }

  private map(dto: UpsertContactChannelDto, actor: AuthUser) {
    return {
      type: dto.type,
      labelAr: dto.labelAr.trim(),
      labelEn: dto.labelEn?.trim() || undefined,
      labelFr: dto.labelFr?.trim() || undefined,
      value: dto.value.trim(),
      publicUrl: this.validateUrl(dto.type, dto.publicUrl),
      icon: dto.icon?.trim() || dto.type,
      isEnabled: dto.isEnabled !== false,
      isPrimary: dto.isPrimary === true,
      displayOrder: dto.displayOrder ?? 0,
      placement: [...new Set(dto.placement)],
      updatedBy: new Types.ObjectId(actor.id),
    };
  }

  private serialize(row: ChannelRow) {
    return {
      id: String(row._id),
      type: row.type,
      labelAr: row.labelAr,
      labelEn: row.labelEn || "",
      labelFr: row.labelFr || "",
      value: row.value,
      publicUrl: row.publicUrl,
      icon: row.icon || row.type,
      isEnabled: row.isEnabled === true,
      isPrimary: row.isPrimary === true,
      displayOrder: row.displayOrder ?? 0,
      placement: row.placement || [],
      archivedAt: row.archivedAt || null,
      createdAt: row.createdAt || null,
      updatedAt: row.updatedAt || null,
    };
  }

  async listPublic(placement?: ContactChannelPlacement) {
    const filter: Record<string, unknown> = {
      archivedAt: null,
      isEnabled: true,
    };
    if (placement) filter.placement = placement;
    const rows = await this.channels
      .find(filter)
      .sort({ isPrimary: -1, displayOrder: 1, createdAt: 1 })
      .limit(30)
      .lean();
    return {
      ok: true,
      channels: rows.map((row) => {
        const item = this.serialize(row as unknown as ChannelRow);
        return {
          id: item.id,
          type: item.type,
          labelAr: item.labelAr,
          labelEn: item.labelEn,
          labelFr: item.labelFr,
          value: item.value,
          publicUrl: item.publicUrl,
          icon: item.icon,
          isPrimary: item.isPrimary,
          displayOrder: item.displayOrder,
          placement: item.placement,
        };
      }),
    };
  }

  async listAdmin(archived = false) {
    const rows = await this.channels
      .find(archived ? { archivedAt: { $ne: null } } : { archivedAt: null })
      .sort({ displayOrder: 1, createdAt: 1 })
      .lean();
    return {
      ok: true,
      channels: rows.map((row) =>
        this.serialize(row as unknown as ChannelRow),
      ),
    };
  }

  async create(dto: UpsertContactChannelDto, actor: AuthUser) {
    const payload = this.map(dto, actor);
    const created = await this.channels.create({
      ...payload,
      createdBy: new Types.ObjectId(actor.id),
      archivedAt: null,
    });
    if (created.isPrimary) {
      await this.channels.updateMany(
        { _id: { $ne: created._id }, archivedAt: null },
        { $set: { isPrimary: false } },
      );
    }
    await this.audit.write({
      actor,
      action: "contact_channel.created",
      entityType: "ContactChannel",
      entityId: String(created._id),
    });
    return {
      ok: true,
      channel: this.serialize(created.toObject() as ChannelRow),
    };
  }

  async update(id: string, dto: UpsertContactChannelDto, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      return this.validationError("معرّف وسيلة التواصل غير صالح.");
    }
    const payload = this.map(dto, actor);
    const row = await this.channels.findOneAndUpdate(
      { _id: id, archivedAt: null },
      { $set: payload },
      { new: true },
    );
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "وسيلة التواصل غير موجودة.",
      });
    }
    if (row.isPrimary) {
      await this.channels.updateMany(
        { _id: { $ne: row._id }, archivedAt: null },
        { $set: { isPrimary: false } },
      );
    }
    await this.audit.write({
      actor,
      action: "contact_channel.updated",
      entityType: "ContactChannel",
      entityId: id,
    });
    return {
      ok: true,
      channel: this.serialize(row.toObject() as ChannelRow),
    };
  }

  async setEnabled(id: string, enabled: boolean, actor: AuthUser) {
    const row = await this.load(id);
    row.isEnabled = enabled;
    if (!enabled) row.isPrimary = false;
    row.updatedBy = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: enabled
        ? "contact_channel.enabled"
        : "contact_channel.disabled",
      entityType: "ContactChannel",
      entityId: id,
    });
    return { ok: true };
  }

  async makePrimary(id: string, actor: AuthUser) {
    const row = await this.load(id);
    if (!row.isEnabled) {
      return this.validationError(
        "يجب تفعيل وسيلة التواصل قبل جعلها أساسية.",
      );
    }
    await this.channels.updateMany(
      { _id: { $ne: row._id }, archivedAt: null },
      { $set: { isPrimary: false } },
    );
    row.isPrimary = true;
    row.updatedBy = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "contact_channel.primary",
      entityType: "ContactChannel",
      entityId: id,
    });
    return { ok: true };
  }

  async archive(id: string, actor: AuthUser) {
    const row = await this.load(id);
    row.archivedAt = new Date();
    row.isEnabled = false;
    row.isPrimary = false;
    row.updatedBy = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "contact_channel.archived",
      entityType: "ContactChannel",
      entityId: id,
    });
    return { ok: true };
  }

  async restore(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      return this.validationError("معرّف وسيلة التواصل غير صالح.");
    }
    const row = await this.channels.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "وسيلة التواصل غير موجودة.",
      });
    }
    row.archivedAt = null;
    row.updatedBy = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "contact_channel.restored",
      entityType: "ContactChannel",
      entityId: id,
    });
    return { ok: true };
  }

  async reorder(dto: ReorderContactChannelsDto, actor: AuthUser) {
    await this.channels.bulkWrite(
      dto.orderedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(id), archivedAt: null },
          update: {
            $set: {
              displayOrder: index,
              updatedBy: new Types.ObjectId(actor.id),
            },
          },
        },
      })),
    );
    await this.audit.write({
      actor,
      action: "contact_channel.reordered",
      entityType: "ContactChannel",
      newValue: { count: dto.orderedIds.length },
    });
    return { ok: true };
  }

  private async load(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return this.validationError("معرّف وسيلة التواصل غير صالح.");
    }
    const row = await this.channels.findOne({ _id: id, archivedAt: null });
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "وسيلة التواصل غير موجودة.",
      });
    }
    return row;
  }
}
