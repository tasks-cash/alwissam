import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import {
  FULL_NAME_MIN,
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  normalizeEmail,
  normalizePhoneDigits,
  toCanonicalPhone,
} from "@alwisam/shared-validation";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class UpdateDoctorPersonalDto {
  @IsOptional()
  @IsString()
  @MinLength(FULL_NAME_MIN)
  @MaxLength(120)
  @Transform(trim)
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: "البريد الإلكتروني غير صالح." })
  @MaxLength(180)
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? normalizeEmail(value)
      : undefined,
  )
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS)
  @Transform(({ value }) => {
    if (typeof value !== "string" || !value.trim()) return undefined;
    return toCanonicalPhone(value) || normalizePhoneDigits(value);
  })
  phone?: string;

  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: "ar" | "en" | "fr";

  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(trim)
  address?: string;
}

export class UpdateDoctorProfessionalDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trim)
  professionalTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trim)
  professionalTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(trim)
  professionalTitleFr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(350)
  @Transform(trim)
  shortDescriptionAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(trim)
  bioAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(trim)
  bioEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  @Transform(trim)
  bioFr?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
      : value,
  )
  languages?: string[];
}

export class DoctorScheduleWindowDto {
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

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDoctorScheduleDto {
  @IsArray()
  @ArrayMaxSize(14)
  @ValidateNested({ each: true })
  @Type(() => DoctorScheduleWindowDto)
  workingHours!: DoctorScheduleWindowDto[];

  @IsInt()
  @Min(15)
  @Max(180)
  appointmentDurationMinutes!: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(90)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { each: true })
  leaveDates?: string[];
}

export class UpdateDoctorNotificationsDto {
  @IsBoolean()
  appointmentNotifications!: boolean;

  @IsBoolean()
  patientWaitingNotifications!: boolean;

  @IsBoolean()
  staffMessageNotifications!: boolean;

  @IsBoolean()
  followUpReminders!: boolean;

  @IsBoolean()
  scheduleChanges!: boolean;

  @IsBoolean()
  securityAlerts!: boolean;

  @IsBoolean()
  inAppNotifications!: boolean;

  @IsBoolean()
  soundNotifications!: boolean;

  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;
}

export class UpdateDoctorPreferencesDto {
  @IsIn(["ar", "en", "fr"])
  locale!: "ar" | "en" | "fr";

  @IsIn(["dd/MM/yyyy", "yyyy-MM-dd"])
  dateFormat!: "dd/MM/yyyy" | "yyyy-MM-dd";

  @IsIn(["12h", "24h"])
  timeFormat!: "12h" | "24h";

  @IsBoolean()
  reducedMotion!: boolean;

  @IsBoolean()
  compactDashboard!: boolean;

  @IsBoolean()
  notificationSound!: boolean;
}
