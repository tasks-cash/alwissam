import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Type } from "class-transformer";

export class UpsertBeforeAfterDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  titleAr!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleFr?: string;

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

  @IsString()
  @MaxLength(500)
  beforeImageUrl!: string;

  @IsString()
  @MaxLength(500)
  afterImageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  beforeAltAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  beforeAltEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  beforeAltFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  afterAltAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  afterAltEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  afterAltFr?: string;

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
  @MaxLength(120)
  treatmentCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  treatmentDuration?: string;

  @IsOptional()
  @IsString()
  resultDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  patientAgeRange?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

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

export class BeforeAfterIdDto {
  @IsMongoId()
  id!: string;
}

export class BeforeAfterFeatureDto {
  @IsMongoId()
  id!: string;

  @IsBoolean()
  featured!: boolean;
}

export class ReorderBeforeAfterDto {
  @IsMongoId({ each: true })
  orderedIds!: string[];
}

export class ListBeforeAfterQueryDto {
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
  @ValidateIf((_, v) => v !== "" && v != null)
  @IsMongoId()
  doctorId?: string;

  @IsOptional()
  @IsString()
  specialtySlug?: string;

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
}
