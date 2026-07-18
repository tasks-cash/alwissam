import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { User, UserSchema } from "../auth/schemas/auth.schemas";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { CatalogModule } from "../catalog/catalog.module";
import { PatientsModule } from "../patients/patients.module";
import { Patient, PatientSchema } from "../patients/schemas/patient.schema";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService } from "./appointments.service";
import { PublicAppointmentsController } from "./public-appointments.controller";
import {
  AppointmentRequest,
  AppointmentRequestSchema,
} from "./schemas/appointment-request.schema";
import {
  Appointment,
  AppointmentSchema,
  WaitingRoomEntry,
  WaitingRoomEntrySchema,
} from "./schemas/appointment.schema";
import {
  Invoice,
  InvoiceSchema,
} from "../finance/schemas/finance.schema";

@Module({
  imports: [
    AuthModule,
    PatientsModule,
    CatalogModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: WaitingRoomEntry.name, schema: WaitingRoomEntrySchema },
      { name: AppointmentRequest.name, schema: AppointmentRequestSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: User.name, schema: UserSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  controllers: [AppointmentsController, PublicAppointmentsController],
  providers: [
    AppointmentsService,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [AppointmentsService, MongooseModule],
})
export class AppointmentsModule {}
