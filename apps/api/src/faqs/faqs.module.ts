import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { AuditModule } from "../common/audit/audit.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { ClinicOwnerGuard } from "../common/auth/session.guard";
import { FaqsAdminController } from "./faqs-admin.controller";
import { FaqsPublicController } from "./faqs-public.controller";
import { FaqsService } from "./faqs.service";
import { Faq, FaqSchema } from "./schemas/faq.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Faq.name, schema: FaqSchema }]),
    AuditModule,
  ],
  controllers: [FaqsPublicController, FaqsAdminController],
  providers: [FaqsService, ClinicOwnerGuard, RolesGuard, PermissionsGuard],
  exports: [FaqsService],
})
export class FaqsModule {}
