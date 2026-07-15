import {
  IsBoolean,
  IsDateString,
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
import { APPOINTMENT_TYPES } from "../schemas/appointment.schema";

function mapEasternDigits(value: unknown) {
  if (typeof value !== "string") return value;
  return value
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - "٠".charCodeAt(0)))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - "۰".charCodeAt(0)));
}

export class PublicBookAppointmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(FULL_NAME_MIN)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName!: string;

  @ApiProperty()
  @IsString()
  @Matches(/^\d+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط." })
  @Length(PHONE_MIN_DIGITS, PHONE_MAX_DIGITS)
  @Transform(({ value }) => mapEasternDigits(value))
  phone!: string;

  @ApiProperty({ enum: APPOINTMENT_TYPES })
  @IsIn([...APPOINTMENT_TYPES])
  appointmentType!: (typeof APPOINTMENT_TYPES)[number];

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  reason!: string;

  @ApiProperty()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  consentAccepted!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  isEmergency?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredDoctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  preferredDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @ValidateIf((_, v) => v !== undefined && v !== "")
  additionalNotes?: string;
}
