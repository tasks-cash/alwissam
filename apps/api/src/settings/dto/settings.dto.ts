import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
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

  @ApiPropertyOptional({
    description: "Structured weekly schedule (morning/evening per day)",
    type: "array",
    items: { type: "object" },
  })
  @IsOptional()
  @IsArray()
  weeklySchedule?: Array<Record<string, unknown>>;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  contactHeroTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  contactHeroTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  contactHeroTitleFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  contactHeroDescriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  contactHeroDescriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  contactHeroDescriptionFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  contactHeroImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  inquirySectionTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  inquirySectionDescriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  locationSectionTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  locationSectionDescriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  contactSeoTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  contactSeoDescriptionAr?: string;

  @IsOptional()
  @IsBoolean()
  contactPublished?: boolean;
}

export class UpsertSpecialtiesPageDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  badgeFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  titleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  titleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  titleFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  descriptionFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  imageAltAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  imageAltEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  imageAltFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  primaryCtaLabelAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  primaryCtaRoute?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  secondaryCtaLabelAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  secondaryCtaRoute?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
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
  @ApiProperty({ enum: ["clinic_info", "public_pages", "specialties_page"] })
  @IsIn(["clinic_info", "public_pages", "specialties_page"])
  section!: "clinic_info" | "public_pages" | "specialties_page";

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

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => UpsertSpecialtiesPageDto)
  specialtiesPage?: UpsertSpecialtiesPageDto;
}
