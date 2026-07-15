import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";
import { Patient, PatientSchema } from "./schemas/patient.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Patient.name, schema: PatientSchema }]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, JwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [PatientsService, MongooseModule],
})
export class PatientsModule {}
