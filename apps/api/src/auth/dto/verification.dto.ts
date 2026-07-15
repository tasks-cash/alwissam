import { IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class VerifyContactDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  token!: string;

  @ApiPropertyOptional({ enum: ["email", "phone"] })
  @IsOptional()
  @IsIn(["email", "phone"])
  channel?: "email" | "phone";
}

export class ResendVerificationDto {
  @ApiPropertyOptional({ enum: ["email", "phone"], default: "email" })
  @IsOptional()
  @IsIn(["email", "phone"])
  channel?: "email" | "phone";
}
