import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
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

export class DoctorScheduleEntryDto {
  @IsIn([
    "SATURDAY",
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
  ])
  dayOfWeek!: string;

  @Matches(/^\d{2}:\d{2}$/)
  startTime!: string;

  @Matches(/^\d{2}:\d{2}$/)
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  professionalTitleAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bioAr?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBookable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\/api\/media\/[a-zA-Z0-9._/-]+$/)
  profileImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsMongoId({ each: true })
  specialtyIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  serviceIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => DoctorScheduleEntryDto)
  weeklySchedule?: DoctorScheduleEntryDto[];
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(FULL_NAME_MIN)
  @MaxLength(160)
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn([...DOCTOR_TYPES])
  type?: (typeof DOCTOR_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\/api\/media\/[a-zA-Z0-9._/-]+$/)
  profileImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsMongoId({ each: true })
  specialtyIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsMongoId({ each: true })
  serviceIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => DoctorScheduleEntryDto)
  weeklySchedule?: DoctorScheduleEntryDto[];
}

export class ListDoctorsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(["GENERAL", "SPECIALIST"])
  type?: "GENERAL" | "SPECIALIST";

  @IsOptional()
  @IsIn(["ACTIVE", "INACTIVE", "LOCKED", "ARCHIVED"])
  status?: string;

  @IsOptional()
  @IsIn(["true", "false"])
  public?: "true" | "false";

  @IsOptional()
  @IsIn(["name", "createdAt", "specialty", "status"])
  sort = "name";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "asc";
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

export class ResetDoctorPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(PASSWORD_MIN_CREATE)
  newPassword!: string;
}
