import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { BeforeAfterService } from "./before-after.service";

class PublicBeforeAfterQuery {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

@ApiTags("before-after-public")
@Controller("api/public/before-after")
export class BeforeAfterPublicController {
  constructor(private readonly service: BeforeAfterService) {}

  @Get()
  list(@Query() query: PublicBeforeAfterQuery) {
    return this.service.listPublic({
      locale: query.locale,
      featured: query.featured === "true",
      limit: query.limit,
      page: query.page,
    });
  }
}
