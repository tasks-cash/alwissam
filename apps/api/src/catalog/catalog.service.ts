import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  SERVICE_SEEDS,
  SPECIALTY_SEEDS,
} from "./catalog.seed-data";
import {
  DentalService,
  DentalServiceDocument,
} from "./schemas/dental-service.schema";
import { Specialty, SpecialtyDocument } from "./schemas/specialty.schema";
import { User, UserDocument } from "../auth/schemas/auth.schemas";
import { ErrorCodes } from "../common/errors/error-codes";
import type { AuthUser } from "../common/auth/session.guard";
import { AuditService } from "../common/audit/audit.service";

export function normalizeCatalogName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function shortDesc(
  locale: string | undefined,
  doc: DentalServiceDocument,
) {
  const short = localized(
    locale,
    doc.shortDescriptionAr,
    doc.shortDescriptionEn,
    doc.shortDescriptionFr,
  );
  if (short) return short;
  const full = localized(
    locale,
    doc.descriptionAr,
    doc.descriptionEn,
    doc.descriptionFr,
  );
  return full.length > 140 ? `${full.slice(0, 137)}…` : full;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Specialty.name)
    private readonly specialties: Model<SpecialtyDocument>,
    @InjectModel(DentalService.name)
    private readonly services: Model<DentalServiceDocument>,
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly audit: AuditService,
  ) {}

  async ensureSeeded() {
    return this.seedIdempotent({ publish: true });
  }

  /**
   * Idempotent specialty/service upsert by slug / alias / normalized name.
   * Never deletes manually managed records. Does not overwrite non-empty images.
   */
  async seedIdempotent(opts?: { publish?: boolean }) {
    const publish =
      opts?.publish ??
      (process.env.SEED_CATALOG_PUBLISH === "true" ||
        (process.env.SEED_CATALOG_PUBLISH !== "false" &&
          process.env.NODE_ENV !== "production"));

    const specialtyIdBySlug = new Map<string, Types.ObjectId>();
    let specialtiesUpserted = 0;
    let servicesUpserted = 0;

    for (const seed of SPECIALTY_SEEDS) {
      const existing = await this.findSpecialtyMatch(seed.slug, seed.aliases, [
        seed.nameAr,
        seed.nameEn,
        seed.nameFr,
      ]);
      if (existing) {
        const patch: Record<string, unknown> = {};
        if (!existing.nameAr) patch.nameAr = seed.nameAr;
        if (!existing.nameEn) patch.nameEn = seed.nameEn;
        if (!existing.nameFr) patch.nameFr = seed.nameFr;
        if (!existing.descriptionAr) patch.descriptionAr = seed.descriptionAr;
        if (!existing.descriptionEn) patch.descriptionEn = seed.descriptionEn;
        if (!existing.descriptionFr) patch.descriptionFr = seed.descriptionFr;
        if (!existing.icon) patch.icon = seed.icon;
        if (!existing.slug || existing.slug !== seed.slug) {
          // Preserve existing slug if already canonical; only fill aliases
        }
        const aliases = new Set([
          ...(existing.aliases || []),
          ...(seed.aliases || []),
          seed.slug,
        ]);
        patch.aliases = [...aliases];
        if (existing.slug !== seed.slug && seed.aliases?.includes(existing.slug)) {
          // Keep older slug as alias; migrate to canonical slug when safe
          const clash = await this.specialties.findOne({
            slug: seed.slug,
            _id: { $ne: existing._id },
          });
          if (!clash) patch.slug = seed.slug;
        }
        if (Object.keys(patch).length) {
          await this.specialties.updateOne({ _id: existing._id }, { $set: patch });
          specialtiesUpserted += 1;
        }
        specialtyIdBySlug.set(seed.slug, existing._id);
        if (existing.slug) specialtyIdBySlug.set(existing.slug, existing._id);
      } else {
        const created = await this.specialties.create({
          ...seed,
          aliases: [...(seed.aliases || []), seed.slug],
          isActive: true,
          isPublic: publish,
          isFeatured: seed.isFeatured,
          displayOrder: seed.displayOrder,
          doctorIds: [],
          image: "",
          archivedAt: null,
        });
        specialtyIdBySlug.set(seed.slug, created._id);
        specialtiesUpserted += 1;
      }
    }

    // Refresh slug map from DB
    const allSpecs = await this.specialties.find({ archivedAt: null }).lean();
    for (const s of allSpecs) {
      specialtyIdBySlug.set(s.slug, s._id as Types.ObjectId);
      for (const a of s.aliases || []) {
        specialtyIdBySlug.set(a, s._id as Types.ObjectId);
      }
    }

    for (const seed of SERVICE_SEEDS) {
      const specialtyIds = seed.specialtySlugs
        .map((slug) => specialtyIdBySlug.get(slug))
        .filter((id): id is Types.ObjectId => Boolean(id));

      const existing = await this.findServiceMatch(seed.slug, seed.aliases, [
        seed.nameAr,
        seed.nameEn,
        seed.nameFr,
      ]);
      if (existing) {
        const patch: Record<string, unknown> = {};
        if (!existing.nameAr) patch.nameAr = seed.nameAr;
        if (!existing.nameEn) patch.nameEn = seed.nameEn;
        if (!existing.nameFr) patch.nameFr = seed.nameFr;
        if (!existing.descriptionAr) patch.descriptionAr = seed.descriptionAr;
        if (!existing.descriptionEn) patch.descriptionEn = seed.descriptionEn;
        if (!existing.descriptionFr) patch.descriptionFr = seed.descriptionFr;
        if (!existing.shortDescriptionAr)
          patch.shortDescriptionAr = seed.shortDescriptionAr;
        if (!existing.shortDescriptionEn)
          patch.shortDescriptionEn = seed.shortDescriptionEn;
        if (!existing.shortDescriptionFr)
          patch.shortDescriptionFr = seed.shortDescriptionFr;
        if (!existing.icon) patch.icon = seed.icon;
        if (!existing.specialtyIds?.length && specialtyIds.length) {
          patch.specialtyIds = specialtyIds;
        }
        const aliases = new Set([
          ...(existing.aliases || []),
          ...(seed.aliases || []),
          seed.slug,
        ]);
        patch.aliases = [...aliases];
        if (existing.slug !== seed.slug) {
          const clash = await this.services.findOne({
            slug: seed.slug,
            _id: { $ne: existing._id },
          });
          if (!clash) patch.slug = seed.slug;
        }
        if (Object.keys(patch).length) {
          await this.services.updateOne({ _id: existing._id }, { $set: patch });
          servicesUpserted += 1;
        }
      } else {
        await this.services.create({
          ...seed,
          specialtyIds,
          doctorIds: [],
          aliases: [...(seed.aliases || []), seed.slug],
          isActive: true,
          isPublic: publish,
          isFeatured: seed.isFeatured,
          displayOrder: seed.displayOrder,
          requiresConsultation: seed.requiresConsultation === true,
          durationMinutes: null,
          priceFrom: null,
          priceApproved: false,
          currency: "DZD",
          image: "",
          archivedAt: null,
        });
        servicesUpserted += 1;
      }
    }

    return {
      ok: true,
      publish,
      specialtiesUpserted,
      servicesUpserted,
      specialtyCount: await this.specialties.countDocuments({ archivedAt: null }),
      serviceCount: await this.services.countDocuments({ archivedAt: null }),
      duplicateDentistry: await this.countDuplicateDentistry(),
    };
  }

  async countDuplicateDentistry() {
    const rows = await this.specialties
      .find({
        archivedAt: null,
        $or: [
          { slug: { $in: ["general-dentistry", "dentistry", "general"] } },
          { aliases: { $in: ["dentistry", "general-dentistry"] } },
          { nameEn: /general dentistry/i },
          { nameAr: /طب الأسنان العام|طب الأسنان$/ },
        ],
      })
      .select({ slug: 1, nameAr: 1, nameEn: 1 })
      .lean();
    return rows.length;
  }

  private async findSpecialtyMatch(
    slug: string,
    aliases: string[] | undefined,
    names: string[],
  ) {
    const keys = [slug, ...(aliases || [])].filter(Boolean);
    const bySlug = await this.specialties.findOne({
      $or: [{ slug: { $in: keys } }, { aliases: { $in: keys } }],
    });
    if (bySlug) return bySlug;
    const norms = names.map(normalizeCatalogName).filter(Boolean);
    const all = await this.specialties.find({ archivedAt: null }).limit(200);
    return (
      all.find((s) =>
        [s.nameAr, s.nameEn, s.nameFr]
          .map(normalizeCatalogName)
          .some((n) => norms.includes(n)),
      ) || null
    );
  }

  private async findServiceMatch(
    slug: string,
    aliases: string[] | undefined,
    names: string[],
  ) {
    const keys = [slug, ...(aliases || [])].filter(Boolean);
    const bySlug = await this.services.findOne({
      $or: [{ slug: { $in: keys } }, { aliases: { $in: keys } }],
    });
    if (bySlug) return bySlug;
    const norms = names.map(normalizeCatalogName).filter(Boolean);
    const all = await this.services.find({ archivedAt: null }).limit(400);
    return (
      all.find((s) =>
        [s.nameAr, s.nameEn, s.nameFr]
          .map(normalizeCatalogName)
          .some((n) => norms.includes(n)),
      ) || null
    );
  }

  private publicSpecialtyFilter() {
    return {
      isActive: true,
      isPublic: true,
      archivedAt: null,
      nameAr: { $nin: ["", null] },
    };
  }

  private publicServiceFilter() {
    return {
      isActive: true,
      isPublic: true,
      archivedAt: null,
      nameAr: { $nin: ["", null] },
    };
  }

  async listPublicSpecialties(query: {
    locale?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
  }) {
    const limit = Math.min(48, Math.max(1, query.limit ?? 24));
    const page = Math.max(1, query.page ?? 1);
    const filter: Record<string, unknown> = { ...this.publicSpecialtyFilter() };
    if (query.featured) filter.isFeatured = true;

    const [total, rows] = await Promise.all([
      this.specialties.countDocuments(filter),
      this.specialties
        .find(filter)
        .sort({ isFeatured: -1, displayOrder: 1, nameAr: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const specialtyIds = rows.map((r) => r._id);
    const serviceCounts = await this.services.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      {
        $match: {
          ...this.publicServiceFilter(),
          specialtyIds: { $in: specialtyIds },
        },
      },
      { $unwind: "$specialtyIds" },
      { $match: { specialtyIds: { $in: specialtyIds } } },
      { $group: { _id: "$specialtyIds", count: { $sum: 1 } } },
    ]);
    const serviceCountMap = new Map(
      serviceCounts.map((c) => [String(c._id), c.count]),
    );

    const doctorCountMap = new Map<string, number>();
    for (const row of rows) {
      const ids = (row.doctorIds || []).map(String);
      if (!ids.length) {
        doctorCountMap.set(String(row._id), 0);
        continue;
      }
      const count = await this.users.countDocuments({
        _id: { $in: row.doctorIds },
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
      });
      doctorCountMap.set(String(row._id), count);
    }

    return {
      ok: true,
      total,
      page,
      limit,
      specialties: rows.map((r) => ({
        id: String(r._id),
        slug: r.slug,
        name: localized(query.locale, r.nameAr, r.nameEn, r.nameFr),
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        nameFr: r.nameFr,
        description: localized(
          query.locale,
          r.descriptionAr,
          r.descriptionEn,
          r.descriptionFr,
        ),
        descriptionAr: r.descriptionAr,
        descriptionEn: r.descriptionEn,
        descriptionFr: r.descriptionFr,
        icon: r.icon,
        image: r.image || null,
        isFeatured: r.isFeatured,
        serviceCount: serviceCountMap.get(String(r._id)) || 0,
        doctorCount: doctorCountMap.get(String(r._id)) || 0,
      })),
    };
  }

  async getPublicSpecialty(slug: string, locale?: string) {
    const row = await this.specialties
      .findOne({
        ...this.publicSpecialtyFilter(),
        $or: [{ slug }, { aliases: slug }],
      })
      .lean();
    if (!row) return null;

    const services = await this.listPublicServices({
      locale,
      specialty: row.slug,
      limit: 48,
      page: 1,
    });

    const doctors = await this.users
      .find({
        _id: { $in: row.doctorIds || [] },
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
      })
      .select({
        fullName: 1,
        "doctor.specialtyAr": 1,
        "doctor.specialtyEn": 1,
        "doctor.specialtyFr": 1,
        "doctor.bioAr": 1,
        "doctor.bioEn": 1,
        "doctor.bioFr": 1,
      })
      .lean();

    return {
      ok: true,
      specialty: {
        id: String(row._id),
        slug: row.slug,
        name: localized(locale, row.nameAr, row.nameEn, row.nameFr),
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        nameFr: row.nameFr,
        description: localized(
          locale,
          row.descriptionAr,
          row.descriptionEn,
          row.descriptionFr,
        ),
        descriptionAr: row.descriptionAr,
        descriptionEn: row.descriptionEn,
        descriptionFr: row.descriptionFr,
        icon: row.icon,
        image: row.image || null,
        isFeatured: row.isFeatured,
        serviceCount: services.total,
        doctorCount: doctors.length,
      },
      services: services.services,
      doctors: doctors.map((d) => ({
        id: String(d._id),
        fullName: d.fullName,
        specialtyAr: d.doctor?.specialtyAr,
        specialtyEn: d.doctor?.specialtyEn,
        specialtyFr: d.doctor?.specialtyFr,
        bioAr: d.doctor?.bioAr,
        bioEn: d.doctor?.bioEn,
        bioFr: d.doctor?.bioFr,
      })),
    };
  }

  async listPublicServices(query: {
    locale?: string;
    specialty?: string;
    featured?: boolean;
    limit?: number;
    page?: number;
    search?: string;
  }) {
    const limit = Math.min(48, Math.max(1, query.limit ?? 24));
    const page = Math.max(1, query.page ?? 1);

    const publicSpecialtyIds = (
      await this.specialties
        .find(this.publicSpecialtyFilter())
        .select({ _id: 1, slug: 1 })
        .lean()
    ).map((s) => s._id);

    const filter: Record<string, unknown> = {
      ...this.publicServiceFilter(),
      specialtyIds: { $in: publicSpecialtyIds },
    };
    if (query.featured) filter.isFeatured = true;

    if (query.specialty) {
      const specialty = await this.specialties
        .findOne({
          ...this.publicSpecialtyFilter(),
          $or: [
            { slug: query.specialty },
            { aliases: query.specialty },
          ],
        })
        .select({ _id: 1 })
        .lean();
      if (!specialty) {
        return { ok: true, total: 0, page, limit, services: [] };
      }
      filter.specialtyIds = specialty._id;
    }

    if (query.search?.trim()) {
      const q = query.search.trim().slice(0, 80);
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { nameAr: re },
        { nameEn: re },
        { nameFr: re },
        { slug: re },
      ];
    }

    const [total, rows] = await Promise.all([
      this.services.countDocuments(filter),
      this.services
        .find(filter)
        .sort({ isFeatured: -1, displayOrder: 1, nameAr: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const allSpecialtyIds = [
      ...new Set(rows.flatMap((r) => (r.specialtyIds || []).map(String))),
    ];
    const parentSpecs = await this.specialties
      .find({
        _id: { $in: allSpecialtyIds.map((id) => new Types.ObjectId(id)) },
        ...this.publicSpecialtyFilter(),
      })
      .select({
        _id: 1,
        slug: 1,
        nameAr: 1,
        nameEn: 1,
        nameFr: 1,
      })
      .lean();
    const parentMap = new Map(parentSpecs.map((s) => [String(s._id), s]));

    const services = [];
    for (const r of rows) {
      let doctorCount = 0;
      if (r.doctorIds?.length) {
        doctorCount = await this.users.countDocuments({
          _id: { $in: r.doctorIds },
          deletedAt: null,
          status: "ACTIVE",
          doctor: { $exists: true },
          "doctor.isActive": { $ne: false },
        });
      }
      const parents = (r.specialtyIds || [])
        .map((id) => parentMap.get(String(id)))
        .filter(Boolean)
        .map((s) => ({
          id: String(s!._id),
          slug: s!.slug,
          name: localized(query.locale, s!.nameAr, s!.nameEn, s!.nameFr),
        }));

      services.push({
        id: String(r._id),
        slug: r.slug,
        name: localized(query.locale, r.nameAr, r.nameEn, r.nameFr),
        nameAr: r.nameAr,
        nameEn: r.nameEn,
        nameFr: r.nameFr,
        description: localized(
          query.locale,
          r.descriptionAr,
          r.descriptionEn,
          r.descriptionFr,
        ),
        shortDescription: shortDesc(query.locale, r as DentalServiceDocument),
        descriptionAr: r.descriptionAr,
        descriptionEn: r.descriptionEn,
        descriptionFr: r.descriptionFr,
        shortDescriptionAr: r.shortDescriptionAr,
        shortDescriptionEn: r.shortDescriptionEn,
        shortDescriptionFr: r.shortDescriptionFr,
        icon: r.icon,
        image: r.image || null,
        specialties: parents,
        specialtyIds: parents.map((p) => p.id),
        doctorCount,
        durationMinutes: r.durationMinutes ?? null,
        priceFrom:
          r.priceApproved && typeof r.priceFrom === "number"
            ? r.priceFrom
            : null,
        currency: r.priceApproved ? r.currency : null,
        requiresConsultation: r.requiresConsultation === true,
        isFeatured: r.isFeatured,
      });
    }

    return { ok: true, total, page, limit, services };
  }

  async getPublicService(slug: string, locale?: string) {
    const row = await this.services
      .findOne({
        ...this.publicServiceFilter(),
        $or: [{ slug }, { aliases: slug }],
      })
      .lean();
    if (!row) return null;

    const parents = await this.specialties
      .find({
        _id: { $in: row.specialtyIds || [] },
        ...this.publicSpecialtyFilter(),
      })
      .lean();
    if (!parents.length) return null;

    const doctors = await this.users
      .find({
        _id: { $in: row.doctorIds || [] },
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
      })
      .select({
        fullName: 1,
        "doctor.specialtyAr": 1,
        "doctor.specialtyEn": 1,
        "doctor.specialtyFr": 1,
      })
      .lean();

    return {
      ok: true,
      service: {
        id: String(row._id),
        slug: row.slug,
        name: localized(locale, row.nameAr, row.nameEn, row.nameFr),
        nameAr: row.nameAr,
        nameEn: row.nameEn,
        nameFr: row.nameFr,
        description: localized(
          locale,
          row.descriptionAr,
          row.descriptionEn,
          row.descriptionFr,
        ),
        shortDescription: shortDesc(locale, row as DentalServiceDocument),
        descriptionAr: row.descriptionAr,
        descriptionEn: row.descriptionEn,
        descriptionFr: row.descriptionFr,
        icon: row.icon,
        image: row.image || null,
        specialties: parents.map((s) => ({
          id: String(s._id),
          slug: s.slug,
          name: localized(locale, s.nameAr, s.nameEn, s.nameFr),
        })),
        doctorCount: doctors.length,
        durationMinutes: row.durationMinutes ?? null,
        priceFrom:
          row.priceApproved && typeof row.priceFrom === "number"
            ? row.priceFrom
            : null,
        currency: row.priceApproved ? row.currency : null,
        requiresConsultation: row.requiresConsultation === true,
        isFeatured: row.isFeatured,
      },
      doctors: doctors.map((d) => ({
        id: String(d._id),
        fullName: d.fullName,
        specialtyAr: d.doctor?.specialtyAr,
        specialtyEn: d.doctor?.specialtyEn,
        specialtyFr: d.doctor?.specialtyFr,
      })),
    };
  }

  async assertBookingRelation(input: {
    specialtySlug?: string;
    serviceSlug?: string;
    doctorId?: string;
  }) {
    let specialty: SpecialtyDocument | null = null;
    let service: DentalServiceDocument | null = null;

    if (input.specialtySlug) {
      specialty = await this.specialties.findOne({
        ...this.publicSpecialtyFilter(),
        $or: [
          { slug: input.specialtySlug },
          { aliases: input.specialtySlug },
        ],
      });
      if (!specialty) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "التخصص غير متاح.",
          fieldErrors: { specialtySlug: ["التخصص غير صالح."] },
        });
      }
    }

    if (input.serviceSlug) {
      service = await this.services.findOne({
        ...this.publicServiceFilter(),
        $or: [{ slug: input.serviceSlug }, { aliases: input.serviceSlug }],
      });
      if (!service) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "الخدمة غير متاحة.",
          fieldErrors: { serviceSlug: ["الخدمة غير صالحة."] },
        });
      }
      if (specialty) {
        const linked = (service.specialtyIds || []).some(
          (id) => String(id) === String(specialty!._id),
        );
        if (!linked) {
          throw new BadRequestException({
            code: ErrorCodes.VALIDATION_ERROR,
            message: "الخدمة غير مرتبطة بهذا التخصص.",
            fieldErrors: {
              serviceSlug: ["الخدمة لا تنتمي للتخصص المحدد."],
            },
          });
        }
      }
    }

    if (input.doctorId) {
      if (!Types.ObjectId.isValid(input.doctorId)) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "معرّف الطبيب غير صالح.",
        });
      }
      const doctor = await this.users.findOne({
        _id: input.doctorId,
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
      });
      if (!doctor) {
        throw new NotFoundException({
          code: ErrorCodes.NOT_FOUND,
          message: "الطبيب غير متاح للحجز.",
        });
      }
      if (service && service.doctorIds?.length) {
        const linked = service.doctorIds.some(
          (id) => String(id) === String(doctor._id),
        );
        if (!linked) {
          throw new BadRequestException({
            code: ErrorCodes.VALIDATION_ERROR,
            message: "الطبيب لا يقدم هذه الخدمة.",
            fieldErrors: {
              preferredDoctorId: ["الطبيب غير مرتبط بالخدمة المحددة."],
            },
          });
        }
      }
    }

    return { specialty, service };
  }

  // ——— Admin ———

  async listAdminSpecialties(query: {
    q?: string;
    page?: number;
    pageSize?: number;
    archived?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
    const filter: Record<string, unknown> =
      query.archived === "true"
        ? { archivedAt: { $ne: null } }
        : { archivedAt: null };
    if (query.q?.trim()) {
      const re = new RegExp(
        query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { nameAr: re },
        { nameEn: re },
        { nameFr: re },
        { slug: re },
      ];
    }
    const [total, rows] = await Promise.all([
      this.specialties.countDocuments(filter),
      this.specialties
        .find(filter)
        .sort({ displayOrder: 1, nameAr: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);
    return {
      ok: true,
      total,
      page,
      pageSize,
      specialties: rows.map((r) => this.toAdminSpecialty(r)),
    };
  }

  async getAdminSpecialty(id: string) {
    const row = await this.specialties.findById(id).lean();
    if (!row) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    const linkedServices = await this.services
      .find({ specialtyIds: row._id, archivedAt: null })
      .select({ slug: 1, nameAr: 1, nameEn: 1, isActive: 1, isPublic: 1 })
      .lean();
    return {
      ok: true,
      specialty: this.toAdminSpecialty(row),
      services: linkedServices.map((s) => ({
        id: String(s._id),
        slug: s.slug,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        isActive: s.isActive,
        isPublic: s.isPublic,
      })),
    };
  }

  private toAdminSpecialty(r: {
    _id: Types.ObjectId | string;
    nameAr?: string;
    nameEn?: string;
    nameFr?: string;
    slug?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
    isPublic?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    doctorIds?: Types.ObjectId[];
    aliases?: string[];
    archivedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: String(r._id),
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      nameFr: r.nameFr,
      slug: r.slug,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      descriptionFr: r.descriptionFr,
      icon: r.icon,
      image: r.image,
      isActive: r.isActive,
      isPublic: r.isPublic,
      isFeatured: r.isFeatured,
      displayOrder: r.displayOrder,
      doctorIds: (r.doctorIds || []).map(String),
      aliases: r.aliases || [],
      archivedAt: r.archivedAt || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async upsertSpecialty(
    dto: {
      id?: string;
      nameAr: string;
      nameEn: string;
      nameFr: string;
      slug: string;
      descriptionAr?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      icon?: string;
      image?: string;
      isActive?: boolean;
      isPublic?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
      doctorIds?: string[];
    },
    user: AuthUser,
  ) {
    const slug = dto.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Slug غير صالح.",
      });
    }
    const clash = await this.specialties.findOne({
      slug,
      ...(dto.id ? { _id: { $ne: dto.id } } : {}),
    });
    if (clash) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "Slug التخصص مستخدم مسبقًا.",
      });
    }
    const doctorIds = (dto.doctorIds || [])
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const payload = {
      nameAr: dto.nameAr.trim(),
      nameEn: dto.nameEn.trim(),
      nameFr: dto.nameFr.trim(),
      slug,
      descriptionAr: dto.descriptionAr?.trim() || "",
      descriptionEn: dto.descriptionEn?.trim() || "",
      descriptionFr: dto.descriptionFr?.trim() || "",
      icon: dto.icon?.trim() || "tooth",
      ...(dto.image !== undefined
        ? { image: dto.image?.trim() || "" }
        : {}),
      isActive: dto.isActive !== false,
      isPublic: dto.isPublic === true,
      isFeatured: dto.isFeatured === true,
      displayOrder: dto.displayOrder ?? 100,
      doctorIds,
    };

    if (dto.id) {
      const updated = await this.specialties.findByIdAndUpdate(
        dto.id,
        { $set: payload },
        { new: true },
      );
      if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
      await this.audit.write({ actor: user, action: "specialty.update", entityType: "specialty", entityId: dto.id });
      return { ok: true, specialty: this.toAdminSpecialty(updated.toObject()) };
    }

    const created = await this.specialties.create({
      ...payload,
      aliases: [slug],
      archivedAt: null,
    });
    await this.audit.write({ actor: user, action: "specialty.create", entityType: "specialty", entityId: String(created._id) });
    return { ok: true, specialty: this.toAdminSpecialty(created.toObject()) };
  }

  async setSpecialtyFlags(
    id: string,
    flags: Partial<{
      isActive: boolean;
      isPublic: boolean;
      isFeatured: boolean;
    }>,
    user: AuthUser,
  ) {
    const updated = await this.specialties.findByIdAndUpdate(
      id,
      { $set: flags },
      { new: true },
    );
    if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    await this.audit.write({ actor: user, action: "specialty.flags", entityType: "specialty", entityId: id, newValue: flags });
    return { ok: true, specialty: this.toAdminSpecialty(updated.toObject()) };
  }

  async archiveSpecialty(id: string, user: AuthUser, restore = false) {
    const updated = await this.specialties.findByIdAndUpdate(
      id,
      {
        $set: restore
          ? { archivedAt: null }
          : { archivedAt: new Date(), isPublic: false },
      },
      { new: true },
    );
    if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    await this.audit.write({ actor: user,
      action: restore ? "specialty.restore" : "specialty.archive",
      
      entityType: "specialty",
      entityId: id,
    });
    return { ok: true };
  }

  async reorderSpecialties(orderedIds: string[], user: AuthUser) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.specialties.updateOne(
          { _id: id },
          { $set: { displayOrder: (index + 1) * 10 } },
        ),
      ),
    );
    await this.audit.write({ actor: user,
      action: "specialty.reorder",
      
      entityType: "specialty",
      newValue: { count: orderedIds.length },
    });
    return { ok: true };
  }

  async listAdminServices(query: {
    q?: string;
    specialtyId?: string;
    page?: number;
    pageSize?: number;
    archived?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
    const filter: Record<string, unknown> =
      query.archived === "true"
        ? { archivedAt: { $ne: null } }
        : { archivedAt: null };
    if (query.specialtyId && Types.ObjectId.isValid(query.specialtyId)) {
      filter.specialtyIds = new Types.ObjectId(query.specialtyId);
    }
    if (query.q?.trim()) {
      const re = new RegExp(
        query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filter.$or = [
        { nameAr: re },
        { nameEn: re },
        { nameFr: re },
        { slug: re },
      ];
    }
    const [total, rows] = await Promise.all([
      this.services.countDocuments(filter),
      this.services
        .find(filter)
        .sort({ displayOrder: 1, nameAr: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);
    return {
      ok: true,
      total,
      page,
      pageSize,
      services: rows.map((r) => this.toAdminService(r)),
    };
  }

  async getAdminService(id: string) {
    const row = await this.services.findById(id).lean();
    if (!row) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    return { ok: true, service: this.toAdminService(row) };
  }

  private toAdminService(r: {
    _id: Types.ObjectId | string;
    nameAr?: string;
    nameEn?: string;
    nameFr?: string;
    slug?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    shortDescriptionAr?: string;
    shortDescriptionEn?: string;
    shortDescriptionFr?: string;
    specialtyIds?: Types.ObjectId[];
    doctorIds?: Types.ObjectId[];
    icon?: string;
    image?: string;
    durationMinutes?: number | null;
    priceFrom?: number | null;
    currency?: string;
    priceApproved?: boolean;
    requiresConsultation?: boolean;
    isActive?: boolean;
    isPublic?: boolean;
    isFeatured?: boolean;
    displayOrder?: number;
    aliases?: string[];
    archivedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    return {
      id: String(r._id),
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      nameFr: r.nameFr,
      slug: r.slug,
      descriptionAr: r.descriptionAr,
      descriptionEn: r.descriptionEn,
      descriptionFr: r.descriptionFr,
      shortDescriptionAr: r.shortDescriptionAr,
      shortDescriptionEn: r.shortDescriptionEn,
      shortDescriptionFr: r.shortDescriptionFr,
      specialtyIds: (r.specialtyIds || []).map(String),
      doctorIds: (r.doctorIds || []).map(String),
      icon: r.icon,
      image: r.image,
      durationMinutes: r.durationMinutes ?? null,
      priceFrom: r.priceFrom ?? null,
      currency: r.currency || "DZD",
      priceApproved: r.priceApproved === true,
      requiresConsultation: r.requiresConsultation === true,
      isActive: r.isActive,
      isPublic: r.isPublic,
      isFeatured: r.isFeatured,
      displayOrder: r.displayOrder,
      aliases: r.aliases || [],
      archivedAt: r.archivedAt || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async upsertService(
    dto: {
      id?: string;
      nameAr: string;
      nameEn: string;
      nameFr: string;
      slug: string;
      descriptionAr?: string;
      descriptionEn?: string;
      descriptionFr?: string;
      shortDescriptionAr?: string;
      shortDescriptionEn?: string;
      shortDescriptionFr?: string;
      specialtyIds: string[];
      doctorIds?: string[];
      icon?: string;
      image?: string;
      durationMinutes?: number | null;
      priceFrom?: number | null;
      currency?: string;
      priceApproved?: boolean;
      requiresConsultation?: boolean;
      isActive?: boolean;
      isPublic?: boolean;
      isFeatured?: boolean;
      displayOrder?: number;
    },
    user: AuthUser,
  ) {
    const slug = dto.slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "Slug غير صالح.",
      });
    }
    if (!dto.specialtyIds?.length) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يجب ربط الخدمة بتخصص واحد على الأقل.",
      });
    }
    const specialtyIds = dto.specialtyIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    if (!specialtyIds.length) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّفات التخصصات غير صالحة.",
      });
    }

    const wantPublic = dto.isPublic === true;
    if (wantPublic) {
      const desc =
        dto.descriptionAr?.trim() ||
        dto.descriptionEn?.trim() ||
        dto.descriptionFr?.trim();
      if (!dto.nameAr?.trim() || !desc || dto.isActive === false) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message:
            "لا يمكن نشر الخدمة بدون اسم ووصف عام وحالة نشطة.",
        });
      }
    }

    const clash = await this.services.findOne({
      slug,
      ...(dto.id ? { _id: { $ne: dto.id } } : {}),
    });
    if (clash) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "Slug الخدمة مستخدم مسبقًا.",
      });
    }

    const payload = {
      nameAr: dto.nameAr.trim(),
      nameEn: dto.nameEn.trim(),
      nameFr: dto.nameFr.trim(),
      slug,
      descriptionAr: dto.descriptionAr?.trim() || "",
      descriptionEn: dto.descriptionEn?.trim() || "",
      descriptionFr: dto.descriptionFr?.trim() || "",
      shortDescriptionAr: dto.shortDescriptionAr?.trim() || "",
      shortDescriptionEn: dto.shortDescriptionEn?.trim() || "",
      shortDescriptionFr: dto.shortDescriptionFr?.trim() || "",
      specialtyIds,
      doctorIds: (dto.doctorIds || [])
        .filter((id) => Types.ObjectId.isValid(id))
        .map((id) => new Types.ObjectId(id)),
      icon: dto.icon?.trim() || "tooth",
      ...(dto.image !== undefined ? { image: dto.image?.trim() || "" } : {}),
      durationMinutes:
        typeof dto.durationMinutes === "number" ? dto.durationMinutes : null,
      priceFrom: typeof dto.priceFrom === "number" ? dto.priceFrom : null,
      currency: dto.currency?.trim() || "DZD",
      priceApproved: dto.priceApproved === true,
      requiresConsultation: dto.requiresConsultation === true,
      isActive: dto.isActive !== false,
      isPublic: wantPublic,
      isFeatured: dto.isFeatured === true,
      displayOrder: dto.displayOrder ?? 100,
    };

    if (dto.id) {
      const updated = await this.services.findByIdAndUpdate(
        dto.id,
        { $set: payload },
        { new: true },
      );
      if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
      await this.audit.write({ actor: user, action: "service.update", entityType: "dental_service", entityId: dto.id });
      return { ok: true, service: this.toAdminService(updated.toObject()) };
    }

    const created = await this.services.create({
      ...payload,
      aliases: [slug],
      archivedAt: null,
    });
    await this.audit.write({ actor: user, action: "service.create", entityType: "dental_service", entityId: String(created._id) });
    return { ok: true, service: this.toAdminService(created.toObject()) };
  }

  async setServiceFlags(
    id: string,
    flags: Partial<{
      isActive: boolean;
      isPublic: boolean;
      isFeatured: boolean;
    }>,
    user: AuthUser,
  ) {
    if (flags.isPublic === true) {
      const row = await this.services.findById(id);
      if (!row) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
      if (
        !row.nameAr ||
        !row.specialtyIds?.length ||
        !(row.descriptionAr || row.descriptionEn || row.descriptionFr) ||
        !row.isActive
      ) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "لا يمكن نشر الخدمة: بيانات النشر غير مكتملة.",
        });
      }
    }
    const updated = await this.services.findByIdAndUpdate(
      id,
      { $set: flags },
      { new: true },
    );
    if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    await this.audit.write({ actor: user, action: "service.flags", entityType: "dental_service", entityId: id, newValue: flags });
    return { ok: true, service: this.toAdminService(updated.toObject()) };
  }

  async archiveService(id: string, user: AuthUser, restore = false) {
    const updated = await this.services.findByIdAndUpdate(
      id,
      {
        $set: {
          archivedAt: restore ? null : new Date(),
          ...(restore ? {} : { isPublic: false }),
        },
      },
      { new: true },
    );
    if (!updated) throw new NotFoundException({ code: ErrorCodes.NOT_FOUND });
    await this.audit.write({ actor: user,
      action: restore ? "service.restore" : "service.archive",
      
      entityType: "dental_service",
      entityId: id,
    });
    return { ok: true };
  }

  async reorderServices(orderedIds: string[], user: AuthUser) {
    await Promise.all(
      orderedIds.map((id, index) =>
        this.services.updateOne(
          { _id: id },
          { $set: { displayOrder: (index + 1) * 10 } },
        ),
      ),
    );
    await this.audit.write({ actor: user,
      action: "service.reorder",
      
      entityType: "dental_service",
      newValue: { count: orderedIds.length },
    });
    return { ok: true };
  }
}
