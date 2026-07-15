import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
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
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - "۰".charCodeAt(0)))
    .replace(/\D/g, "");
}

/** Public contact form — name, phone, subject, details only (no email). */
export class PublicContactDto {
  @ApiProperty()
  @IsString()
  @MinLength(FULL_NAME_MIN, { message: "الاسم الكامل مطلوب." })
  @MaxLength(120)
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

  @ApiProperty()
  @IsString()
  @MinLength(2, { message: "موضوع الرسالة مطلوب." })
  @MaxLength(160)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  subject!: string;

  @ApiProperty({ description: "Message body / details" })
  @IsString()
  @MinLength(5, { message: "تفاصيل الرسالة مطلوبة." })
  @MaxLength(4000)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  message!: string;

  @ApiPropertyOptional({ enum: ["ar", "en", "fr"] })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  locale?: string;
}
