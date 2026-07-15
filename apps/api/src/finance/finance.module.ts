import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import {
  Appointment,
  AppointmentSchema,
  WaitingRoomEntry,
  WaitingRoomEntrySchema,
} from "../appointments/schemas/appointment.schema";
import {
  PermissionsGuard,
  RolesGuard,
} from "../common/auth/permissions.guard";
import { JwtAuthGuard } from "../common/auth/session.guard";
import { Patient, PatientSchema } from "../patients/schemas/patient.schema";
import { FinanceController } from "./finance.controller";
import { FinanceService } from "./finance.service";
import {
  Invoice,
  InvoiceSchema,
  Payment,
  PaymentSchema,
} from "./schemas/finance.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Patient.name, schema: PatientSchema },
      { name: Appointment.name, schema: AppointmentSchema },
      { name: WaitingRoomEntry.name, schema: WaitingRoomEntrySchema },
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService, JwtAuthGuard, RolesGuard, PermissionsGuard],
  exports: [FinanceService],
})
export class FinanceModule {}
