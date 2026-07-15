import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ErrorCodes } from "../common/errors/error-codes";
import { Review, ReviewDocument } from "./schemas/review.schema";
import {
  ListPublicReviewsQueryDto,
  UpsertReviewDto,
} from "./dto/review-query.dto";
import { SubmitPublicReviewDto } from "./dto/submit-review.dto";

const ANON_AR = "مريض من عيادة الوسام";
const ANON_EN = "Al-Wisam clinic patient";
const ANON_FR = "Patient de la clinique Al-Wisam";

type LeanReview = {
  _id: Types.ObjectId;
  displayName: string;
  displayNameAr?: string;
  displayNameEn?: string;
  displayNameFr?: string;
  isAnonymous?: boolean;
  quoteAr: string;
  quoteEn?: string;
  quoteFr?: string;
  reviewAr?: string;
  reviewEn?: string;
  reviewFr?: string;
  rating: number;
  reviewDate?: Date;
  patientImage?: string;
  doctorId?: Types.ObjectId;
  specialtySlug?: string;
  serviceSlug?: string;
  isVerified?: boolean;
  verified?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
  isPublished?: boolean;
  displayOrder?: number;
  status?: string;
  source?: string;
  publishedAt?: Date;
  createdAt?: Date;
};

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private readonly reviews: Model<ReviewDocument>,
  ) {}

  private publicFilter() {
    return {
      deletedAt: null,
      archivedAt: null,
      $or: [
        { isPublished: true, isApproved: true },
        { status: "APPROVED", isPublished: { $ne: false } },
      ],
    };
  }

  private toPublicDto(row: LeanReview, locale = "ar") {
    const anonymous = row.isAnonymous !== false;
    const name =
      locale === "en"
        ? row.displayNameEn || row.displayName
        : locale === "fr"
          ? row.displayNameFr || row.displayName
          : row.displayNameAr || row.displayName;
    const quote =
      locale === "en"
        ? row.quoteEn || row.reviewEn || row.quoteAr || row.reviewAr || ""
        : locale === "fr"
          ? row.quoteFr || row.reviewFr || row.quoteAr || row.reviewAr || ""
          : row.quoteAr || row.reviewAr || "";

    return {
      id: String(row._id),
      displayName: anonymous
        ? locale === "en"
          ? ANON_EN
          : locale === "fr"
            ? ANON_FR
            : ANON_AR
        : name,
      quote,
      quoteAr: row.quoteAr || row.reviewAr || "",
      quoteEn: row.quoteEn || row.reviewEn,
      quoteFr: row.quoteFr || row.reviewFr,
      rating: row.rating,
      reviewDate: row.reviewDate
        ? new Date(row.reviewDate).toISOString().slice(0, 10)
        : row.publishedAt
          ? new Date(row.publishedAt).toISOString().slice(0, 10)
          : row.createdAt
            ? new Date(row.createdAt).toISOString().slice(0, 10)
            : undefined,
      patientImage: row.patientImage || null,
      doctorId: row.doctorId ? String(row.doctorId) : null,
      specialtySlug: row.specialtySlug || null,
      serviceSlug: row.serviceSlug || null,
      isVerified: Boolean(row.isVerified || row.verified),
      isFeatured: Boolean(row.isFeatured),
      isAnonymous: anonymous,
    };
  }

  async listPublic(query: ListPublicReviewsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(48, Math.max(1, query.limit ?? 12));
    const locale = (query.locale || "ar").slice(0, 5);
    const filter: Record<string, unknown> = {
      ...this.publicFilter(),
    };

    if (query.rating) filter.rating = query.rating;
    if (query.doctorId && Types.ObjectId.isValid(query.doctorId)) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }
    if (query.specialtySlug) filter.specialtySlug = query.specialtySlug;
    if (query.serviceSlug) filter.serviceSlug = query.serviceSlug;
    if (query.specialtyId && Types.ObjectId.isValid(query.specialtyId)) {
      filter.specialtyId = new Types.ObjectId(query.specialtyId);
    }
    if (query.serviceId && Types.ObjectId.isValid(query.serviceId)) {
      filter.serviceId = new Types.ObjectId(query.serviceId);
    }
    if (query.verified === true) {
      filter.$and = [
        ...(Array.isArray(filter.$and) ? (filter.$and as unknown[]) : []),
        { $or: [{ isVerified: true }, { verified: true }] },
      ];
    }
    if (query.featured === true) filter.isFeatured = true;
    if (query.search?.trim()) {
      const q = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(q, "i");
      filter.$and = [
        ...(Array.isArray(filter.$and) ? (filter.$and as unknown[]) : []),
        {
          $or: [
            { quoteAr: rx },
            { quoteEn: rx },
            { quoteFr: rx },
            { reviewAr: rx },
            { displayName: rx },
          ],
        },
      ];
    }

    const [total, rows, statsAgg] = await Promise.all([
      this.reviews.countDocuments(filter),
      this.reviews
        .find(filter)
        .sort({ isFeatured: -1, displayOrder: 1, publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.reviews.aggregate([
        { $match: this.publicFilter() },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            verifiedCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ["$isVerified", true] },
                      { $eq: ["$verified", true] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            featuredCount: {
              $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] as
      | {
          count: number;
          avgRating: number;
          verifiedCount: number;
          featuredCount: number;
        }
      | undefined;

    return {
      ok: true,
      items: (rows as unknown as LeanReview[]).map((r) =>
        this.toPublicDto(r, locale),
      ),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      stats: {
        publishedCount: stats?.count ?? 0,
        averageRating: stats?.avgRating
          ? Math.round(stats.avgRating * 10) / 10
          : 0,
        verifiedCount: stats?.verifiedCount ?? 0,
        featuredCount: stats?.featuredCount ?? 0,
      },
    };
  }

  /** @deprecated — prefer listPublic */
  async listApproved(limit = 24) {
    const result = await this.listPublic({ page: 1, limit, locale: "ar" });
    return result.items;
  }

  async submitPublic(dto: SubmitPublicReviewDto, ip?: string) {
    const quoteText = (dto.quoteAr || dto.quote || "").trim();
    if (quoteText.length < 10) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "نص التقييم مطلوب.",
      });
    }
    const created = await this.reviews.create({
      displayName: dto.displayName.trim(),
      displayNameAr: dto.displayName.trim(),
      isAnonymous: true,
      quoteAr: quoteText,
      reviewAr: quoteText,
      rating: dto.rating ?? 5,
      doctorId:
        dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
          ? new Types.ObjectId(dto.doctorId)
          : undefined,
      status: "PENDING",
      isApproved: false,
      isPublished: false,
      isVerified: false,
      consentConfirmed: true,
      source: "public_form",
      ipAddress: ip,
      reviewDate: new Date(),
    });
    return {
      ok: true,
      message: "شكرًا لمشاركتكم. سيتم مراجعة التقييم قبل النشر.",
      id: String(created._id),
    };
  }

  async listAdmin(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const filter: Record<string, unknown> = { deletedAt: null };
    if (query.status) filter.status = query.status;
    if (query.search?.trim()) {
      const q = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(q, "i");
      filter.$or = [
        { displayName: rx },
        { quoteAr: rx },
        { quoteEn: rx },
        { sourceKey: rx },
      ];
    }
    const [total, rows] = await Promise.all([
      this.reviews.countDocuments(filter),
      this.reviews
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);
    return {
      ok: true,
      items: rows,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async createAdmin(dto: UpsertReviewDto, userId?: string) {
    const quote = (dto.quoteAr || "").trim();
    if (!quote) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "نص التقييم مطلوب.",
      });
    }
    const approved = dto.isApproved === true || dto.status === "APPROVED";
    const published = dto.isPublished === true && approved;
    const created = await this.reviews.create({
      ...this.mapUpsert(dto),
      status: dto.status || (approved ? "APPROVED" : "PENDING"),
      isApproved: approved,
      isPublished: published,
      publishedAt: published ? new Date() : undefined,
      createdBy: userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined,
      source: "admin",
    });
    return { ok: true, id: String(created._id) };
  }

  async updateAdmin(id: string, dto: UpsertReviewDto, userId?: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف غير صالح.",
      });
    }
    const patch = this.mapUpsert(dto);
    if (dto.status) patch.status = dto.status;
    if (dto.isApproved !== undefined) patch.isApproved = dto.isApproved;
    if (dto.isPublished !== undefined) {
      patch.isPublished = dto.isPublished;
      if (dto.isPublished) {
        patch.isApproved = true;
        patch.status = "APPROVED";
        patch.publishedAt = new Date();
      }
    }
    patch.updatedBy =
      userId && Types.ObjectId.isValid(userId)
        ? new Types.ObjectId(userId)
        : undefined;

    const updated = await this.reviews
      .findOneAndUpdate({ _id: id, deletedAt: null }, { $set: patch }, {
        new: true,
      })
      .lean();
    if (!updated) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التقييم غير موجود.",
      });
    }
    return { ok: true, item: updated };
  }

  async setStatus(
    id: string,
    action:
      | "approve"
      | "reject"
      | "publish"
      | "unpublish"
      | "feature"
      | "unfeature"
      | "archive"
      | "restore",
    userId?: string,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف غير صالح.",
      });
    }
    const patch: Record<string, unknown> = {
      updatedBy:
        userId && Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : undefined,
    };
    switch (action) {
      case "approve":
        patch.status = "APPROVED";
        patch.isApproved = true;
        break;
      case "reject":
        patch.status = "REJECTED";
        patch.isApproved = false;
        patch.isPublished = false;
        break;
      case "publish":
        patch.status = "APPROVED";
        patch.isApproved = true;
        patch.isPublished = true;
        patch.publishedAt = new Date();
        patch.archivedAt = null;
        break;
      case "unpublish":
        patch.isPublished = false;
        break;
      case "feature":
        patch.isFeatured = true;
        break;
      case "unfeature":
        patch.isFeatured = false;
        break;
      case "archive":
        patch.status = "ARCHIVED";
        patch.isPublished = false;
        patch.archivedAt = new Date();
        break;
      case "restore":
        patch.status = "PENDING";
        patch.archivedAt = null;
        break;
      default:
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "إجراء غير معروف.",
        });
    }
    const updated = await this.reviews
      .findOneAndUpdate({ _id: id, deletedAt: null }, { $set: patch }, {
        new: true,
      })
      .lean();
    if (!updated) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "التقييم غير موجود.",
      });
    }
    return { ok: true, item: updated };
  }

  private mapUpsert(dto: UpsertReviewDto): Record<string, unknown> {
    return {
      displayName: dto.displayName?.trim(),
      displayNameAr: dto.displayNameAr?.trim() || dto.displayName?.trim(),
      displayNameEn: dto.displayNameEn?.trim(),
      displayNameFr: dto.displayNameFr?.trim(),
      quoteAr: dto.quoteAr?.trim(),
      reviewAr: dto.quoteAr?.trim(),
      quoteEn: dto.quoteEn?.trim(),
      reviewEn: dto.quoteEn?.trim(),
      quoteFr: dto.quoteFr?.trim(),
      reviewFr: dto.quoteFr?.trim(),
      rating: dto.rating ?? 5,
      doctorId:
        dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
          ? new Types.ObjectId(dto.doctorId)
          : undefined,
      specialtySlug: dto.specialtySlug,
      serviceSlug: dto.serviceSlug,
      isAnonymous: dto.isAnonymous !== false,
      isVerified: Boolean(dto.isVerified),
      verified: Boolean(dto.isVerified),
      isFeatured: Boolean(dto.isFeatured),
      displayOrder: dto.displayOrder ?? 0,
      sourceKey: dto.sourceKey,
      consentConfirmed: true,
    };
  }
}
