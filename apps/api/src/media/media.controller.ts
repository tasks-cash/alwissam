import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { extname, join } from "path";
import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import type { Express } from "express";
import {
  PermissionsGuard,
  RequirePermissions,
  RequireRoles,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { PERMISSIONS } from "../common/auth/permissions";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function uploadRoot() {
  const root = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
  const dir = join(root, "public-content");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

@ApiTags("media")
@ApiBearerAuth()
@Controller("api/admin/media")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class MediaController {
  @Post("upload")
  @HttpCode(200)
  @RequireRoles("ADMIN", "DOCTOR_SPECIALIST")
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
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadRoot()),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || "").toLowerCase();
          const safe =
            ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp"
              ? ext === ".jpeg"
                ? ".jpg"
                : ext
              : ".bin";
          cb(null, `${randomUUID()}${safe}`);
        },
      }),
      limits: { fileSize: MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED.has(file.mimetype)) {
          cb(
            new BadRequestException({
              code: ErrorCodes.VALIDATION_ERROR,
              message: "يُسمح فقط بصور JPEG أو PNG أو WebP.",
            }) as unknown as Error,
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "الملف مطلوب.",
      });
    }
    return {
      ok: true,
      url: `/uploads/public-content/${file.filename}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }
}
