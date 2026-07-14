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
  PASSWORD_MIN_CREATE,
  PHONE_MAX_DIGITS,
  PHONE_MIN_DIGITS,
  SECRETARY_SHIFT_CODES,
} from "@alwisam/shared-validation";

function mapEasternDigits(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - "٠".charCodeAt(0)))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - "۰".charCodeAt(0)));
}

export class CreateSecretaryDto {
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
  @MinLength(PASSWORD_MIN_CREATE)
  password!: string;

  @ApiProperty({ enum: SECRETARY_SHIFT_CODES })
  @IsIn([...SECRETARY_SHIFT_CODES], { message: "وردية غير صالحة" })
  shiftCode!: (typeof SECRETARY_SHIFT_CODES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workEndTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  workDays?: string;
}

export class UpdateSecretaryDto {
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
  @Transform(({ value }) => {
    if (typeof value !== "string") return undefined;
    const t = value.trim();
    return t.length ? t : undefined;
  })
  @ValidateIf((_, v) => v !== undefined)
  @MinLength(PASSWORD_MIN_CREATE)
  newPassword?: string;

  @ApiPropertyOptional({ enum: SECRETARY_SHIFT_CODES })
  @IsOptional()
  @IsIn([...SECRETARY_SHIFT_CODES])
  shiftCode?: (typeof SECRETARY_SHIFT_CODES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  workEndTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workDays?: string;
}

export class DeleteSecretaryDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  userId!: string;
}
