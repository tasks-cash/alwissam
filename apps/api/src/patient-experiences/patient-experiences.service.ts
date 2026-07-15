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
import { User } from "../auth/schemas/auth.schemas";
import {
  ListExperiencesQueryDto,
  UpsertPatientExperienceDto,
} from "./dto/patient-experience.dto";
import {
  PatientExperience,
  PatientExperienceDocument,
} from "./schemas/patient-experience.schema";

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@Injectable()
export class PatientExperiencesService {
  constructor(
    @InjectModel(PatientExperience.name)
    private readonly experiences: Model<PatientExperienceDocument>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
  ) {}

  private assertCanPublish(doc: {
    consentConfirmed?: boolean;
    isApproved?: boolean;
    reviewAr?: string;
    reviewEn?: string;
    reviewFr?: string;
  }) {
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
        message: "لا يمكن النشر قبل اعتماد التجربة.",
        fieldErrors: { isApproved: ["Approval required for publication."] },
      });
    }
    const hasText = Boolean(
      (doc.reviewAr && doc.reviewAr.trim()) ||
        (doc.reviewEn && doc.reviewEn.trim()) ||
        (doc.reviewFr && doc.reviewFr.trim()),
    );
    if (!hasText) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يجب توفير نص التجربة بلغة واحدة على الأقل.",
      });
    }
  }

  private adminSerialize(
    r: PatientExperience & {
      _id: Types.ObjectId;
      createdAt?: Date;
      updatedAt?: Date;
    },
    doctorName?: string,
  ) {
    return {
      id: String(r._id),
      displayNameAr: r.displayNameAr || "",
      displayNameEn: r.displayNameEn || "",
      displayNameFr: r.displayNameFr || "",
      isAnonymous: r.isAnonymous !== false,
      anonymousLabelAr: r.anonymousLabelAr,
      anonymousLabelEn: r.anonymousLabelEn,
      anonymousLabelFr: r.anonymousLabelFr,
      reviewAr: r.reviewAr,
      reviewEn: r.reviewEn || "",
      reviewFr: r.reviewFr || "",
      rating: r.rating,
      patientImageUrl: r.patientImageUrl || "",
      doctorId: r.doctorId ? String(r.doctorId) : "",
      doctorName: doctorName || "",
      serviceSlug: r.serviceSlug || "",
      specialtySlug: r.specialtySlug || "",
      treatmentTitleAr: r.treatmentTitleAr || "",
      treatmentTitleEn: r.treatmentTitleEn || "",
      treatmentTitleFr: r.treatmentTitleFr || "",
      reviewDate: r.reviewDate || null,
      isVerifiedPatient: r.isVerifiedPatient === true,
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
        ar: Boolean(r.reviewAr?.trim()),
        en: Boolean(r.reviewEn?.trim()),
        fr: Boolean(r.reviewFr?.trim()),
      },
      canPublish:
        r.consentConfirmed === true &&
        r.isApproved === true &&
        Boolean(
          r.reviewAr?.trim() || r.reviewEn?.trim() || r.reviewFr?.trim(),
        ),
    };
  }

  private publicDisplayName(
    locale: string,
    r: PatientExperience,
  ): string {
    if (r.isAnonymous !== false) {
      if (locale === "en") return r.anonymousLabelEn || "Verified clinic patient";
      if (locale === "fr") return r.anonymousLabelFr || "Patient de la clinique";
      return r.anonymousLabelAr || "مريض من العيادة";
    }
    if (locale === "en")
      return r.displayNameEn || r.displayNameAr || r.displayNameFr || "";
    if (locale === "fr")
      return r.displayNameFr || r.displayNameEn || r.displayNameAr || "";
    return r.displayNameAr || r.displayNameEn || r.displayNameFr || "";
  }

  private publicReview(locale: string, r: PatientExperience): string {
    if (locale === "en") return r.reviewEn || r.reviewAr || r.reviewFr || "";
    if (locale === "fr") return r.reviewFr || r.reviewEn || r.reviewAr || "";
    return r.reviewAr || r.reviewEn || r.reviewFr || "";
  }

  private publicTreatment(locale: string, r: PatientExperience): string {
    if (locale === "en")
      return r.treatmentTitleEn || r.treatmentTitleAr || r.treatmentTitleFr || "";
    if (locale === "fr")
      return r.treatmentTitleFr || r.treatmentTitleEn || r.treatmentTitleAr || "";
    return r.treatmentTitleAr || r.treatmentTitleEn || r.treatmentTitleFr || "";
  }

  async listAdmin(query: ListExperiencesQueryDto) {
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
    if (query.rating) filter.rating = query.rating;
    if (query.doctorId && Types.ObjectId.isValid(query.doctorId)) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }
    if (query.serviceSlug?.trim()) filter.serviceSlug = query.serviceSlug.trim();
    if (query.q?.trim()) {
      const rx = new RegExp(esc(query.q.trim()), "i");
      filter.$or = [
        { displayNameAr: rx },
        { displayNameEn: rx },
        { displayNameFr: rx },
        { reviewAr: rx },
        { reviewEn: rx },
        { reviewFr: rx },
        { treatmentTitleAr: rx },
      ];
    }

    const sort: Record<string, 1 | -1> =
      query.sort === "createdAt"
        ? { createdAt: -1 }
        : { displayOrder: 1, createdAt: -1 };

    const [total, rows] = await Promise.all([
      this.experiences.countDocuments(filter),
      this.experiences
        .find(filter)
        .sort(sort)
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
      experiences: rows.map((r) =>
        this.adminSerialize(r as never, nameById.get(String(r.doctorId))),
      ),
    };
  }

  async getAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id).lean();
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
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
    return { ok: true, experience: this.adminSerialize(row as never, doctorName) };
  }

  async create(dto: UpsertPatientExperienceDto, actor: AuthUser) {
    if (!dto.reviewAr?.trim()) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "نص التجربة بالعربية مطلوب.",
      });
    }
    const created = await this.experiences.create({
      displayNameAr: dto.displayNameAr?.trim(),
      displayNameEn: dto.displayNameEn?.trim(),
      displayNameFr: dto.displayNameFr?.trim(),
      isAnonymous: dto.isAnonymous !== false,
      anonymousLabelAr: dto.anonymousLabelAr || "مريض من العيادة",
      anonymousLabelEn: dto.anonymousLabelEn || "Verified clinic patient",
      anonymousLabelFr: dto.anonymousLabelFr || "Patient de la clinique",
      reviewAr: dto.reviewAr.trim(),
      reviewEn: dto.reviewEn?.trim(),
      reviewFr: dto.reviewFr?.trim(),
      rating: dto.rating,
      patientImageUrl: dto.patientImageUrl?.trim() || undefined,
      doctorId:
        dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
          ? new Types.ObjectId(dto.doctorId)
          : undefined,
      serviceSlug: dto.serviceSlug?.trim(),
      specialtySlug: dto.specialtySlug?.trim(),
      treatmentTitleAr: dto.treatmentTitleAr?.trim(),
      treatmentTitleEn: dto.treatmentTitleEn?.trim(),
      treatmentTitleFr: dto.treatmentTitleFr?.trim(),
      reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : undefined,
      isVerifiedPatient: dto.isVerifiedPatient === true,
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
      action: "patient_experience.created",
      entityType: "PatientExperience",
      entityId: String(created._id),
      newValue: { rating: created.rating, isAnonymous: created.isAnonymous },
    });

    return {
      ok: true,
      message: "تم إنشاء التجربة.",
      experience: this.adminSerialize(created.toObject() as never),
    };
  }

  async update(dto: UpsertPatientExperienceDto, actor: AuthUser) {
    if (!dto.id || !Types.ObjectId.isValid(dto.id)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف غير صالح.",
      });
    }
    const existing = await this.experiences.findById(dto.id);
    if (!existing || existing.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }

    const nextImage = dto.patientImageUrl?.trim();
    existing.displayNameAr = dto.displayNameAr?.trim();
    existing.displayNameEn = dto.displayNameEn?.trim();
    existing.displayNameFr = dto.displayNameFr?.trim();
    existing.isAnonymous = dto.isAnonymous !== false;
    if (dto.anonymousLabelAr) existing.anonymousLabelAr = dto.anonymousLabelAr;
    if (dto.anonymousLabelEn) existing.anonymousLabelEn = dto.anonymousLabelEn;
    if (dto.anonymousLabelFr) existing.anonymousLabelFr = dto.anonymousLabelFr;
    existing.reviewAr = dto.reviewAr.trim();
    existing.reviewEn = dto.reviewEn?.trim();
    existing.reviewFr = dto.reviewFr?.trim();
    existing.rating = dto.rating;
    if (nextImage !== undefined) {
      existing.patientImageUrl = nextImage || undefined;
    }
    existing.doctorId =
      dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
        ? new Types.ObjectId(dto.doctorId)
        : undefined;
    existing.serviceSlug = dto.serviceSlug?.trim();
    existing.specialtySlug = dto.specialtySlug?.trim();
    existing.treatmentTitleAr = dto.treatmentTitleAr?.trim();
    existing.treatmentTitleEn = dto.treatmentTitleEn?.trim();
    existing.treatmentTitleFr = dto.treatmentTitleFr?.trim();
    existing.reviewDate = dto.reviewDate ? new Date(dto.reviewDate) : undefined;
    existing.isVerifiedPatient = dto.isVerifiedPatient === true;
    existing.isFeatured = dto.isFeatured === true;
    if (dto.displayOrder !== undefined) existing.displayOrder = dto.displayOrder;
    existing.consentConfirmed = dto.consentConfirmed === true;
    existing.consentDocumentReference = dto.consentDocumentReference?.trim();
    existing.updatedById = new Types.ObjectId(actor.id);

    if (existing.isPublished) {
      this.assertCanPublish(existing);
    }

    await existing.save();
    await this.audit.write({
      actor,
      action: "patient_experience.updated",
      entityType: "PatientExperience",
      entityId: String(existing._id),
      newValue: { rating: existing.rating, isFeatured: existing.isFeatured },
    });

    return {
      ok: true,
      message: "تم تحديث التجربة.",
      experience: this.adminSerialize(existing.toObject() as never),
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
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
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
      action: approved
        ? "patient_experience.approved"
        : "patient_experience.rejected",
      entityType: "PatientExperience",
      entityId: id,
    });
    return {
      ok: true,
      message: approved ? "تم اعتماد التجربة." : "تم رفض الاعتماد.",
      experience: this.adminSerialize(row.toObject() as never),
    };
  }

  async publish(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    this.assertCanPublish(row);
    row.isPublished = true;
    row.publishedAt = new Date();
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "patient_experience.published",
      entityType: "PatientExperience",
      entityId: id,
    });
    return {
      ok: true,
      message: "تم نشر التجربة.",
      experience: this.adminSerialize(row.toObject() as never),
    };
  }

  async unpublish(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    row.isPublished = false;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "patient_experience.unpublished",
      entityType: "PatientExperience",
      entityId: id,
    });
    return {
      ok: true,
      message: "تم إلغاء النشر.",
      experience: this.adminSerialize(row.toObject() as never),
    };
  }

  async archive(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    row.archivedAt = new Date();
    row.isPublished = false;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "patient_experience.archived",
      entityType: "PatientExperience",
      entityId: id,
    });
    return { ok: true, message: "تم الأرشفة." };
  }

  async restore(id: string, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    row.archivedAt = null;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    await this.audit.write({
      actor,
      action: "patient_experience.restored",
      entityType: "PatientExperience",
      entityId: id,
    });
    return { ok: true, message: "تم الاستعادة." };
  }

  async feature(id: string, featured: boolean, actor: AuthUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    const row = await this.experiences.findById(id);
    if (!row || row.archivedAt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التجربة غير موجودة.",
      });
    }
    row.isFeatured = featured;
    row.updatedById = new Types.ObjectId(actor.id);
    await row.save();
    return {
      ok: true,
      message: featured ? "تم التمييز." : "أُزيل التمييز.",
      experience: this.adminSerialize(row.toObject() as never),
    };
  }

  async reorder(orderedIds: string[], actor: AuthUser) {
    const ids = orderedIds.filter((id) => Types.ObjectId.isValid(id));
    await Promise.all(
      ids.map((id, index) =>
        this.experiences.updateOne(
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
      action: "patient_experience.reordered",
      entityType: "PatientExperience",
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
      this.experiences.countDocuments(filter),
      this.experiences
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
      experiences: rows.map((r) => ({
        id: String(r._id),
        displayName: this.publicDisplayName(locale, r as never),
        review: this.publicReview(locale, r as never),
        rating: r.rating,
        patientImageUrl: r.patientImageUrl || null,
        treatmentTitle: this.publicTreatment(locale, r as never) || null,
        doctorName: r.doctorId
          ? nameById.get(String(r.doctorId)) || null
          : null,
        serviceSlug: r.serviceSlug || null,
        isVerifiedPatient: r.isVerifiedPatient === true,
        reviewDate: r.reviewDate || null,
      })),
    };
  }
}
