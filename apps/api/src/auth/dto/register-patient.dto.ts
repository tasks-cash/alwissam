import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  PASSWORD_MAX,
  PASSWORD_MIN_CREATE,
  normalizeEmail,
  normalizePhoneDigits,
} from "@alwisam/shared-validation";

export class RegisterPatientDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  fullName!: string;

  @ApiProperty({ example: "07901234567" })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Transform(({ value }) =>
    typeof value === "string"
      ? normalizePhoneDigits(value) || value.trim()
      : value,
  )
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) =>
    typeof value === "string" && value.trim()
      ? normalizeEmail(value)
      : undefined,
  )
  email?: string;

  @ApiProperty({ minLength: PASSWORD_MIN_CREATE })
  @IsString()
  @MinLength(PASSWORD_MIN_CREATE)
  @MaxLength(PASSWORD_MAX)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  confirmPassword!: string;

  @ApiPropertyOptional({ enum: ["ar", "en", "fr"] })
  @IsOptional()
  @IsIn(["ar", "en", "fr"])
  locale?: "ar" | "en" | "fr";

  @ApiProperty()
  @IsBoolean()
  privacyAccepted!: boolean;

  @ApiProperty()
  @IsBoolean()
  termsAccepted!: boolean;
}
