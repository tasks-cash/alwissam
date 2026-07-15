import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { PatientExperiencesService } from "./patient-experiences.service";

class PublicExperiencesQuery {
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
  @Max(10)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

@ApiTags("patient-experiences-public")
@Controller("api/public/patient-experiences")
export class PatientExperiencesPublicController {
  constructor(private readonly service: PatientExperiencesService) {}

  @Get()
  list(@Query() query: PublicExperiencesQuery) {
    return this.service.listPublic({
      locale: query.locale,
      featured: query.featured === "true",
      limit: query.limit,
      page: query.page,
    });
  }
}
