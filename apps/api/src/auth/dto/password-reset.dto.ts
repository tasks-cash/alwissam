import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IDENTIFIER_MIN,
  PASSWORD_MIN_CREATE,
} from "@alwisam/shared-validation";

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(IDENTIFIER_MIN)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  identifier!: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  token!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_CREATE })
  @IsString()
  @MinLength(PASSWORD_MIN_CREATE)
  password!: string;
}
