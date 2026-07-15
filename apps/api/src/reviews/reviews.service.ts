import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ErrorCodes } from "../common/errors/error-codes";
import { SubmitPublicReviewDto } from "./dto/submit-review.dto";
import { Review } from "./schemas/review.schema";

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private readonly reviews: Model<Review>) {}

  async listApproved(limit = 24) {
    const rows = await this.reviews
      .find({ status: "APPROVED", deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(Math.min(100, Math.max(1, limit)))
      .lean();

    return {
      ok: true,
      reviews: rows.map((r) => ({
        id: String(r._id),
        displayName: r.displayName,
        quoteAr: r.quoteAr,
        quoteEn: r.quoteEn || r.quoteAr,
        quoteFr: r.quoteFr || r.quoteEn || r.quoteAr,
        rating: r.rating,
        doctorId: r.doctorId ? String(r.doctorId) : undefined,
        serviceSlug: r.serviceSlug,
        verified: r.verified === true,
        createdAt: (r as { createdAt?: Date }).createdAt,
      })),
    };
  }

  async submit(dto: SubmitPublicReviewDto, ip?: string) {
    if (ip) {
      const recent = await this.reviews.findOne({
        ipAddress: ip,
        createdAt: { $gte: new Date(Date.now() - 10 * 60_000) },
      });
      if (recent) {
        throw new HttpException(
          {
            code: ErrorCodes.RATE_LIMITED,
            message: "يرجى الانتظار قبل إرسال تقييم آخر.",
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    if (dto.doctorId && !Types.ObjectId.isValid(dto.doctorId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف الطبيب غير صالح.",
      });
    }

    await this.reviews.create({
      displayName: dto.displayName,
      quoteAr: dto.quote,
      quoteEn: dto.quote,
      quoteFr: dto.quote,
      rating: dto.rating || 5,
      doctorId: dto.doctorId
        ? new Types.ObjectId(dto.doctorId)
        : undefined,
      status: "PENDING",
      verified: false,
      ipAddress: ip,
    });

    return {
      ok: true,
      message: "شكرًا لكم. سيُراجع التقييم قبل النشر.",
    };
  }
}
