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
import { ListPublicReviewsQueryDto } from "./dto/review-query.dto";
import { SubmitPublicReviewDto } from "./dto/submit-review.dto";
import { ReviewsService } from "./reviews.service";

@ApiTags("public-reviews")
@Controller("api/public/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async list(@Query() query: ListPublicReviewsQueryDto) {
    const result = await this.reviewsService.listPublic(query);
    return {
      ...result,
      /** Backward-compatible alias */
      reviews: result.items,
    };
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
    return this.reviewsService.submitPublic(dto, ip);
  }
}
