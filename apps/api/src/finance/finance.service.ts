import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Appointment, WaitingRoomEntry } from "../appointments/schemas/appointment.schema";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { Patient } from "../patients/schemas/patient.schema";
import {
  moneyAdd,
  moneyLteZero,
  moneyMax0,
  moneySub,
  moneyToFixed2,
  generateClinicNumber,
} from "./common/money";
import {
  CollectChargeDto,
  CreateInvoiceDto,
  RecordPaymentDto,
} from "./dto/finance.dto";
import { Invoice, Payment } from "./schemas/finance.schema";

@Injectable()
export class FinanceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoices: Model<Invoice>,
    @InjectModel(Payment.name) private readonly payments: Model<Payment>,
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(Appointment.name)
    private readonly appointments: Model<Appointment>,
    @InjectModel(WaitingRoomEntry.name)
    private readonly waiting: Model<WaitingRoomEntry>,
    private readonly audit: AuditService,
  ) {}

  private serializeInvoice(
    inv: Invoice & { _id: Types.ObjectId; createdAt?: Date },
    patientName?: string,
  ) {
    return {
      id: String(inv._id),
      invoiceNumber: inv.invoiceNumber,
      patientId: String(inv.patientId),
      patientName,
      appointmentId: inv.appointmentId ? String(inv.appointmentId) : undefined,
      doctorId: inv.doctorId ? String(inv.doctorId) : undefined,
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      remainingAmount: inv.remainingAmount,
      discount: inv.discount,
      discountReason: inv.discountReason,
      status: inv.status,
      notes: inv.notes,
      createdAt: inv.createdAt,
    };
  }

  private serializePayment(
    p: Payment & { _id: Types.ObjectId; createdAt?: Date },
    extras?: { patientName?: string; invoiceNumber?: string },
  ) {
    return {
      id: String(p._id),
      invoiceId: String(p.invoiceId),
      invoiceNumber: extras?.invoiceNumber,
      patientName: extras?.patientName,
      amount: p.amount,
      method: p.method,
      status: p.status,
      receiptNumber: p.receiptNumber,
      paymentDate: p.paymentDate,
      notes: p.notes,
      createdAt: p.createdAt,
    };
  }

  async listOpenInvoices() {
    const rows = await this.invoices
      .find({ status: { $in: ["ISSUED", "PARTIALLY_PAID"] } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const patientIds = [...new Set(rows.map((r) => String(r.patientId)))];
    const patients = await this.patients
      .find({ _id: { $in: patientIds } })
      .select("fullName")
      .lean();
    const map = new Map(patients.map((p) => [String(p._id), p.fullName]));
    return {
      ok: true,
      invoices: rows.map((r) =>
        this.serializeInvoice(r as never, map.get(String(r.patientId))),
      ),
    };
  }

  async listRecentPayments() {
    const rows = await this.payments
      .find({ status: "COMPLETED" })
      .sort({ paymentDate: -1 })
      .limit(30)
      .lean();
    const invoiceIds = [...new Set(rows.map((r) => String(r.invoiceId)))];
    const invoices = await this.invoices
      .find({ _id: { $in: invoiceIds } })
      .select("invoiceNumber patientId")
      .lean();
    const invMap = new Map(invoices.map((i) => [String(i._id), i]));
    const patientIds = [
      ...new Set(invoices.map((i) => String(i.patientId))),
    ];
    const patients = await this.patients
      .find({ _id: { $in: patientIds } })
      .select("fullName")
      .lean();
    const pMap = new Map(patients.map((p) => [String(p._id), p.fullName]));

    return {
      ok: true,
      payments: rows.map((r) => {
        const inv = invMap.get(String(r.invoiceId));
        return this.serializePayment(r as never, {
          invoiceNumber: inv?.invoiceNumber,
          patientName: inv ? pMap.get(String(inv.patientId)) : undefined,
        });
      }),
    };
  }

  async createInvoice(dto: CreateInvoiceDto, actor: AuthUser) {
    if (!Types.ObjectId.isValid(dto.patientId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف المريض غير صالح.",
      });
    }
    const patient = await this.patients.findOne({
      _id: dto.patientId,
      deletedAt: null,
    });
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المريض غير موجود",
      });
    }

    let total: string;
    let discount: string;
    try {
      total = moneyToFixed2(dto.totalAmount);
      discount = moneyToFixed2(dto.discount ?? 0);
    } catch {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "المبلغ غير صالح.",
      });
    }
    const net = moneyMax0(moneySub(total, discount));

    const created = await this.invoices.create({
      invoiceNumber: generateClinicNumber("INV"),
      patientId: patient._id,
      appointmentId:
        dto.appointmentId && Types.ObjectId.isValid(dto.appointmentId)
          ? new Types.ObjectId(dto.appointmentId)
          : undefined,
      doctorId:
        dto.doctorId && Types.ObjectId.isValid(dto.doctorId)
          ? new Types.ObjectId(dto.doctorId)
          : undefined,
      totalAmount: net,
      paidAmount: "0.00",
      remainingAmount: net,
      discount,
      discountReason: dto.discountReason,
      status: "ISSUED",
      notes: dto.notes,
      createdById: new Types.ObjectId(actor.id),
    });

    await this.audit.write({
      actor,
      action: "INVOICE_CREATED",
      entityType: "Invoice",
      entityId: String(created._id),
      newValue: {
        invoiceNumber: created.invoiceNumber,
        totalAmount: created.totalAmount,
      },
    });

    return {
      ok: true,
      message: "تم إنشاء الفاتورة.",
      invoice: this.serializeInvoice(created as never, patient.fullName),
    };
  }

  async recordPayment(dto: RecordPaymentDto, actor: AuthUser) {
    const invoice = await this.invoices.findById(dto.invoiceId);
    if (!invoice) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الفاتورة غير موجودة",
      });
    }
    if (invoice.status === "VOIDED" || invoice.status === "PAID") {
      throw new BadRequestException({
        code: ErrorCodes.CONFLICT,
        message: "لا يمكن تسجيل دفعة على فاتورة مغلقة.",
      });
    }

    let amount: string;
    try {
      amount = moneyToFixed2(dto.amount);
    } catch {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "المبلغ غير صالح.",
      });
    }

    const payment = await this.payments.create({
      invoiceId: invoice._id,
      amount,
      method: dto.method,
      status: "COMPLETED",
      receiptNumber: generateClinicNumber("RCP"),
      paymentDate: new Date(),
      createdById: new Types.ObjectId(actor.id),
      notes: dto.notes,
    });

    const paidAmount = moneyAdd(invoice.paidAmount, amount);
    const remainingAmount = moneyMax0(
      moneySub(invoice.totalAmount, paidAmount),
    );
    invoice.paidAmount = paidAmount;
    invoice.remainingAmount = remainingAmount;
    invoice.status = moneyLteZero(remainingAmount) ? "PAID" : "PARTIALLY_PAID";
    await invoice.save();

    await this.audit.write({
      actor,
      action: "PAYMENT_CREATED",
      entityType: "Payment",
      entityId: String(payment._id),
      newValue: {
        receiptNumber: payment.receiptNumber,
        amount,
        invoiceId: String(invoice._id),
      },
    });

    return {
      ok: true,
      message: "تم تسجيل الدفعة.",
      payment: this.serializePayment(payment as never, {
        invoiceNumber: invoice.invoiceNumber,
      }),
      invoice: this.serializeInvoice(invoice as never),
    };
  }

  async collectCharge(dto: CollectChargeDto, actor: AuthUser) {
    const invoice = await this.invoices.findById(dto.invoiceId);
    if (!invoice) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الفاتورة غير موجودة",
      });
    }
    if (invoice.status === "PAID" || invoice.status === "VOIDED") {
      throw new BadRequestException({
        code: ErrorCodes.CONFLICT,
        message: "الفاتورة مغلقة.",
      });
    }
    if (moneyLteZero(invoice.remainingAmount)) {
      throw new BadRequestException({
        code: ErrorCodes.CONFLICT,
        message: "لا يوجد مبلغ متبقٍ للتحصيل.",
      });
    }

    const method = dto.method || "CASH";
    const amount = invoice.remainingAmount;
    const payment = await this.payments.create({
      invoiceId: invoice._id,
      amount,
      method,
      status: "COMPLETED",
      receiptNumber: generateClinicNumber("RCP"),
      paymentDate: new Date(),
      createdById: new Types.ObjectId(actor.id),
    });

    invoice.paidAmount = invoice.totalAmount;
    invoice.remainingAmount = "0.00";
    invoice.status = "PAID";
    await invoice.save();

    const appointmentId =
      dto.appointmentId ||
      (invoice.appointmentId ? String(invoice.appointmentId) : undefined);
    if (appointmentId && Types.ObjectId.isValid(appointmentId)) {
      await this.appointments.updateOne(
        { _id: appointmentId },
        { $set: { status: "COMPLETED" } },
      );
      if (dto.entryId && Types.ObjectId.isValid(dto.entryId)) {
        await this.waiting.updateOne(
          { _id: dto.entryId },
          { $set: { status: "LEFT", completedAt: new Date() } },
        );
      } else {
        await this.waiting.updateMany(
          {
            appointmentId: new Types.ObjectId(appointmentId),
            status: { $ne: "LEFT" },
          },
          { $set: { status: "LEFT", completedAt: new Date() } },
        );
      }
    }

    await this.audit.write({
      actor,
      action: "DOCTOR_CHARGE_COLLECTED",
      entityType: "Invoice",
      entityId: String(invoice._id),
      newValue: {
        receiptNumber: payment.receiptNumber,
        amount,
        method,
      },
    });

    return {
      ok: true,
      message: "تم تحصيل المبلغ بنجاح.",
      payment: this.serializePayment(payment as never, {
        invoiceNumber: invoice.invoiceNumber,
      }),
      invoice: this.serializeInvoice(invoice as never),
    };
  }
}
