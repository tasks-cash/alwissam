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
import { MediaModule } from "../media/media.module";
import { PatientExperiencesAdminController } from "./patient-experiences-admin.controller";
import { PatientExperiencesPublicController } from "./patient-experiences-public.controller";
import { PatientExperiencesService } from "./patient-experiences.service";
import {
  PatientExperience,
  PatientExperienceSchema,
} from "./schemas/patient-experience.schema";

@Module({
  imports: [
    AuthModule,
    MediaModule,
    MongooseModule.forFeature([
      { name: PatientExperience.name, schema: PatientExperienceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
  ],
  controllers: [
    PatientExperiencesAdminController,
    PatientExperiencesPublicController,
  ],
  providers: [
    PatientExperiencesService,
    ClinicOwnerGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [PatientExperiencesService],
})
export class PatientExperiencesModule {}
