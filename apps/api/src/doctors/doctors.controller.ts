import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/auth/current-user.decorator";
import type { AuthUser } from "../common/auth/session.guard";
import {
  ClinicOwnerGuard,
  JwtAuthGuard,
} from "../common/auth/session.guard";
import { DoctorsService } from "./doctors.service";
import {
  CreateDoctorDto,
  DeleteDoctorDto,
  UpdateDoctorDto,
} from "./dto/doctor.dto";

@ApiTags("doctors")
@Controller("api/admin/doctors")
@UseGuards(JwtAuthGuard, ClinicOwnerGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  list() {
    return this.doctorsService.list();
  }

  @Post()
  @HttpCode(200)
  create(@Body() dto: CreateDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.create(dto, user);
  }

  @Patch()
  @HttpCode(200)
  update(@Body() dto: UpdateDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.update(dto, user);
  }

  @Delete()
  @HttpCode(200)
  remove(@Body() dto: DeleteDoctorDto, @CurrentUser() user: AuthUser) {
    return this.doctorsService.remove(dto, user);
  }
}
