import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { PAYMENT_METHODS } from "../schemas/finance.schema";

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  patientId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  totalAmount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  discountReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RecordPaymentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  invoiceId!: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: PAYMENT_METHODS })
  @IsIn([...PAYMENT_METHODS])
  method!: (typeof PAYMENT_METHODS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CollectChargeDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  invoiceId!: string;

  @ApiPropertyOptional({ enum: PAYMENT_METHODS })
  @IsOptional()
  @IsIn([...PAYMENT_METHODS])
  method?: (typeof PAYMENT_METHODS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryId?: string;
}
