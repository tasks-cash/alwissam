import { randomUUID } from "crypto";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { basename, join } from "path";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { MediaAsset, MediaAssetDocument } from "./schemas/media-asset.schema";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 6000;

function privateRoot() {
  const root =
    process.env.PRIVATE_UPLOAD_DIR || join(process.cwd(), "private-uploads");
  const directory = join(root, "public-content");
  if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
  return directory;
}

function imageDimensions(
  buffer: Buffer,
  mimeType: string,
): { width: number; height: number } | null {
  if (
    mimeType === "image/png" &&
    buffer.length >= 24 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if (
    mimeType === "image/webp" &&
    buffer.length >= 30 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    const kind = buffer.toString("ascii", 12, 16);
    if (kind === "VP8X") {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3),
      };
    }
    if (kind === "VP8L" && buffer[20] === 0x2f) {
      const bits = buffer.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }
  }
  if (
    mimeType === "image/jpeg" &&
    buffer.length >= 4 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8
  ) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1]!;
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) return null;
      if (
        marker >= 0xc0 &&
        marker <= 0xc3 &&
        offset + 8 < buffer.length
      ) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + length;
    }
  }
  return null;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaAsset.name)
    private readonly assets: Model<MediaAssetDocument>,
    private readonly audit: AuditService,
  ) {}

  async upload(
    file: { buffer: Buffer; mimetype: string; size: number } | undefined,
    actor: AuthUser,
  ) {
    if (
      !file ||
      !ALLOWED.has(file.mimetype) ||
      file.size <= 0 ||
      file.size > MAX_BYTES
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "اختر صورة JPEG أو PNG أو WebP بحجم لا يتجاوز 8MB.",
      });
    }
    const dimensions = imageDimensions(file.buffer, file.mimetype);
    if (
      !dimensions ||
      dimensions.width < 160 ||
      dimensions.height < 160 ||
      dimensions.width > MAX_DIMENSION ||
      dimensions.height > MAX_DIMENSION
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "ملف الصورة غير صالح أو أبعاده غير مدعومة.",
      });
    }
    const extension =
      file.mimetype === "image/jpeg"
        ? ".jpg"
        : file.mimetype === "image/png"
          ? ".png"
          : ".webp";
    const storageKey = `${randomUUID()}${extension}`;
    const diskPath = join(privateRoot(), storageKey);
    writeFileSync(diskPath, file.buffer, { flag: "wx" });
    try {
      const asset = await this.assets.create({
        storageKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        width: dimensions.width,
        height: dimensions.height,
        purpose: "public_content",
        isPublic: false,
        createdBy: new Types.ObjectId(actor.id),
        archivedAt: null,
      });
      await this.audit.write({
        actor,
        action: "media.uploaded",
        entityType: "MediaAsset",
        entityId: String(asset._id),
      });
      return {
        ok: true,
        mediaId: String(asset._id),
        url: `/api/admin/media/${asset._id}`,
        publicUrl: `/api/public/media/${asset._id}`,
        mimeType: asset.mimeType,
        sizeBytes: asset.sizeBytes,
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      if (existsSync(diskPath)) unlinkSync(diskPath);
      throw error;
    }
  }

  async getForAdmin(id: string) {
    return this.get(id, false);
  }

  async getForPublic(id: string) {
    return this.get(id, true);
  }

  async setPublicFromReferences(references: Array<string | undefined>, value: boolean) {
    const ids = references
      .map((reference) =>
        reference?.match(/^\/api\/(?:admin|public)\/media\/([a-f\d]{24})$/i)?.[1],
      )
      .filter((id): id is string => Boolean(id));
    if (ids.length === 0) return;
    await this.assets.updateMany(
      { _id: { $in: ids.map((id) => new Types.ObjectId(id)) }, archivedAt: null },
      { $set: { isPublic: value } },
    );
  }

  toPublicReference(reference: string) {
    return reference.replace(/^\/api\/admin\/media\//, "/api/public/media/");
  }

  private async get(id: string, publicOnly: boolean) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "ملف الوسائط غير موجود.",
      });
    }
    const asset = await this.assets
      .findOne({
        _id: id,
        archivedAt: null,
        ...(publicOnly ? { isPublic: true } : {}),
      })
      .lean();
    if (!asset) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "ملف الوسائط غير موجود.",
      });
    }
    return {
      path: join(privateRoot(), basename(asset.storageKey)),
      mimeType: asset.mimeType,
    };
  }
}
