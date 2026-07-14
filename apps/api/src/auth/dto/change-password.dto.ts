import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PASSWORD_MIN_CREATE, PASSWORD_MIN_LOGIN } from "@alwisam/shared-validation";

export class ChangePasswordDto {
  @ApiProperty({ minLength: PASSWORD_MIN_LOGIN })
  @IsString()
  @MinLength(PASSWORD_MIN_LOGIN)
  currentPassword!: string;

  @ApiProperty({ minLength: PASSWORD_MIN_CREATE })
  @IsString()
  @MinLength(PASSWORD_MIN_CREATE)
  password!: string;
}
