import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  FULL_NAME_MIN,
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
} from "@alwisam/shared-validation";

function mapEasternDigits(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - "٠".charCodeAt(0)))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - "۰".charCodeAt(0)));
}

export class CreatePatientDto {
  @ApiProperty()
  @IsString({ message: "الاسم الكامل مطلوب." })
  @MinLength(FULL_NAME_MIN, { message: "الاسم الكامل مطلوب." })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName!: string;

  @ApiProperty()
  @IsString({ message: "رقم الهاتف غير صالح." })
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS, {
    message: "طول رقم الهاتف غير صالح.",
  })
  @Transform(({ value }) => mapEasternDigits(value))
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v !== undefined && v !== "")
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح." })
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? value.trim().toLowerCase()
      : undefined,
  )
  email?: string;

  @ApiPropertyOptional({ enum: ["MALE", "FEMALE"] })
  @IsOptional()
  @IsIn(["MALE", "FEMALE"])
  gender?: "MALE" | "FEMALE";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryDoctorId?: string;
}

export class UpdatePatientDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  patientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(FULL_NAME_MIN)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== "string" || !value.trim()) return undefined;
    return mapEasternDigits(value);
  })
  @ValidateIf((_, v) => v !== undefined)
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, v) => v !== undefined && v !== "")
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح." })
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? value.trim().toLowerCase()
      : undefined,
  )
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(["MALE", "FEMALE"])
  gender?: "MALE" | "FEMALE";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryDoctorId?: string;
}

export class ListPatientsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pageSize?: string;
}
