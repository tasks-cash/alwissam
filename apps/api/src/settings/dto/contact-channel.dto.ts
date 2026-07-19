import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import {
  CONTACT_CHANNEL_PLACEMENTS,
  CONTACT_CHANNEL_TYPES,
  type ContactChannelPlacement,
  type ContactChannelType,
} from "../schemas/contact-channel.schema";

export class UpsertContactChannelDto {
  @IsOptional()
  @IsMongoId()
  id?: string;

  @IsEnum(CONTACT_CHANNEL_TYPES)
  type!: ContactChannelType;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  labelAr!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  labelEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  labelFr?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(300)
  value!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(500)
  publicUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  displayOrder?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(CONTACT_CHANNEL_PLACEMENTS.length)
  @IsEnum(CONTACT_CHANNEL_PLACEMENTS, { each: true })
  placement!: ContactChannelPlacement[];
}

export class ContactChannelIdDto {
  @IsMongoId()
  id!: string;
}

export class ContactChannelEnabledDto extends ContactChannelIdDto {
  @IsBoolean()
  enabled!: boolean;
}

export class ReorderContactChannelsDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsMongoId({ each: true })
  orderedIds!: string[];
}
