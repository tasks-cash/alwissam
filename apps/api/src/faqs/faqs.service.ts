import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { FAQ_CATEGORIES, FAQ_CATEGORY_LABELS } from "./faq.categories";
import { FAQ_SEEDS, type FaqSeed } from "./faq.seed-data";
import {
  escapeRegex,
  normalizeFaqQuestion,
  slugifyFaq,
} from "./faq.utils";
import { Faq, FaqDocument } from "./schemas/faq.schema";
import type {
  AdminFaqsQueryDto,
  PublicFaqsQueryDto,
  UpsertFaqDto,
} from "./dto/faq.dto";

export { normalizeFaqQuestion } from "./faq.utils";

function localized(
  locale: string | undefined,
  ar: string,
  en: string,
  fr: string,
) {
  if (locale === "en") return en || ar || fr;
  if (locale === "fr") return fr || en || ar;
  return ar || en || fr;
}

function boolFlag(value?: string): boolean | undefined {
  if (value === undefined || value === "") return undefined;
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return undefined;
}

@Injectable()
export class FaqsService {
  constructor(
    @InjectModel(Faq.name) private readonly faqs: Model<FaqDocument>,
    private readonly audit: AuditService,
  ) {}

  async seedIdempotent(opts?: {
    publish?: boolean;
    overwriteApproved?: boolean;
  }) {
    const publish =
      opts?.publish ??
      (process.env.SEED_FAQ_PUBLISH === "true" ||
        (process.env.SEED_FAQ_PUBLISH !== "false" &&
          process.env.NODE_ENV !== "production"));
    const overwriteApproved = opts?.overwriteApproved === true;
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const seed of FAQ_SEEDS) {
      const result = await this.upsertSeed(seed, {
        publish,
        overwriteApproved,
      });
      if (result === "created") created += 1;
      else if (result === "updated") updated += 1;
      else skipped += 1;
    }

