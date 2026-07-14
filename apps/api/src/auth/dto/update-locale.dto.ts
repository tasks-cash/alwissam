import { IsIn } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLocaleDto {
  @ApiProperty({ enum: ["ar", "en", "fr"] })
  @IsIn(["ar", "en", "fr"])
  locale!: "ar" | "en" | "fr";
}
