import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../auth/schemas/auth.schemas";
import { AuditModule } from "../common/audit/audit.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { ClinicOwnerGuard } from "../common/auth/session.guard";
import { CatalogAdminController } from "./catalog-admin.controller";
import { CatalogPublicController } from "./catalog-public.controller";
import { CatalogService } from "./catalog.service";
import {
  DentalService,
  DentalServiceSchema,
} from "./schemas/dental-service.schema";
import { Specialty, SpecialtySchema } from "./schemas/specialty.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Specialty.name, schema: SpecialtySchema },
      { name: DentalService.name, schema: DentalServiceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
  ],
  controllers: [CatalogPublicController, CatalogAdminController],
  providers: [CatalogService, ClinicOwnerGuard, RolesGuard, PermissionsGuard],
  exports: [CatalogService],
})
export class CatalogModule {}
