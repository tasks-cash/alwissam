import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";

export class ListPublicReviewsQueryDto {
  @ApiPropertyOptional({ enum: ["ar", "en", "fr"] })
  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialtyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialtySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpsertReviewDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayNameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayNameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayNameFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  subjectAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  subjectEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  subjectFr?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  quoteAr!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  quoteFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialtySlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @ApiPropertyOptional({
    enum: ["male", "female", "neutral", "initials", "uploaded"],
  })
  @IsOptional()
  @IsIn(["male", "female", "neutral", "initials", "uploaded"])
  avatarType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  patientImage?: string;

  @ApiPropertyOptional({ enum: ["ar", "en", "fr"] })
  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(["DRAFT", "PENDING", "APPROVED", "REJECTED", "PUBLISHED", "ARCHIVED"])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sourceKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSample?: boolean;
}

export class ReviewIdDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  id!: string;
}
