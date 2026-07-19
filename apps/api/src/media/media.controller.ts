import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import type { Express, Response } from "express";
import { CurrentUser } from "../common/auth/current-user.decorator";
import {
  PermissionsGuard,
  RequirePermissions,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { PERMISSIONS } from "../common/auth/permissions";
import type { AuthUser } from "../common/auth/session.guard";
import { ClinicOwnerGuard, JwtAuthGuard } from "../common/auth/session.guard";
import { MediaService } from "./media.service";

@ApiTags("media")
@ApiBearerAuth()
@Controller("api/admin/media")
@UseGuards(
  JwtAuthGuard,
  ClinicOwnerGuard,
  RolesGuard,
  PermissionsGuard,
)
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post("upload")
  @HttpCode(200)
  @RequireRoles("ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
  @RequirePermissions(PERMISSIONS.manage_settings)
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File | undefined,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.media.upload(file, actor);
  }

  @Get(":id")
  @RequireRoles("ADMIN", "ADMIN_OWNER", "DOCTOR_SPECIALIST", "OWNER", "SUPER_ADMIN")
  @RequirePermissions(PERMISSIONS.manage_settings)
  async adminFile(@Param("id") id: string, @Res() response: Response) {
    const file = await this.media.getForAdmin(id);
    response.type(file.mimeType);
    response.setHeader("Cache-Control", "private, no-store");
    return response.sendFile(file.path);
  }
}

@ApiTags("media-public")
@Controller("api/public/media")
export class PublicMediaController {
  constructor(private readonly media: MediaService) {}

  @Get(":id")
  async publicFile(@Param("id") id: string, @Res() response: Response) {
    const file = await this.media.getForPublic(id);
    response.type(file.mimeType);
    response.setHeader("Cache-Control", "public, max-age=3600");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.sendFile(file.path);
  }
}
