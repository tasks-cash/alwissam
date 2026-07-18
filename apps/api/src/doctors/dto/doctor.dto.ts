import {
  IsBoolean,
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
  DOCTOR_TYPES,
  FULL_NAME_MIN,
  PASSWORD_MIN_CREATE,
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

export class CreateDoctorDto {
  @ApiProperty()
  @IsString({ message: "الاسم الكامل مطلوب." })
  @MinLength(FULL_NAME_MIN, { message: "الاسم الكامل مطلوب." })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName!: string;

  @ApiProperty()
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح." })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  email!: string;

  @ApiProperty()
  @IsString({ message: "رقم الهاتف غير صالح." })
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS, {
    message: "طول رقم الهاتف غير صالح.",
  })
  @Transform(({ value }) => mapEasternDigits(value))
  phone!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_CREATE })
  @IsString({ message: "كلمة المرور مطلوبة." })
  @MinLength(PASSWORD_MIN_CREATE, {
    message: `كلمة المرور قصيرة جدًا (الحد الأدنى ${PASSWORD_MIN_CREATE} أحرف)`,
  })
  password!: string;

  @ApiProperty({ enum: DOCTOR_TYPES })
  @IsIn([...DOCTOR_TYPES], { message: "نوع الطبيب غير صالح" })
  type!: (typeof DOCTOR_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  specialtyAr?: string;
}

export class UpdateDoctorDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  userId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح." })
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? value.trim().toLowerCase()
      : undefined,
  )
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "رقم الهاتف غير صالح." })
  @Transform(({ value }) => {
    if (typeof value !== "string" || !value.trim()) return undefined;
    return mapEasternDigits(value);
  })
  @ValidateIf((_, v) => v !== undefined)
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS, {
    message: "طول رقم الهاتف غير صالح.",
  })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    if (typeof value !== "string") return undefined;
    const t = value.trim();
    return t.length ? t : undefined;
  })
  @ValidateIf((_, v) => v !== undefined)
  @MinLength(PASSWORD_MIN_CREATE)
  newPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  specialtyAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  professionalTitleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  bioAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  })
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === "true") return true;
    if (value === false || value === "false") return false;
    return value;
  })
  isBookable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE"])
  status?: "ACTIVE" | "INACTIVE";
}

export class DeleteDoctorDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  userId!: string;
}

export class ChangeDoctorPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  userId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_CREATE)
  newPassword!: string;
}
