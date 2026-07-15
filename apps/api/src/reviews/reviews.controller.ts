import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { SubmitPublicReviewDto } from "./dto/submit-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("public-reviews")
@Controller("api/public/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  list(@Query("limit") limit?: string) {
    return this.reviewsService.listApproved(Number(limit) || 24);
  }

  @Post()
  @HttpCode(200)
  submit(
    @Body() dto: SubmitPublicReviewDto,
    @Req() req: { ip?: string; headers?: Record<string, string | undefined> },
  ) {
    const ip =
      req.ip ||
      req.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() ||
      undefined;
    return this.reviewsService.submit(dto, ip);
  }
}
