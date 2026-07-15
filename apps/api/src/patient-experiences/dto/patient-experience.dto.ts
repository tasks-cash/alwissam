import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";

export class UpsertPatientExperienceDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayNameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayNameEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  displayNameFr?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  anonymousLabelAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  anonymousLabelEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  anonymousLabelFr?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(2000)
  reviewAr!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reviewFr?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  patientImageUrl?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== "" && v != null)
  @IsMongoId()
  doctorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  serviceSlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  specialtySlug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  treatmentTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  treatmentTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  treatmentTitleFr?: string;

  @IsOptional()
  @IsString()
  reviewDate?: string;

  @IsOptional()
  @IsBoolean()
  isVerifiedPatient?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  consentConfirmed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  consentDocumentReference?: string;
}

export class ExperienceIdDto {
  @IsMongoId()
  id!: string;
}

export class ExperienceFeatureDto {
  @IsMongoId()
  id!: string;

  @IsBoolean()
  featured!: boolean;
}

export class ReorderExperiencesDto {
  @IsMongoId({ each: true })
  orderedIds!: string[];
}

export class ListExperiencesQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  approval?: string;

  @IsOptional()
  @IsString()
  publication?: string;

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== "" && v != null)
  @IsMongoId()
  doctorId?: string;

  @IsOptional()
  @IsString()
  serviceSlug?: string;

  @IsOptional()
  @IsString()
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
  @Max(100)
  pageSize?: number;

  @IsOptional()
  @IsString()
  sort?: string;
}