    return {
      ok: true,
      created,
      updated,
      skipped,
      totalSeeds: FAQ_SEEDS.length,
      publish,
    };
  }

  private async upsertSeed(
    seed: FaqSeed,
    opts: { publish: boolean; overwriteApproved: boolean },
  ): Promise<"created" | "updated" | "skipped"> {
    const norms = [
      seed.questionAr,
      seed.questionEn,
      seed.questionFr,
    ].map(normalizeFaqQuestion);

    let existing = await this.faqs.findOne({ slug: seed.slug });
    if (!existing) {
      existing = await this.faqs.findOne({
        $or: [
          { normalizedQuestionAr: norms[0] },
          { normalizedQuestionEn: norms[1] },
          { normalizedQuestionFr: norms[2] },
        ],
        archivedAt: null,
      });
    }

    const baseFields = {
      slug: seed.slug,
      category: seed.category,
      keywordsAr: seed.keywordsAr,
      keywordsEn: seed.keywordsEn,
      keywordsFr: seed.keywordsFr,
      relatedSpecialtySlugs: seed.relatedSpecialtySlugs || [],
      relatedServiceSlugs: seed.relatedServiceSlugs || [],
      displayOrder: seed.displayOrder,
      isFeatured: Boolean(seed.isFeatured),
      normalizedQuestionAr: norms[0],
      normalizedQuestionEn: norms[1],
      normalizedQuestionFr: norms[2],
    };

    if (!existing) {
      await this.faqs.create({
        ...baseFields,
        questionAr: seed.questionAr,
        questionEn: seed.questionEn,
        questionFr: seed.questionFr,
        answerAr: seed.answerAr,
        answerEn: seed.answerEn,
        answerFr: seed.answerFr,
        isActive: true,
        isPublic: opts.publish,
        publishedAt: opts.publish ? new Date() : null,
        createdBy: null,
        updatedBy: null,
        archivedAt: null,
        relatedSpecialtyIds: [],
        relatedServiceIds: [],
        relatedDoctorIds: [],
      });
      return "created";
    }

    const patch: Record<string, unknown> = {};
    if (!existing.slug) patch.slug = seed.slug;
    if (!existing.category) patch.category = seed.category;
    if (!existing.displayOrder && existing.displayOrder !== 0) {
      patch.displayOrder = seed.displayOrder;
    }
    if (existing.isFeatured !== Boolean(seed.isFeatured) && !existing.updatedBy) {
      patch.isFeatured = Boolean(seed.isFeatured);
    }

    const fillEmpty = (key: keyof FaqSeed, current?: string | null) => {
      if (!current || !String(current).trim()) {
        patch[key] = seed[key];
      } else if (opts.overwriteApproved && !existing!.updatedBy) {
        // Only overwrite when seed owner allows and record was never manually edited
        patch[key] = seed[key];
      }
    };

    fillEmpty("questionAr", existing.questionAr);
    fillEmpty("questionEn", existing.questionEn);
    fillEmpty("questionFr", existing.questionFr);
    fillEmpty("answerAr", existing.answerAr);
    fillEmpty("answerEn", existing.answerEn);
    fillEmpty("answerFr", existing.answerFr);

    if (!(existing.keywordsAr || []).length) patch.keywordsAr = seed.keywordsAr;
    if (!(existing.keywordsEn || []).length) patch.keywordsEn = seed.keywordsEn;
    if (!(existing.keywordsFr || []).length) patch.keywordsFr = seed.keywordsFr;
    if (!(existing.relatedSpecialtySlugs || []).length) {
      patch.relatedSpecialtySlugs = seed.relatedSpecialtySlugs || [];
    }
    if (!(existing.relatedServiceSlugs || []).length) {
      patch.relatedServiceSlugs = seed.relatedServiceSlugs || [];
    }

    patch.normalizedQuestionAr = normalizeFaqQuestion(
      (patch.questionAr as string) || existing.questionAr,
    );
    patch.normalizedQuestionEn = normalizeFaqQuestion(
      (patch.questionEn as string) || existing.questionEn,
    );
    patch.normalizedQuestionFr = normalizeFaqQuestion(
      (patch.questionFr as string) || existing.questionFr,
    );

    if (opts.publish && !existing.isPublic && !existing.updatedBy) {
      patch.isPublic = true;
      patch.publishedAt = existing.publishedAt || new Date();
      patch.isActive = true;
    }

    const meaningful = Object.keys(patch).filter(
      (k) => !k.startsWith("normalized"),
    );
    if (!meaningful.length) return "skipped";

    await this.faqs.updateOne({ _id: existing._id }, { $set: patch });
    return "updated";
  }

  async listPublic(query: PublicFaqsQueryDto) {
    const locale = query.locale || "ar";
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(200, Math.max(1, query.limit || 100));
    const skip = (page - 1) * limit;
    const featured = boolFlag(query.featured);

    const filter: FilterQuery<FaqDocument> = {
      isActive: true,
      isPublic: true,
      archivedAt: null,
    };

    if (query.category && query.category !== "all") {
      if (!(FAQ_CATEGORIES as readonly string[]).includes(query.category)) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "Invalid FAQ category",
        });
      }
      filter.category = query.category;
    }
    if (featured !== undefined) filter.isFeatured = featured;

    const search = (query.search || "").trim();
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { questionAr: rx },
        { questionEn: rx },
        { questionFr: rx },
        { answerAr: rx },
        { answerEn: rx },
        { answerFr: rx },
        { keywordsAr: rx },
        { keywordsEn: rx },
        { keywordsFr: rx },
        { category: rx },
        { relatedSpecialtySlugs: rx },
        { relatedServiceSlugs: rx },
        { slug: rx },
      ];
    }

    const [total, rows, categoryAgg] = await Promise.all([
      this.faqs.countDocuments(filter),
      this.faqs
        .find(filter)
        .sort({ displayOrder: 1, createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.faqs.aggregate<{ _id: string; count: number }>([
        {
          $match: {
            isActive: true,
            isPublic: true,
            archivedAt: null,
          },
        },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const categoryCounts: Record<string, number> = { all: 0 };
    for (const row of categoryAgg) {
      categoryCounts[row._id] = row.count;
      categoryCounts.all += row.count;
    }

    const faqs = rows.map((doc) => this.toPublic(doc, locale));
    return {
      faqs,
      total,
      page,
      limit,
      categories: FAQ_CATEGORIES.map((id) => ({
        id,
        label: localized(
          locale,
          FAQ_CATEGORY_LABELS[id].ar,
          FAQ_CATEGORY_LABELS[id].en,
          FAQ_CATEGORY_LABELS[id].fr,
        ),
        count: categoryCounts[id] || 0,
      })),
      allCount: categoryCounts.all || 0,
    };
  }

  async listAdmin(query: AdminFaqsQueryDto) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(200, Math.max(1, query.pageSize || 50));
    const skip = (page - 1) * pageSize;
    const filter: FilterQuery<FaqDocument> = {};

    const archived = boolFlag(query.archived);
    if (archived === true) filter.archivedAt = { $ne: null };
    else if (archived === false || archived === undefined) {
      filter.archivedAt = null;
    }

    const active = boolFlag(query.active);
    if (active !== undefined) filter.isActive = active;
    const published = boolFlag(query.published);
    if (published !== undefined) filter.isPublic = published;
    const featured = boolFlag(query.featured);
    if (featured !== undefined) filter.isFeatured = featured;
    if (query.category && query.category !== "all") {
      filter.category = query.category;
    }

    const search = (query.search || "").trim();
    if (search) {
      const rx = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { questionAr: rx },
        { questionEn: rx },
        { questionFr: rx },
        { slug: rx },
        { keywordsAr: rx },
        { keywordsEn: rx },
        { keywordsFr: rx },
      ];
    }

    const [total, rows] = await Promise.all([
      this.faqs.countDocuments(filter),
      this.faqs
        .find(filter)
        .sort({ displayOrder: 1, updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
    ]);

    return {
      faqs: rows.map((doc) => this.toAdmin(doc)),
      total,
      page,
      pageSize,
      categories: FAQ_CATEGORIES,
    };
  }

  async getAdmin(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    const doc = await this.faqs.findById(id).lean();
    if (!doc) throw new NotFoundException();
    return { faq: this.toAdmin(doc) };
  }

  async upsert(dto: UpsertFaqDto, user: AuthUser) {
    const slug =
      (dto.slug || slugifyFaq(dto.questionEn || dto.questionAr) || "").trim();
    if (!slug) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Slug is required",
      });
    }
    if (!(FAQ_CATEGORIES as readonly string[]).includes(dto.category)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Invalid category",
      });
    }

    const norms = {
      normalizedQuestionAr: normalizeFaqQuestion(dto.questionAr),
      normalizedQuestionEn: normalizeFaqQuestion(dto.questionEn),
      normalizedQuestionFr: normalizeFaqQuestion(dto.questionFr),
    };

    const duplicate = await this.findDuplicate({
      slug,
      norms,
      excludeId: dto.id,
    });
    if (duplicate) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "A similar FAQ already exists",
        existingId: String(duplicate._id),
        existingSlug: duplicate.slug,
      });
    }

    const payload = {
      questionAr: dto.questionAr.trim(),
      questionEn: dto.questionEn.trim(),
      questionFr: dto.questionFr.trim(),
      answerAr: dto.answerAr.trim(),
      answerEn: dto.answerEn.trim(),
      answerFr: dto.answerFr.trim(),
      slug,
      category: dto.category,
      keywordsAr: dto.keywordsAr || [],
      keywordsEn: dto.keywordsEn || [],
      keywordsFr: dto.keywordsFr || [],
      relatedSpecialtySlugs: dto.relatedSpecialtySlugs || [],
      relatedServiceSlugs: dto.relatedServiceSlugs || [],
      relatedSpecialtyIds: (dto.relatedSpecialtyIds || [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id)),
      relatedServiceIds: (dto.relatedServiceIds || [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id)),
      isActive: dto.isActive ?? true,
      isPublic: dto.isPublic ?? false,
      isFeatured: dto.isFeatured ?? false,
      displayOrder: dto.displayOrder ?? 100,
      ...norms,
      updatedBy: new Types.ObjectId(user.id),
    };

    if (dto.id) {
      if (!Types.ObjectId.isValid(dto.id)) throw new NotFoundException();
      const updated = await this.faqs
        .findByIdAndUpdate(
          dto.id,
          {
            $set: {
              ...payload,
              publishedAt: payload.isPublic ? new Date() : null,
            },
          },
          { new: true },
        )
        .lean();
      if (!updated) throw new NotFoundException();
      await this.audit.write({
        actor: user,
        action: "faq.update",
        entityType: "faq",
        entityId: dto.id,
        newValue: { slug },
      });
      return { faq: this.toAdmin(updated) };
    }

    const created = await this.faqs.create({
      ...payload,
      publishedAt: payload.isPublic ? new Date() : null,
      createdBy: new Types.ObjectId(user.id),
      archivedAt: null,
      relatedDoctorIds: [],
    });
    await this.audit.write({
      actor: user,
      action: "faq.create",
      entityType: "faq",
      entityId: String(created._id),
      newValue: { slug },
    });
    return {
      faq: this.toAdmin(created.toObject() as unknown as Record<string, unknown>),
    };
  }

  async setFlags(
    id: string,
    flags: Partial<{
      isActive: boolean;
      isPublic: boolean;
      isFeatured: boolean;
    }>,
    user: AuthUser,
  ) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    const patch: Record<string, unknown> = {
      ...flags,
      updatedBy: new Types.ObjectId(user.id),
    };
    if (flags.isPublic === true) patch.publishedAt = new Date();
    if (flags.isPublic === false) patch.publishedAt = null;
    const updated = await this.faqs
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException();
    await this.audit.write({
      actor: user,
      action: "faq.flags",
      entityType: "faq",
      entityId: id,
      newValue: flags as Record<string, unknown>,
    });
    return { faq: this.toAdmin(updated) };
  }

  async archive(id: string, user: AuthUser, restore = false) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException();
    const patch: Record<string, unknown> = {
      archivedAt: restore ? null : new Date(),
      updatedBy: new Types.ObjectId(user.id),
    };
    if (!restore) patch.isPublic = false;
    const updated = await this.faqs
      .findByIdAndUpdate(id, { $set: patch }, { new: true })
      .lean();
    if (!updated) throw new NotFoundException();
    await this.audit.write({
      actor: user,
      action: restore ? "faq.restore" : "faq.archive",
      entityType: "faq",
      entityId: id,
    });
    return { faq: this.toAdmin(updated) };
  }

  async reorder(orderedIds: string[], user: AuthUser) {
    const ops = orderedIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id, index) =>
        this.faqs.updateOne(
          { _id: id },
          {
            $set: {
              displayOrder: (index + 1) * 10,
              updatedBy: new Types.ObjectId(user.id),
            },
          },
        ),
      );
    await Promise.all(ops);
    await this.audit.write({
      actor: user,
      action: "faq.reorder",
      entityType: "faq",
      newValue: { count: orderedIds.length },
    });
    return { ok: true };
  }

  async detectDuplicates() {
    const rows = await this.faqs
      .find({ archivedAt: null })
      .select("slug questionAr questionEn questionFr normalizedQuestionAr")
      .lean();
    const byNorm = new Map<string, string[]>();
    const bySlug = new Map<string, string[]>();
    for (const row of rows) {
      const id = String(row._id);
      bySlug.set(row.slug, [...(bySlug.get(row.slug) || []), id]);
      const key = row.normalizedQuestionAr || normalizeFaqQuestion(row.questionAr);
      byNorm.set(key, [...(byNorm.get(key) || []), id]);
    }
    const duplicates = [
      ...[...bySlug.entries()]
        .filter(([, ids]) => ids.length > 1)
        .map(([key, ids]) => ({ type: "slug" as const, key, ids })),
      ...[...byNorm.entries()]
        .filter(([, ids]) => ids.length > 1)
        .map(([key, ids]) => ({ type: "question" as const, key, ids })),
    ];
    return { duplicates, total: rows.length };
  }

  private async findDuplicate(opts: {
    slug: string;
    norms: {
      normalizedQuestionAr: string;
      normalizedQuestionEn: string;
      normalizedQuestionFr: string;
    };
    excludeId?: string;
  }) {
    const filter: FilterQuery<FaqDocument> = {
      archivedAt: null,
      $or: [
        { slug: opts.slug },
        { normalizedQuestionAr: opts.norms.normalizedQuestionAr },
        { normalizedQuestionEn: opts.norms.normalizedQuestionEn },
        { normalizedQuestionFr: opts.norms.normalizedQuestionFr },
      ],
    };
    if (opts.excludeId && Types.ObjectId.isValid(opts.excludeId)) {
      filter._id = { $ne: new Types.ObjectId(opts.excludeId) };
    }
    return this.faqs.findOne(filter).lean();
  }

  private toPublic(doc: Record<string, unknown>, locale: string) {
    return {
      id: String(doc._id),
      question: localized(
        locale,
        String(doc.questionAr || ""),
        String(doc.questionEn || ""),
        String(doc.questionFr || ""),
      ),
      answer: localized(
        locale,
        String(doc.answerAr || ""),
        String(doc.answerEn || ""),
        String(doc.answerFr || ""),
      ),
      slug: String(doc.slug || ""),
      category: String(doc.category || ""),
      keywords: (() => {
        if (locale === "en") return (doc.keywordsEn as string[]) || [];
        if (locale === "fr") return (doc.keywordsFr as string[]) || [];
        return (doc.keywordsAr as string[]) || [];
      })(),
      relatedSpecialtySlugs: (doc.relatedSpecialtySlugs as string[]) || [],
      relatedServiceSlugs: (doc.relatedServiceSlugs as string[]) || [],
      displayOrder: Number(doc.displayOrder ?? 100),
      isFeatured: Boolean(doc.isFeatured),
    };
  }

  private toAdmin(doc: Record<string, unknown>) {
    return {
      id: String(doc._id),
      questionAr: doc.questionAr,
      questionEn: doc.questionEn,
      questionFr: doc.questionFr,
      answerAr: doc.answerAr,
      answerEn: doc.answerEn,
      answerFr: doc.answerFr,
      slug: doc.slug,
      category: doc.category,
      keywordsAr: doc.keywordsAr || [],
      keywordsEn: doc.keywordsEn || [],
      keywordsFr: doc.keywordsFr || [],
      relatedSpecialtySlugs: doc.relatedSpecialtySlugs || [],
      relatedServiceSlugs: doc.relatedServiceSlugs || [],
      relatedSpecialtyIds: ((doc.relatedSpecialtyIds as Types.ObjectId[]) || []).map(
        String,
      ),
      relatedServiceIds: ((doc.relatedServiceIds as Types.ObjectId[]) || []).map(
        String,
      ),
      isActive: Boolean(doc.isActive),
      isPublic: Boolean(doc.isPublic),
      isFeatured: Boolean(doc.isFeatured),
      displayOrder: Number(doc.displayOrder ?? 100),
      publishedAt: doc.publishedAt || null,
      archivedAt: doc.archivedAt || null,
      createdAt: doc.createdAt || null,
      updatedAt: doc.updatedAt || null,
    };
  }
}
