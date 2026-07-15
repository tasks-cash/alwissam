import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class PublicCatalogQueryDto {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  active?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(48)
  limit?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

export class UpsertSpecialtyDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameEn!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameFr!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

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
  @Max(10000)
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doctorIds?: string[];
}

export class UpsertServiceDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameAr!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameEn!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nameFr!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  descriptionFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  shortDescriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  shortDescriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  shortDescriptionFr?: string;

  @IsArray()
  @IsString({ each: true })
  specialtyIds!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  doctorIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(40)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationMinutes?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceFrom?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsBoolean()
  priceApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresConsultation?: boolean;

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
  @Max(10000)
  displayOrder?: number;
}

export class CatalogIdDto {
  @IsString()
  id!: string;
}

export class CatalogFeatureDto {
  @IsString()
  id!: string;

  @IsBoolean()
  featured!: boolean;
}

export class CatalogPublishDto {
  @IsString()
  id!: string;

  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

export class CatalogActiveDto {
  @IsString()
  id!: string;

  @IsBoolean()
  active!: boolean;
}

export class ReorderCatalogDto {
  @IsArray()
  @IsString({ each: true })
  orderedIds!: string[];
}

export class AdminListQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

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
}
