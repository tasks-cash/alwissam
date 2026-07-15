import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  normalizeEmail,
  toCanonicalPhone,
  normalizePhoneDigits,
} from "@alwisam/shared-validation";

export class CreateStaffInvitationDto {
  @ApiProperty({ enum: ["DOCTOR", "SECRETARY"] })
  @IsIn(["DOCTOR", "SECRETARY"])
  role!: "DOCTOR" | "SECRETARY";

  @ApiPropertyOptional({ enum: ["GENERAL", "SPECIALIST"] })
  @ValidateIf((o: CreateStaffInvitationDto) => o.role === "DOCTOR")
  @IsOptional()
  @IsIn(["GENERAL", "SPECIALIST"])
  doctorType?: "GENERAL" | "SPECIALIST";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => !!v)
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? normalizeEmail(value)
      : undefined,
  )
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== "string" || !value.trim()) return undefined;
    return toCanonicalPhone(value) || normalizePhoneDigits(value);
  })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workEndTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workDays?: string;

  @ApiPropertyOptional({ description: "Expires in hours", default: 72 })
  @IsOptional()
  expiresInHours?: number;
}

export class RegisterInvitationDto {
  @ApiProperty()
  @IsString()
  @MinLength(10)
  invitationToken!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => !!v)
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? normalizeEmail(value)
      : undefined,
  )
  email?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) =>
    typeof value === "string"
      ? toCanonicalPhone(value) || normalizePhoneDigits(value) || value.trim()
      : value,
  )
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  confirmPassword!: string;

  @ApiPropertyOptional({ enum: ["ar", "en", "fr"] })
  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: "ar" | "en" | "fr";

  @ApiProperty()
  privacyAccepted!: boolean;

  @ApiProperty()
  termsAccepted!: boolean;
}
