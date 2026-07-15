import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { APPOINTMENT_TYPES } from "./appointment.schema";

export type AppointmentRequestDocument = HydratedDocument<AppointmentRequest>;

@Schema({ timestamps: true, collection: "appointment_requests" })
export class AppointmentRequest {
  @Prop({ required: true, unique: true, index: true })
  requestNumber!: string;

  @Prop({ required: true, trim: true })
  fullName!: string;

  @Prop({ required: true, trim: true, index: true })
  phone!: string;

  @Prop({ required: true, trim: true })
  reason!: string;

  @Prop({ required: true, enum: APPOINTMENT_TYPES })
  appointmentType!: string;

  @Prop({ default: false })
  isEmergency!: boolean;

  @Prop({ type: Types.ObjectId, ref: "User" })
  preferredDoctorId?: Types.ObjectId;

  @Prop()
  preferredDate?: Date;

  @Prop()
  preferredTime?: string;

  @Prop({ default: false })
  consentAccepted!: boolean;

  @Prop({
    default: "NEW_REQUEST",
    enum: [
      "NEW_REQUEST",
      "UNDER_SECRETARY_REVIEW",
      "DOCTOR_ASSIGNED",
      "CONFIRMED",
      "CANCELLED_BY_PATIENT",
      "CANCELLED_BY_CLINIC",
      "EMERGENCY",
    ],
    index: true,
  })
  status!: string;

  @Prop()
  additionalNotes?: string;

  @Prop()
  queueNumber?: string;
}

export const AppointmentRequestSchema =
  SchemaFactory.createForClass(AppointmentRequest);
