import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { FAQ_CATEGORIES } from "../faq.categories";

export class PublicFaqsQueryDto {
  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(["true", "false", "1", "0"])
  featured?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class AdminFaqsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  category?: string;

  @IsOptional()
  @IsIn(["true", "false", "1", "0"])
  active?: string;

  @IsOptional()
  @IsIn(["true", "false", "1", "0"])
  published?: string;

  @IsOptional()
  @IsIn(["true", "false", "1", "0"])
  featured?: string;

  @IsOptional()
  @IsIn(["true", "false", "1", "0"])
  archived?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number;
}

export class UpsertFaqDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  questionAr!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  questionEn!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(500)
  questionFr!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  answerAr!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  answerEn!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  answerFr!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsIn([...FAQ_CATEGORIES])
  category!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywordsAr?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywordsEn?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywordsFr?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedSpecialtySlugs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedServiceSlugs?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  relatedSpecialtyIds?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  relatedServiceIds?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100000)
  displayOrder?: number;
}

export class FaqIdDto {
  @IsMongoId()
  id!: string;
}

export class FaqPublishDto {
  @IsMongoId()
  id!: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

export class FaqActiveDto {
  @IsMongoId()
  id!: string;

  @IsBoolean()
  active!: boolean;
}

export class FaqFeatureDto {
  @IsMongoId()
  id!: string;

  @IsBoolean()
  featured!: boolean;
}

export class ReorderFaqsDto {
  @IsArray()
  @IsMongoId({ each: true })
  orderedIds!: string[];
}
