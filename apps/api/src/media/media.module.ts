import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { MediaController, PublicMediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { MediaAsset, MediaAssetSchema } from "./schemas/media-asset.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: MediaAsset.name, schema: MediaAssetSchema },
    ]),
  ],
  controllers: [MediaController, PublicMediaController],
  providers: [MediaService, RolesGuard, PermissionsGuard],
  exports: [MediaService, MongooseModule],
})
export class MediaModule {}
