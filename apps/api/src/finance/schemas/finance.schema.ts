import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, SchemaTypes } from "mongoose";

export const PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export const PAYMENT_STATUSES = ["COMPLETED", "VOIDED"] as const;

export const INVOICE_STATUSES = [
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "VOIDED",
] as const;

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ timestamps: true, collection: "invoices" })
export class Invoice {
  @Prop({ required: true, unique: true, index: true })
  invoiceNumber!: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Patient", required: true, index: true })
  patientId!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Appointment" })
  appointmentId?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  doctorId?: Types.ObjectId;

  /** Fixed 2-decimal money strings (e.g. "150.00") — never JS float. */
  @Prop({ required: true })
  totalAmount!: string;

  @Prop({ required: true, default: "0.00" })
  paidAmount!: string;

  @Prop({ required: true, default: "0.00" })
  remainingAmount!: string;

  @Prop({ required: true, default: "0.00" })
  discount!: string;

  @Prop()
  discountReason?: string;

  @Prop({
    required: true,
    enum: INVOICE_STATUSES,
    default: "ISSUED",
    index: true,
  })
  status!: string;

  @Prop()
  notes?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop()
  legacyId?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ status: 1, createdAt: -1 });

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({ timestamps: true, collection: "payments" })
export class Payment {
  @Prop({ type: SchemaTypes.ObjectId, ref: "Invoice", required: true, index: true })
  invoiceId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: string;

  @Prop({ required: true, enum: PAYMENT_METHODS })
  method!: string;

  @Prop({
    required: true,
    enum: PAYMENT_STATUSES,
    default: "COMPLETED",
    index: true,
  })
  status!: string;

  @Prop({ required: true, unique: true })
  receiptNumber!: string;

  @Prop({ default: () => new Date(), index: true })
  paymentDate!: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdById?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  voidedById?: Types.ObjectId;

  @Prop()
  voidReason?: string;

  @Prop({ type: Date })
  voidedAt?: Date;

  @Prop()
  notes?: string;

  @Prop()
  legacyId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ paymentDate: -1 });
