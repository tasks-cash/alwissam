import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  WAITING_ROOM_STATUSES,
} from "../schemas/appointment.schema";

export class CreateAppointmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  patientId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  doctorId!: string;

  @ApiProperty({ enum: APPOINTMENT_TYPES })
  @IsIn([...APPOINTMENT_TYPES])
  appointmentType!: (typeof APPOINTMENT_TYPES)[number];

  @ApiProperty()
  @IsDateString({}, { message: "تاريخ الموعد غير صالح." })
  startAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  isEmergency?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateAppointmentStatusDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  appointmentId!: string;

  @ApiProperty({ enum: APPOINTMENT_STATUSES })
  @IsIn([...APPOINTMENT_STATUSES])
  status!: (typeof APPOINTMENT_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ListAppointmentsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pageSize?: string;
}

export class WaitingRoomActionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  entryId!: string;

  @ApiProperty({ enum: WAITING_ROOM_STATUSES })
  @IsIn([...WAITING_ROOM_STATUSES])
  status!: (typeof WAITING_ROOM_STATUSES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class ExamActionDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  entryId!: string;

  @ApiProperty({ enum: ["start", "complete"] })
  @IsIn(["start", "complete"])
  action!: "start" | "complete";

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  covered?: boolean;
}

export class CheckInDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  appointmentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
