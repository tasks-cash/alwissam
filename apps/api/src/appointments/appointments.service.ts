import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { Patient } from "../patients/schemas/patient.schema";
import {
  CheckInDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
  UpdateAppointmentStatusDto,
  WaitingRoomActionDto,
} from "./dto/appointment.dto";
import { CatalogService } from "../catalog/catalog.service";
import { PublicBookAppointmentDto } from "./dto/public-book.dto";
import { AppointmentRequest } from "./schemas/appointment-request.schema";
import {
  Appointment,
  WaitingRoomEntry,
} from "./schemas/appointment.schema";

const ACTIVE_OVERLAP_STATUSES = [
  "CONFIRMED",
  "REMINDER_SENT",
  "PATIENT_ARRIVED",
  "WAITING_ROOM",
  "IN_TREATMENT",
  "DOCTOR_ASSIGNED",
  "WAITING_DOCTOR_APPROVAL",
];

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointments: Model<Appointment>,
    @InjectModel(WaitingRoomEntry.name)
    private readonly waiting: Model<WaitingRoomEntry>,
    @InjectModel(AppointmentRequest.name)
    private readonly requests: Model<AppointmentRequest>,
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
    private readonly catalog: CatalogService,
  ) {}

  private async nextAppointmentNumber(): Promise<string> {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `A${day}`;
    const latest = await this.appointments
      .findOne({ appointmentNumber: { $regex: `^${prefix}` } })
      .sort({ appointmentNumber: -1 })
      .select("appointmentNumber")
      .lean();
    let seq = 1;
    if (latest?.appointmentNumber) {
      const n = Number(latest.appointmentNumber.slice(prefix.length));
      if (Number.isFinite(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(4, "0")}`;
  }

  private dayBounds(dateISO: string) {
    const start = new Date(`${dateISO}T00:00:00.000Z`);
    const end = new Date(`${dateISO}T23:59:59.999Z`);
    // Prefer local Algiers-style day: use UTC+1 approximation via local Date when only date given.
    const local = new Date(dateISO);
    if (!Number.isNaN(local.getTime())) {
      const s = new Date(local);
      s.setHours(0, 0, 0, 0);
      const e = new Date(local);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    return { start, end };
  }

  private serializeAppointment(
    a: Appointment & {
      _id: Types.ObjectId;
      createdAt?: Date;
      patient?: { fullName?: string; phone?: string; patientNumber?: string };
      doctor?: { fullName?: string };
    },
  ) {
    return {
      id: String(a._id),
      appointmentNumber: a.appointmentNumber,
      patientId: String(a.patientId),
      doctorId: String(a.doctorId),
      appointmentType: a.appointmentType,
      status: a.status,
      startAt: a.startAt,
      endAt: a.endAt,
      durationMinutes: a.durationMinutes,
      isEmergency: a.isEmergency,
      notes: a.notes,
      cancelReason: a.cancelReason,
      patientName: a.patient?.fullName,
      patientPhone: a.patient?.phone,
      patientNumber: a.patient?.patientNumber,
      doctorName: a.doctor?.fullName,
      createdAt: a.createdAt,
    };
  }

  async list(query: ListAppointmentsQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 50));
    const filter: Record<string, unknown> = { deletedAt: null };

    if (query.doctorId && Types.ObjectId.isValid(query.doctorId)) {
      filter.doctorId = new Types.ObjectId(query.doctorId);
    }
    if (query.patientId && Types.ObjectId.isValid(query.patientId)) {
      filter.patientId = new Types.ObjectId(query.patientId);
    }
    if (query.status) filter.status = query.status;
    if (query.date) {
      const { start, end } = this.dayBounds(query.date);
      filter.startAt = { $gte: start, $lte: end };
    }

    const [total, rows] = await Promise.all([
      this.appointments.countDocuments(filter),
      this.appointments
        .find(filter)
        .sort({ startAt: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    const patientIds = [...new Set(rows.map((r) => String(r.patientId)))];
    const doctorIds = [...new Set(rows.map((r) => String(r.doctorId)))];
    const [patients, doctors] = await Promise.all([
      this.patients
        .find({ _id: { $in: patientIds } })
        .select("fullName phone patientNumber")
        .lean(),
      this.users
        .find({ _id: { $in: doctorIds } })
        .select("fullName")
        .lean(),
    ]);
    const patientMap = new Map(patients.map((p) => [String(p._id), p]));
    const doctorMap = new Map(doctors.map((d) => [String(d._id), d]));

    return {
      ok: true,
      total,
      page,
      pageSize,
      appointments: rows.map((r) => {
        const patient = patientMap.get(String(r.patientId));
        const doctor = doctorMap.get(String(r.doctorId));
        return this.serializeAppointment({
          ...(r as Appointment & { _id: Types.ObjectId; createdAt?: Date }),
          patient: patient
            ? {
                fullName: patient.fullName,
                phone: patient.phone,
                patientNumber: patient.patientNumber,
              }
            : undefined,
          doctor: doctor ? { fullName: doctor.fullName } : undefined,
        });
      }),
    };
  }

  async create(dto: CreateAppointmentDto, actor: AuthUser) {
    if (
      !Types.ObjectId.isValid(dto.patientId) ||
      !Types.ObjectId.isValid(dto.doctorId)
    ) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف المريض أو الطبيب غير صالح.",
      });
    }

    const [patient, doctor] = await Promise.all([
      this.patients.findOne({ _id: dto.patientId, deletedAt: null }),
      this.users.findOne({
        _id: dto.doctorId,
        deletedAt: null,
        doctor: { $exists: true },
        status: "ACTIVE",
      }),
    ]);
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "المريض غير موجود",
      });
    }
    if (!doctor || doctor.doctor?.isActive === false) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الطبيب غير موجود أو غير نشط",
      });
    }

    const startAt = new Date(dto.startAt);
    if (Number.isNaN(startAt.getTime())) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "تاريخ الموعد غير صالح.",
        fieldErrors: { startAt: ["تاريخ الموعد غير صالح."] },
      });
    }
    const duration = dto.durationMinutes || 30;
    const endAt = new Date(startAt.getTime() + duration * 60_000);

    const overlap = await this.appointments.findOne({
      deletedAt: null,
      doctorId: doctor._id,
      status: { $in: ACTIVE_OVERLAP_STATUSES },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    });
    if (overlap) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "يوجد تعارض في جدول الطبيب في هذا الوقت.",
      });
    }

    const appointmentNumber = await this.nextAppointmentNumber();
    const created = await this.appointments.create({
      appointmentNumber,
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentType: dto.appointmentType,
      status: "CONFIRMED",
      startAt,
      endAt,
      durationMinutes: duration,
      isEmergency: dto.isEmergency === true,
      notes: dto.notes,
      createdById: new Types.ObjectId(actor.id),
    });

    await this.audit.write({
      actor,
      action: "APPOINTMENT_CREATED",
      entityType: "Appointment",
      entityId: String(created._id),
      newValue: {
        appointmentNumber,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        startAt: startAt.toISOString(),
      },
    });

    return {
      ok: true,
      message: "تم إنشاء الموعد بنجاح.",
      appointment: this.serializeAppointment({
        ...(created.toObject() as Appointment & {
          _id: Types.ObjectId;
          createdAt?: Date;
        }),
        patient: {
          fullName: patient.fullName,
          phone: patient.phone,
          patientNumber: patient.patientNumber,
        },
        doctor: { fullName: doctor.fullName },
      }),
    };
  }

  async updateStatus(dto: UpdateAppointmentStatusDto, actor: AuthUser) {
    const appt = await this.appointments.findOne({
      _id: dto.appointmentId,
      deletedAt: null,
    });
    if (!appt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الموعد غير موجود",
      });
    }

    const previous = appt.status;
    appt.status = dto.status;
    if (
      dto.status === "CANCELLED_BY_CLINIC" ||
      dto.status === "CANCELLED_BY_PATIENT"
    ) {
      if (!dto.reason?.trim()) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "سبب الإلغاء مطلوب.",
          fieldErrors: { reason: ["سبب الإلغاء مطلوب."] },
        });
      }
      appt.cancelReason = dto.reason.trim();
    }
    if (dto.note) appt.notes = dto.note;
    await appt.save();

    await this.audit.write({
      actor,
      action: "APPOINTMENT_STATUS_CHANGED",
      entityType: "Appointment",
      entityId: String(appt._id),
      oldValue: { status: previous },
      newValue: { status: dto.status, reason: dto.reason },
    });

    return { ok: true, message: "تم تحديث حالة الموعد.", appointmentId: String(appt._id), status: appt.status };
  }

  async checkIn(dto: CheckInDto, actor: AuthUser) {
    const appt = await this.appointments.findOne({
      _id: dto.appointmentId,
      deletedAt: null,
    });
    if (!appt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الموعد غير موجود",
      });
    }

    appt.status = "WAITING_ROOM";
    await appt.save();

    let entry = await this.waiting.findOne({ appointmentId: appt._id });
    if (!entry) {
      entry = await this.waiting.create({
        appointmentId: appt._id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        status: "ARRIVED",
        arrivedAt: new Date(),
        urgency: appt.isEmergency,
        note: dto.note,
      });
    } else {
      entry.status = "ARRIVED";
      entry.arrivedAt = new Date();
      if (dto.note) entry.note = dto.note;
      await entry.save();
    }

    await this.audit.write({
      actor,
      action: "APPOINTMENT_CHECK_IN",
      entityType: "Appointment",
      entityId: String(appt._id),
    });

    return {
      ok: true,
      message: "تم تسجيل وصول المريض.",
      entry: {
        id: String(entry._id),
        appointmentId: String(appt._id),
        status: entry.status,
        arrivedAt: entry.arrivedAt,
      },
    };
  }

  async listWaiting(doctorId?: string) {
    const filter: Record<string, unknown> = {
      status: { $in: ["ARRIVED", "WAITING", "WITH_DOCTOR"] },
    };
    if (doctorId && Types.ObjectId.isValid(doctorId)) {
      filter.doctorId = new Types.ObjectId(doctorId);
    }
    const rows = await this.waiting.find(filter).sort({ arrivedAt: 1 }).lean();
    const patientIds = [...new Set(rows.map((r) => String(r.patientId)))];
    const doctorIds = [...new Set(rows.map((r) => String(r.doctorId)))];
    const apptIds = [...new Set(rows.map((r) => String(r.appointmentId)))];
    const [patients, doctors, appts] = await Promise.all([
      this.patients
        .find({ _id: { $in: patientIds } })
        .select("fullName phone patientNumber")
        .lean(),
      this.users.find({ _id: { $in: doctorIds } }).select("fullName").lean(),
      this.appointments
        .find({ _id: { $in: apptIds } })
        .select("startAt appointmentNumber appointmentType isEmergency")
        .lean(),
    ]);
    const patientMap = new Map(patients.map((p) => [String(p._id), p]));
    const doctorMap = new Map(doctors.map((d) => [String(d._id), d]));
    const apptMap = new Map(appts.map((a) => [String(a._id), a]));

    return {
      ok: true,
      entries: rows.map((r) => {
        const p = patientMap.get(String(r.patientId));
        const d = doctorMap.get(String(r.doctorId));
        const a = apptMap.get(String(r.appointmentId));
        const waitMs = Date.now() - new Date(r.arrivedAt).getTime();
        return {
          id: String(r._id),
          appointmentId: String(r.appointmentId),
          appointmentNumber: a?.appointmentNumber,
          appointmentStartAt: a?.startAt,
          appointmentType: a?.appointmentType,
          patientId: String(r.patientId),
          patientName: p?.fullName,
          patientPhone: p?.phone,
          patientNumber: p?.patientNumber,
          doctorId: String(r.doctorId),
          doctorName: d?.fullName,
          status: r.status,
          arrivedAt: r.arrivedAt,
          waitingMinutes: Math.max(0, Math.floor(waitMs / 60_000)),
          urgency: r.urgency || a?.isEmergency || false,
          note: r.note,
        };
      }),
    };
  }

  async updateWaiting(dto: WaitingRoomActionDto, actor: AuthUser) {
    const entry = await this.waiting.findById(dto.entryId);
    if (!entry) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "سجل الانتظار غير موجود",
      });
    }
    entry.status = dto.status;
    if (dto.note) entry.note = dto.note;
    if (dto.status === "WAITING" || dto.status === "ARRIVED") {
      /* keep arrivedAt */
    }
    if (dto.status === "WITH_DOCTOR") {
      entry.calledAt = entry.calledAt || new Date();
      entry.startedAt = new Date();
      await this.appointments.updateOne(
        { _id: entry.appointmentId },
        { $set: { status: "IN_TREATMENT" } },
      );
    }
    if (dto.status === "SESSION_DONE") {
      entry.completedAt = new Date();
      await this.appointments.updateOne(
        { _id: entry.appointmentId },
        { $set: { status: "COMPLETED" } },
      );
    }
    if (dto.status === "LEFT") {
      await this.appointments.updateOne(
        { _id: entry.appointmentId },
        { $set: { status: "NO_SHOW" } },
      );
    }
    await entry.save();

    await this.audit.write({
      actor,
      action: "WAITING_ROOM_UPDATED",
      entityType: "WaitingRoomEntry",
      entityId: String(entry._id),
      newValue: { status: dto.status },
    });

    return { ok: true, message: "تم تحديث قائمة الانتظار.", status: entry.status };
  }

  async countForDay(date: Date, statuses?: string[]) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const filter: Record<string, unknown> = {
      deletedAt: null,
      startAt: { $gte: start, $lte: end },
    };
    if (statuses?.length) filter.status = { $in: statuses };
    return this.appointments.countDocuments(filter);
  }

  async countWaiting() {
    return this.waiting.countDocuments({
      status: { $in: ["ARRIVED", "WAITING", "WITH_DOCTOR"] },
    });
  }

  async listForPatientUser(userId: string) {
    const patient = await this.patients.findOne({
      userId,
      deletedAt: null,
    });
    if (!patient) {
      return { ok: true, appointments: [] };
    }
    return this.list({ patientId: String(patient._id), pageSize: "50" });
  }

  private async nextRequestNumber(): Promise<{
    requestNumber: string;
    queueNumber: string;
  }> {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `${day}-`;
    const count = await this.requests.countDocuments({
      requestNumber: { $regex: `^${prefix}` },
    });
    const seq = String(count + 1).padStart(3, "0");
    return {
      requestNumber: `${prefix}${seq}`,
      queueNumber: String(count + 1),
    };
  }

  async createPublicRequest(dto: PublicBookAppointmentDto, _ip?: string) {
    if (!dto.consentAccepted) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "يجب الموافقة على الشروط قبل الإرسال.",
        fieldErrors: { consentAccepted: ["الموافقة مطلوبة."] },
      });
    }

    if (dto.specialtySlug || dto.serviceSlug || dto.preferredDoctorId) {
      await this.catalog.assertBookingRelation({
        specialtySlug: dto.specialtySlug,
        serviceSlug: dto.serviceSlug,
        doctorId: dto.preferredDoctorId,
      });
    }

    if (dto.preferredDate) {
      const d = new Date(dto.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (Number.isNaN(d.getTime()) || d < today) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "تاريخ الموعد غير صالح.",
          fieldErrors: { preferredDate: ["لا يمكن اختيار تاريخ في الماضي."] },
        });
      }
      if (dto.preferredTime) {
        const avail = await this.getAvailableTimes({
          date: dto.preferredDate,
          doctorId: dto.preferredDoctorId,
        });
        if (!avail.times.includes(dto.preferredTime)) {
          throw new BadRequestException({
            code: ErrorCodes.VALIDATION_ERROR,
            message: "الوقت المختار غير متاح.",
            fieldErrors: {
              preferredTime: ["اختر وقتًا من الأوقات المتاحة."],
            },
          });
        }
      }
    }

    const recent = await this.requests.findOne({
      phone: dto.phone,
      createdAt: { $gte: new Date(Date.now() - 2 * 60_000) },
    });
    if (recent) {
      throw new ConflictException({
        code: ErrorCodes.CONFLICT,
        message: "تم استلام طلب مؤخرًا. يرجى الانتظار قليلاً قبل المحاولة مجددًا.",
      });
    }

    const { requestNumber, queueNumber } = await this.nextRequestNumber();
    const status = dto.isEmergency || dto.appointmentType === "EMERGENCY"
      ? "EMERGENCY"
      : "NEW_REQUEST";

    const created = await this.requests.create({
      requestNumber,
      queueNumber,
      fullName: dto.fullName,
      phone: dto.phone,
      reason: dto.reason,
      appointmentType: dto.appointmentType,
      isEmergency: dto.appointmentType === "EMERGENCY" || dto.isEmergency === true,
      preferredDoctorId: dto.preferredDoctorId
        ? new Types.ObjectId(dto.preferredDoctorId)
        : undefined,
      preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
      preferredTime: dto.preferredTime,
      consentAccepted: true,
      status,
      additionalNotes: [
        dto.specialtySlug ? `specialty:${dto.specialtySlug}` : "",
        dto.serviceSlug ? `service:${dto.serviceSlug}` : "",
        dto.additionalNotes || "",
      ]
        .filter(Boolean)
        .join(" | ") || undefined,
    });

    return {
      ok: true,
      message: "تم استلام طلبكم بنجاح.",
      requestNumber: created.requestNumber,
      queueNumber: created.queueNumber || queueNumber,
      status: created.status,
    };
  }

  async getPublicRequest(requestNumber: string) {
    const row = await this.requests
      .findOne({ requestNumber })
      .select(
        "requestNumber queueNumber status fullName appointmentType preferredDate preferredTime createdAt",
      )
      .lean();
    if (!row) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "طلب الموعد غير موجود",
      });
    }
    return {
      ok: true,
      request: {
        requestNumber: row.requestNumber,
        queueNumber: row.queueNumber,
        status: row.status,
        fullName: row.fullName,
        appointmentType: row.appointmentType,
        preferredDate: row.preferredDate
          ? new Date(row.preferredDate).toISOString().slice(0, 10)
          : undefined,
        preferredTime: row.preferredTime,
        createdAt: (row as { createdAt?: Date }).createdAt,
      },
    };
  }

  /**
   * Public availability slots for a date (and optional doctor).
   * Derived from doctor.workingHours when present; otherwise clinic default weekdays.
   * Occupied preferredTimes on open appointment requests are excluded.
   */
  async getAvailableTimes(input: { date: string; doctorId?: string }) {
    const date = (input.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "تاريخ غير صالح.",
        fieldErrors: { date: ["استخدم الصيغة YYYY-MM-DD."] },
      });
    }
    const day = new Date(`${date}T12:00:00`);
    if (Number.isNaN(day.getTime())) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "تاريخ غير صالح.",
      });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    if (dayStart < today) {
      return { ok: true, date, times: [] as string[], closed: true };
    }

    const dayKeys = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const dayOfWeek = dayKeys[day.getDay()];

    let windows: Array<{ startTime: string; endTime: string }> = [];

    if (input.doctorId) {
      if (!Types.ObjectId.isValid(input.doctorId)) {
        throw new BadRequestException({
          code: ErrorCodes.VALIDATION_ERROR,
          message: "معرّف الطبيب غير صالح.",
        });
      }
      const doctor = await this.users
        .findOne({
          _id: input.doctorId,
          deletedAt: null,
          status: "ACTIVE",
          doctor: { $exists: true },
          "doctor.isActive": { $ne: false },
        })
        .select("doctor.workingHours")
        .lean();
      if (!doctor) {
        throw new NotFoundException({
          code: ErrorCodes.NOT_FOUND,
          message: "الطبيب غير متاح.",
        });
      }
      const hours = (
        doctor as {
          doctor?: {
            workingHours?: Array<{
              dayOfWeek: string;
              startTime: string;
              endTime: string;
              isActive?: boolean;
            }>;
          };
        }
      ).doctor?.workingHours;
      if (Array.isArray(hours) && hours.length) {
        windows = hours
          .filter(
            (h) =>
              h &&
              h.isActive !== false &&
              String(h.dayOfWeek || "").toUpperCase() === dayOfWeek,
          )
          .map((h) => ({ startTime: h.startTime, endTime: h.endTime }));
      }
    }

    if (!windows.length) {
      // Default clinic: Sun–Thu 08:00–17:00 (Friday/Saturday closed)
      if (dayOfWeek === "FRIDAY" || dayOfWeek === "SATURDAY") {
        return { ok: true, date, times: [] as string[], closed: true };
      }
      windows = [{ startTime: "08:00", endTime: "17:00" }];
    }

    const slotMinutes = 60;
    const rawTimes = new Set<string>();
    for (const w of windows) {
      for (const t of this.expandTimeWindow(
        w.startTime,
        w.endTime,
        slotMinutes,
      )) {
        rawTimes.add(t);
      }
    }

    const occupied = new Set<string>();
    const dayDate = new Date(`${date}T00:00:00.000Z`);
    const nextDay = new Date(dayDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    const requestFilter: Record<string, unknown> = {
      preferredDate: { $gte: dayDate, $lt: nextDay },
      preferredTime: { $exists: true, $ne: "" },
      status: {
        $nin: ["CANCELLED", "REJECTED", "COMPLETED", "ARCHIVED"],
      },
    };
    if (input.doctorId) {
      requestFilter.preferredDoctorId = new Types.ObjectId(input.doctorId);
    }
    const busy = await this.requests
      .find(requestFilter)
      .select("preferredTime")
      .lean();
    for (const row of busy) {
      if (row.preferredTime) occupied.add(String(row.preferredTime).slice(0, 5));
    }

    const now = new Date();
    const isToday = date === now.toISOString().slice(0, 10);
    const times = [...rawTimes]
      .filter((t) => !occupied.has(t))
      .filter((t) => {
        if (!isToday) return true;
        const [hh, mm] = t.split(":").map(Number);
        const slot = new Date(now);
        slot.setHours(hh, mm, 0, 0);
        return slot.getTime() > now.getTime() + 30 * 60_000;
      })
      .sort();

    return {
      ok: true,
      date,
      dayOfWeek,
      times,
      closed: times.length === 0 && windows.length === 0,
    };
  }

  async getDoctorAvailabilitySummary(doctorId: string) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "معرّف الطبيب غير صالح.",
      });
    }
    const doctor = await this.users
      .findOne({
        _id: doctorId,
        deletedAt: null,
        status: "ACTIVE",
        doctor: { $exists: true },
        "doctor.isActive": { $ne: false },
      })
      .select(
        "fullName doctor.workingHours doctor.availabilityNoteAr doctor.availabilityNoteEn doctor.availabilityNoteFr",
      )
      .lean();
    if (!doctor) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الطبيب غير متاح.",
      });
    }
    const d = doctor as {
      fullName?: string;
      doctor?: {
        workingHours?: Array<{
          dayOfWeek: string;
          startTime: string;
          endTime: string;
          isActive?: boolean;
        }>;
        availabilityNoteAr?: string;
        availabilityNoteEn?: string;
        availabilityNoteFr?: string;
      };
    };
    const workingHours = Array.isArray(d.doctor?.workingHours)
      ? d.doctor!.workingHours!.filter((h) => h && h.isActive !== false)
      : [];
    return {
      ok: true,
      doctorId,
      fullName: d.fullName,
      availabilityNoteAr: d.doctor?.availabilityNoteAr || "",
      availabilityNoteEn: d.doctor?.availabilityNoteEn || "",
      availabilityNoteFr: d.doctor?.availabilityNoteFr || "",
      workingHours,
    };
  }

  private expandTimeWindow(
    startTime: string,
    endTime: string,
    stepMinutes: number,
  ): string[] {
    const toMin = (t: string) => {
      const m = /^(\d{1,2}):(\d{2})$/.exec((t || "").trim());
      if (!m) return null;
      return Number(m[1]) * 60 + Number(m[2]);
    };
    const start = toMin(startTime);
    const end = toMin(endTime);
    if (start == null || end == null || end <= start) return [];
    const out: string[] = [];
    for (let m = start; m + stepMinutes <= end; m += stepMinutes) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
    return out;
  }
}
