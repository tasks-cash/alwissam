import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IDENTIFIER_MIN,
  LOGIN_PORTALS,
  PASSWORD_MIN_LOGIN,
} from "@alwisam/shared-validation";

export class LoginDto {
  @ApiPropertyOptional({ example: "owner@clinic.example" })
  @ValidateIf((o: LoginDto) => !o.identifier)
  @IsString()
  @MinLength(IDENTIFIER_MIN)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  email?: string;

  @ApiPropertyOptional({
    description: "Legacy alias for email/phone identifier",
  })
  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @MinLength(IDENTIFIER_MIN)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  identifier?: string;

  @ApiProperty({ example: "********", minLength: PASSWORD_MIN_LOGIN })
  @IsString()
  @MinLength(PASSWORD_MIN_LOGIN)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @ApiPropertyOptional({ enum: LOGIN_PORTALS })
  @IsOptional()
  @IsIn([...LOGIN_PORTALS])
  portal?: (typeof LOGIN_PORTALS)[number];

  /** Normalized login id (email or phone) */
  get loginId(): string {
    return (this.email || this.identifier || "").trim();
  }
}
