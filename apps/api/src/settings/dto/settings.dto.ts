import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ServiceItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class FaqItemDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  question!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  answer!: string;
}

export class UpsertClinicInfoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nameFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descriptionFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapsEmbedUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapsLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mapUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  directionsUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stateOrWilaya?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryFr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  fridayClosed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneDisplay?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneInternational?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workingHoursAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workingHoursEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workingHoursFr?: string;
}

export class UpsertPublicPagesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aboutFr?: string;

  @ApiPropertyOptional({ type: [ServiceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services?: ServiceItemDto[];

  @ApiPropertyOptional({ type: [FaqItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs?: FaqItemDto[];
}

export class UpsertSettingsDto {
  @ApiProperty({ enum: ["clinic_info", "public_pages"] })
  @IsIn(["clinic_info", "public_pages"])
  section!: "clinic_info" | "public_pages";

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertClinicInfoDto)
  clinicInfo?: UpsertClinicInfoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertPublicPagesDto)
  publicPages?: UpsertPublicPagesDto;
}
