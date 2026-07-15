import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import {
  ListBeforeAfterQueryDto,
  UpsertBeforeAfterDto,
} from "./dto/before-after.dto";
import {
  BeforeAfterCase,
  BeforeAfterCaseDocument,
} from "./schemas/before-after-case.schema";

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@Injectable()
export class BeforeAfterService {
  constructor(
    @InjectModel(BeforeAfterCase.name)
    private readonly cases: Model<BeforeAfterCaseDocument>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
  ) {}

  private assertCanPublish(doc: {
    consentConfirmed?: boolean;
    isApproved?: boolean;
    beforeImageUrl?: string;
    afterImageUrl?: string;
    titleAr?: string;
  }) {
    if (!doc.beforeImageUrl?.trim() || !doc.afterImageUrl?.trim()) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "صور قبل وبعد مطلوبة للنشر.",
        fieldErrors: {
          beforeImageUrl: ["Before image required."],
          afterImageUrl: ["After image required."],
        },
      });
    }
    if (!doc.consentConfirmed) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن النشر دون تأكيد موافقة المريض.",
        fieldErrors: { consentConfirmed: ["Consent required for publication."] },
      });
    }
    if (!doc.isApproved) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن النشر قبل اعتماد الحالة.",
        fieldErrors: { isApproved: ["Approval required for publication."] },
      });
    }
    if (!doc.titleAr?.trim()) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "العنوان بالعربية مطلوب.",
      });
    }
  }

  private adminSerialize(
    r: BeforeAfterCase & {
      _id: Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    },
    doctorName?: string,
  ) {
    return {
      id: String(r._id),
      titleAr: r.titleAr,
      titleEn: r.titleEn || "",
      titleFr: r.titleFr || "",
      descriptionAr: r.descriptionAr || "",
      descriptionEn: r.descriptionEn || "",
      descriptionFr: r.descriptionFr || "",
      beforeImageUrl: r.beforeImageUrl,
      afterImageUrl: r.afterImageUrl,
      beforeAltAr: r.beforeAltAr || "",
      beforeAltEn: r.beforeAltEn || "",
      beforeAltFr: r.beforeAltFr || "",
      afterAltAr: r.afterAltAr || "",
      afterAltEn: r.afterAltEn || "",
      afterAltFr: r.afterAltFr || "",
      doctorId: r.doctorId ? String(r.doctorId) : "",
      doctorName: doctorName || "",
      serviceSlug: r.serviceSlug || "",
      specialtySlug: r.specialtySlug || "",
      treatmentCategory: r.treatmentCategory || "",
      treatmentDuration: r.treatmentDuration || "",
      resultDate: r.resultDate || null,
      patientAgeRange: r.patientAgeRange || "",
      isAnonymous: r.isAnonymous !== false,
      isFeatured: r.isFeatured === true,
      isApproved: r.isApproved === true,
      isPublished: r.isPublished === true,
      displayOrder: r.displayOrder ?? 0,
      consentConfirmed: r.consentConfirmed === true,
      consentDocumentReference: r.consentDocumentReference || "",
      publishedAt: r.publishedAt || null,
      archivedAt: r.archivedAt || null,
      createdAt: r.createdAt || null,
      updatedAt: r.updatedAt || null,
      languages: {
        ar: Boolean(r.titleAr?.trim()),
        en: Boolean(r.titleEn?.trim()),
        fr: Boolean(r.titleFr?.trim()),
      },
      canPublish:
        r.consentConfirmed === true &&
        r.isApproved === true &&
        Boolean(r.beforeImageUrl?.trim()) &&
        Boolean(r.afterImageUrl?.trim()),
    };
  }

  private pickLocale(
    locale: string,
    ar?: string,
    en?: string,
    fr?: string,
  ): string {
    if (locale === "en") return en || ar || fr || "";
    if (locale === "fr") return fr || en || ar || "";
    return ar || en || fr || "";
  }

  async listAdmin(query: ListBeforeAfterQueryDto) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
    const filter: Record<string, unknown> = {};

    if (query.archived === "true") {
      filter.archivedAt = { $ne: null };
    } else if (query.archived !== "all") {
      filter.archivedAt = null;
    }
    if (query.approval === "approved") filter.isApproved = true;
    if (query.approval === "pending") filter.isApproved = false;
    if (query.publication === "published") filter.isPublished = true;
    if (query.publication === "draft") filter.isPublished = false;
    if (query.featured === "true") filter.isFeatured = true;
    if (query.featured === "false") filter.isFeatured = false;
    if (query.doctorId && Types.ObjectId.isValid(query.doctorId)) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }
    if (query.serviceSlug?.trim()) filter.serviceSlug = query.serviceSlug.trim();
    if (query.specialtySlug?.trim())
      filter.specialtySlug = query.specialtySlug.trim();
    if (query.q?.trim()) {
      const rx = new RegExp(esc(query.q.trim()), "i");
      filter.$or = [
        { titleAr: rx },
        { titleEn: rx },
        { titleFr: rx },
        { descriptionAr: rx },
        { treatmentCategory: rx },
      ];
    }

    const [total, rows] = await Promise.all([
      this.cases.countDocuments(filter),
      this.cases
        .find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    const doctorIds = [
      ...new Set(
        rows
          .map((r) => (r.doctorId ? String(r.doctorId) : ""))
          .filter(Boolean),
      ),
    ];
    const doctors = doctorIds.length
      ? await this.users
          .find({ _id: { $in: doctorIds } })
          .select("fullName")
          .lean()
      : [];
    const nameById = new Map(doctors.map((d) => [String(d._id), d.fullName]));

    return {
      ok: true,
      total,
      page,
      pageSize,
      cases: rows.map((r) =>
        this.adminSerialize(r as never, nameById.get(String(r.doctorId))),
      ),
    };
  }

  async getAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id).lean();
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    let doctorName = "";
    if (row.doctorId) {
      const d = await this.users
        .findById(row.doctorId)
        .select("fullName")
        .lean();
      doctorName = d?.fullName || "";
    }
    return { ok: true, case: this.adminSerialize(row as never, doctorName) };
  }

  async create(dto: UpsertBeforeAfterDto, actor: AuthUser) {
    if (!dto.beforeImageUrl?.trim() || !dto.afterImageUrl?.trim()) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "صور قبل وبعد مطلوبة.",
      });
    }
    const created = await this.cases.create({
      titleAr: dto.titleAr.trim(),
      titleEn: dto.titleEn?.trim(),
      titleFr: dto.titleFr?.trim(),
      descriptionAr: dto.descriptionAr?.trim(),
      descriptionEn: dto.descriptionEn?.trim(),
      descriptionFr: dto.descriptionFr?.trim(),
      beforeImageUrl: dto.beforeImageUrl.trim(),
      afterImageUrl: dto.afterImageUrl.trim(),
      beforeAltAr: dto.beforeAltAr?.trim(),
      beforeAltEn: dto.beforeAltEn?.trim(),
      beforeAltFr: dto.beforeAltFr?.trim(),
      afterAltAr: dto.afterAltAr?.trim(),
      afterAltEn: dto.afterAltEn?.trim(),
      afterAltFr: dto.afterAltFr?.trim(),
      doctorId:
        dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
          ? new Types.ObjectId(dto.doctorId)
          : undefined,
      serviceSlug: dto.serviceSlug?.trim(),
      specialtySlug: dto.specialtySlug?.trim(),
      treatmentCategory: dto.treatmentCategory?.trim(),
      treatmentDuration: dto.treatmentDuration?.trim(),
      resultDate: dto.resultDate ? new Date(dto.resultDate) : undefined,
      patientAgeRange: dto.patientAgeRange?.trim(),
      isAnonymous: dto.isAnonymous !== false,
      isFeatured: dto.isFeatured === true,
      isApproved: false,
      isPublished: false,
      displayOrder: dto.displayOrder ?? 0,
      consentConfirmed: dto.consentConfirmed === true,
      consentDocumentReference: dto.consentDocumentReference?.trim(),
      createdById: new Types.ObjectId(actor.id),
      updatedById: new Types.ObjectId(actor.id),
      archivedAt: null,
    });

    await this.audit.write({
      actor,
      action: "before_after.created",
      entityType: "BeforeAfterCase",
      entityId: String(created._id),
      newValue: { titleAr: created.titleAr },
    });

    return {
      ok: true,
      message: "تم إنشاء الحالة.",
      case: this.adminSerialize(created.toObject() as never),
    };
  }

  async update(dto: UpsertBeforeAfterDto, actor: AuthUser) {
    if (!dto.id || !Types.ObjectId.isValid(dto.id)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف غير صالح.",
      });
    }
    const existing = await this.cases.findById(dto.id);
    if (!existing || existing.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }

    const prevBefore = existing.beforeImageUrl;
    const prevAfter = existing.afterImageUrl;

    existing.titleAr = dto.titleAr.trim();
    existing.titleEn = dto.titleEn?.trim();
    existing.titleFr = dto.titleFr?.trim();
    existing.descriptionAr = dto.descriptionAr?.trim();
    existing.descriptionEn = dto.descriptionEn?.trim();
    existing.descriptionFr = dto.descriptionFr?.trim();
    existing.beforeImageUrl = dto.beforeImageUrl.trim();
    existing.afterImageUrl = dto.afterImageUrl.trim();
    existing.beforeAltAr = dto.beforeAltAr?.trim();
    existing.beforeAltEn = dto.beforeAltEn?.trim();
    existing.beforeAltFr = dto.beforeAltFr?.trim();
    existing.afterAltAr = dto.afterAltAr?.trim();
    existing.afterAltEn = dto.afterAltEn?.trim();
    existing.afterAltFr = dto.afterAltFr?.trim();
    existing.doctorId =
      dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
        ? new Types.ObjectId(dto.doctorId)
        : undefined;
    existing.serviceSlug = dto.serviceSlug?.trim();
    existing.specialtySlug = dto.specialtySlug?.trim();
    existing.treatmentCategory = dto.treatmentCategory?.trim();
    existing.treatmentDuration = dto.treatmentDuration?.trim();
    existing.resultDate = dto.resultDate ? new Date(dto.resultDate) : undefined;
    existing.patientAgeRange = dto.patientAgeRange?.trim();
    existing.isAnonymous = dto.isAnonymous !== false;
    existing.isFeatured = dto.isFeatured === true;
    if (dto.displayOrder !== undefined) existing.displayOrder = dto.displayOrder;
    existing.consentConfirmed = dto.consentConfirmed === true;
    existing.consentDocumentReference = dto.consentDocumentReference?.trim();
    existing.updatedById = new Types.ObjectId(actor.id);

    if (existing.isPublished) {
      this.assertCanPublish(existing);
    }

    await existing.save();

    if (prevBefore !== existing.beforeImageUrl || prevAfter !== existing.afterImageUrl) {
      await this.audit.write({
        actor,
        action: "before_after.images_replaced",
        entityType: "BeforeAfterCase",
        entityId: String(existing._id),
      });
    }

    await this.audit.write({
      actor,
      action: "before_after.updated",
      entityType: "BeforeAfterCase",
      entityId: String(existing._id),
      newValue: { titleAr: existing.titleAr },
    });

    return {
      ok: true,
      message: "تم تحديث الحالة.",
      case: this.adminSerialize(existing.toObject() as never),
    };
  }

  async approve(id: string, actor: AuthUser) {
    return this.setApproval(id, true, actor);
  }

  async reject(id: string, actor: AuthUser) {
    return this.setApproval(id, false, actor);
  }

  private async setApproval(id: string, approved: boolean, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    row.isApproved = approved;
    if (!approved && row.isPublished) {
      row.isPublished = false;
      row.publishedAt = undefined;
    }
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: approved ? "before_after.approved" : "before_after.rejected",
      entityType: "BeforeAfterCase",
      entityId: id,
    });
    return {
      ok: true,
      message: approved ? "تم اعتماد الحالة." : "تم رفض الاعتماد.",
      case: this.adminSerialize(row.toObject() as never),
    };
  }

  async publish(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    this.assertCanPublish(row);
    row.isPublished = true;
    row.publishedAt = new Date();
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "before_after.published",
      entityType: "BeforeAfterCase",
      entityId: id,
    });
    return {
      ok: true,
      message: "تم نشر الحالة.",
      case: this.adminSerialize(row.toObject() as never),
    };
  }

  async unpublish(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    row.isPublished = false;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "before_after.unpublished",
      entityType: "BeforeAfterCase",
      entityId: id,
    });
    return {
      ok: true,
      message: "تم إلغاء النشر.",
      case: this.adminSerialize(row.toObject() as never),
    };
  }

  async archive(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    row.archivedAt = new Date();
    row.isPublished = false;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "before_after.archived",
      entityType: "BeforeAfterCase",
      entityId: id,
    });
    return { ok: true, message: "تم الأرشفة." };
  }

  async restore(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    row.archivedAt = null;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "before_after.restored",
      entityType: "BeforeAfterCase",
      entityId: id,
    });
    return { ok: true, message: "تم الاستعادة." };
  }

  async feature(id: string, featured: boolean, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    const row = await this.cases.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الحالة غير موجودة.",
      });
    }
    row.isFeatured = featured;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    return {
      ok: true,
      message: featured ? "تم التمييز." : "أُزيل التمييز.",
      case: this.adminSerialize(row.toObject() as never),
    };
  }

  async reorder(orderedIds: string[], actor: AuthUser) {
    const ids = orderedIds.filter((id) => Types.ObjectId.isValid(id));
    await Promise.all(
      ids.map((id, index) =>
        this.cases.updateOne(
          { _id: id },
          {
            $set: {
              displayOrder: index,
              updatedById: new Types.ObjectId(actor.id),
            },
          },
        ),
      ),
    );
    await this.audit.write({
      actor,
      action: "before_after.reordered",
      entityType: "BeforeAfterCase",
      newValue: { count: ids.length },
    });
    return { ok: true, message: "تم تحديث الترتيب." };
  }

  async listPublic(opts: {
    locale?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
  }) {
    const locale = opts.locale || "ar";
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(10, Math.max(1, opts.limit || 10));
    const filter: Record<string, unknown> = {
      isPublished: true,
      isApproved: true,
      consentConfirmed: true,
      archivedAt: null,
    };
    if (opts.featured === true) filter.isFeatured = true;

    const [total, rows] = await Promise.all([
      this.cases.countDocuments(filter),
      this.cases
        .find(filter)
        .sort({ displayOrder: 1, publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const doctorIds = [
      ...new Set(
        rows
          .map((r) => (r.doctorId ? String(r.doctorId) : ""))
          .filter(Boolean),
      ),
    ];
    const doctors = doctorIds.length
      ? await this.users
          .find({ _id: { $in: doctorIds }, deletedAt: null, status: "ACTIVE" })
          .select("fullName")
          .lean()
      : [];
    const nameById = new Map(doctors.map((d) => [String(d._id), d.fullName]));

    return {
      ok: true,
      total,
      page,
      limit,
      cases: rows.map((r) => ({
        id: String(r._id),
        title: this.pickLocale(locale, r.titleAr, r.titleEn, r.titleFr),
        description:
          this.pickLocale(
            locale,
            r.descriptionAr,
            r.descriptionEn,
            r.descriptionFr,
          ) || null,
        beforeImageUrl: r.beforeImageUrl,
        afterImageUrl: r.afterImageUrl,
        beforeAlt:
          this.pickLocale(
            locale,
            r.beforeAltAr,
            r.beforeAltEn,
            r.beforeAltFr,
          ) || this.pickLocale(locale, "قبل العلاج", "Before", "Avant"),
        afterAlt:
          this.pickLocale(locale, r.afterAltAr, r.afterAltEn, r.afterAltFr) ||
          this.pickLocale(locale, "بعد العلاج", "After", "Après"),
        doctorName: r.doctorId
          ? nameById.get(String(r.doctorId)) || null
          : null,
        specialtySlug: r.specialtySlug || null,
        serviceSlug: r.serviceSlug || null,
        treatmentDuration: r.treatmentDuration || null,
        resultDate: r.resultDate || null,
      })),
    };
  }
}
