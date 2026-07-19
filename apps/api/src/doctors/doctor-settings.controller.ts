import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import type { Express } from "express";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import type { AuthUser } from "../common/auth/session.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { DoctorSettingsService } from "./doctor-settings.service";
import {
  UpdateDoctorNotificationsDto,
  UpdateDoctorPersonalDto,
  UpdateDoctorPreferencesDto,
  UpdateDoctorProfessionalDto,
  UpdateDoctorScheduleDto,
} from "./dto/doctor-settings.dto";

@ApiTags("doctor-settings")
@Controller("api/doctor/settings")
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(
  "DOCTOR_SPECIALIST",
  "ADMIN",
  "ADMIN_OWNER",
  "OWNER",
  "SUPER_ADMIN",
)
export class DoctorSettingsController {
  constructor(private readonly settings: DoctorSettingsService) {}

  @Get()
  get(@CurrentUser() actor: AuthUser) {
    return this.settings.get(actor);
  }

  @Patch("personal")
  @HttpCode(200)
  updatePersonal(
    @Body() dto: UpdateDoctorPersonalDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.settings.updatePersonal(dto, actor);
  }

  @Patch("professional")
  @HttpCode(200)
  updateProfessional(
    @Body() dto: UpdateDoctorProfessionalDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.settings.updateProfessional(dto, actor);
  }

  @Patch("schedule")
  @HttpCode(200)
  updateSchedule(
    @Body() dto: UpdateDoctorScheduleDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.settings.updateSchedule(dto, actor);
  }

  @Patch("notifications")
  @HttpCode(200)
  updateNotifications(
    @Body() dto: UpdateDoctorNotificationsDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.settings.updateNotifications(dto, actor);
  }

  @Patch("preferences")
  @HttpCode(200)
  updatePreferences(
    @Body() dto: UpdateDoctorPreferencesDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.settings.updatePreferences(dto, actor);
  }

  @Patch("avatar")
  @HttpCode(200)
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 3 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        if (!["image/jpeg", "image/png"].includes(file.mimetype)) {
          callback(
            new BadRequestException({
              code: ErrorCodes.VALIDATION_ERROR,
              message: "يُسمح فقط بصور JPEG أو PNG.",
            }) as unknown as Error,
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  updateAvatar(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthUser,
  ) {
    if (!file) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "ملف الصورة مطلوب.",
      });
    }
    return this.settings.updateAvatar(file, actor);
  }

  @Delete("avatar")
  @HttpCode(200)
  removeAvatar(@CurrentUser() actor: AuthUser) {
    return this.settings.removeAvatar(actor);
  }
}
