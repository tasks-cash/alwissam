import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as path from "path";
import * as fs from "fs/promises";
import { createReadStream, existsSync } from "fs";
import type { Response } from "express";
import { User, Session, AuditLog } from "../auth/schemas/auth.schemas";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { Patient } from "../patients/schemas/patient.schema";
import { Appointment } from "../appointments/schemas/appointment.schema";
import { AppointmentRequest } from "../appointments/schemas/appointment-request.schema";
import {
  AccountDeletionRequest,
  DataExportRequest,
  DoctorInstruction,
  FollowUpRecommendation,
  MedicalCase,
  MedicalFile,
  MedicalMessage,
  MedicalMessageThread,
  PATIENT_FILE_VISIBILITIES,
  PatientConsent,
  PatientNotification,
} from "./schemas/portal.schemas";
import { assertCompletedVisitMessaging } from "./messaging-eligibility";

const PATIENT_SAFE_APPT_FIELDS = true;

@Injectable()
export class PatientPortalService {
  constructor(
    @InjectModel(Patient.name) private readonly patients: Model<Patient>,
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(Session.name) private readonly sessions: Model<Session>,
    @InjectModel(Appointment.name)
    private readonly appointments: Model<Appointment>,
    @InjectModel(AppointmentRequest.name)
    private readonly requests: Model<AppointmentRequest>,
    @InjectModel(MedicalCase.name)
    private readonly cases: Model<MedicalCase>,
    @InjectModel(MedicalFile.name) private readonly files: Model<MedicalFile>,
    @InjectModel(DoctorInstruction.name)
    private readonly instructions: Model<DoctorInstruction>,
    @InjectModel(MedicalMessageThread.name)
    private readonly threads: Model<MedicalMessageThread>,
    @InjectModel(MedicalMessage.name)
    private readonly messages: Model<MedicalMessage>,
    @InjectModel(PatientNotification.name)
    private readonly notifications: Model<PatientNotification>,
    @InjectModel(FollowUpRecommendation.name)
    private readonly followUps: Model<FollowUpRecommendation>,
    @InjectModel(PatientConsent.name)
    private readonly consents: Model<PatientConsent>,
    @InjectModel(AccountDeletionRequest.name)
    private readonly deletions: Model<AccountDeletionRequest>,
    @InjectModel(DataExportRequest.name)
    private readonly exports: Model<DataExportRequest>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
  ) {}

  private async requirePatient(userId: string) {
    const patient = await this.patients
      .findOne({ userId, deletedAt: null })
      .lean();
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "سجل المريض غير مرتبط بهذا الحساب.",
      });
    }
    return patient as Patient & { _id: Types.ObjectId; createdAt?: Date };
  }

  private async audit(
    actor: AuthUser,
    action: string,
    entityType: string,
    entityId?: string,
  ) {
    await this.auditLogs.create({
      userId: new Types.ObjectId(actor.id),
      roleCode: actor.roleCode,
      action,
      entityType,
      entityId,
    });
  }

  private serializeAppointment(
    a: Appointment & {
      _id: Types.ObjectId;
      createdAt?: Date;
      doctor?: { fullName?: string };
    },
  ) {
    void PATIENT_SAFE_APPT_FIELDS;
    return {
      id: String(a._id),
      reference: a.appointmentNumber,
      appointmentNumber: a.appointmentNumber,
      status: a.status,
      appointmentType: a.appointmentType,
      startAt: a.startAt,
      endAt: a.endAt,
      doctorId: a.doctorId ? String(a.doctorId) : undefined,
      doctorName: a.doctor?.fullName,
      cancelReason: a.cancelReason,
      isEmergency: a.isEmergency,
      createdAt: a.createdAt,
      // Never expose internal staff notes
    };
  }

  private timelineFromStatus(status: string, createdAt?: Date, startAt?: Date) {
    const steps: Array<{ key: string; labelAr: string; at?: Date; done: boolean }> = [
      {
        key: "submitted",
        labelAr: "تم إرسال الطلب",
        at: createdAt,
        done: true,
      },
      {
        key: "review",
        labelAr: "قيد المراجعة",
        done: ![
          "NEW_REQUEST",
          "UNDER_SECRETARY_REVIEW",
          "pending_confirmation",
          "pending_reception_assignment",
        ].includes(status),
      },
      {
        key: "doctor_assigned",
        labelAr: "تم تعيين الطبيب",
        done: [
          "DOCTOR_ASSIGNED",
          "WAITING_DOCTOR_APPROVAL",
          "CONFIRMED",
          "REMINDER_SENT",
          "PATIENT_ARRIVED",
          "WAITING_ROOM",
          "IN_TREATMENT",
          "COMPLETED",
          "FOLLOW_UP_REQUIRED",
        ].includes(status),
      },
      {
        key: "confirmed",
        labelAr: "تم تأكيد الموعد",
        at: startAt,
        done: [
          "CONFIRMED",
          "REMINDER_SENT",
          "PATIENT_ARRIVED",
          "WAITING_ROOM",
          "IN_TREATMENT",
          "COMPLETED",
          "FOLLOW_UP_REQUIRED",
        ].includes(status),
      },
      {
        key: "arrived",
        labelAr: "تم تسجيل الوصول",
        done: [
          "PATIENT_ARRIVED",
          "WAITING_ROOM",
          "IN_TREATMENT",
          "COMPLETED",
          "FOLLOW_UP_REQUIRED",
        ].includes(status),
      },
      {
        key: "completed",
        labelAr: "اكتملت الزيارة",
        done: ["COMPLETED", "FOLLOW_UP_REQUIRED"].includes(status),
      },
    ];

    if (status === "FOLLOW_UP_REQUIRED") {
      steps.push({
        key: "follow_up",
        labelAr: "تحتاج إلى متابعة",
        done: true,
      });
    }
    if (
      status === "CANCELLED_BY_PATIENT" ||
      status === "CANCELLED_BY_CLINIC"
    ) {
      steps.push({
        key: "cancelled",
        labelAr: "تم إلغاء الموعد",
        done: true,
      });
    }
    return steps.filter((s) => s.done || ["submitted", "review"].includes(s.key));
  }

  async dashboard(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const pid = patient._id;
    const now = new Date();

    const [
      allAppts,
      caseCount,
      fileCount,
      unreadMessages,
      unreadNotifications,
      latestCase,
      latestInstruction,
      nextFollowUp,
      openRequests,
    ] = await Promise.all([
      this.appointments
        .find({ patientId: pid, deletedAt: null })
        .sort({ startAt: 1 })
        .lean(),
      this.cases.countDocuments({
        patientId: pid,
        deletedAt: null,
        visibleToPatient: true,
      }),
      this.files.countDocuments({
        patientId: pid,
        deletedAt: null,
        visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
      }),
      this.threads.aggregate([
        { $match: { patientId: pid, deletedAt: null } },
        { $group: { _id: null, n: { $sum: "$patientUnreadCount" } } },
      ]),
      this.notifications.countDocuments({
        patientId: pid,
        isRead: false,
        deletedAt: null,
      }),
      this.cases
        .findOne({
          patientId: pid,
          deletedAt: null,
          visibleToPatient: true,
        })
        .sort({ updatedAt: -1 })
        .lean(),
      this.instructions
        .findOne({
          patientId: pid,
          deletedAt: null,
          visibleToPatient: true,
          approvedForPatient: true,
        })
        .sort({ createdAt: -1 })
        .lean(),
      this.followUps
        .findOne({
          patientId: pid,
          deletedAt: null,
          visibleToPatient: true,
          status: { $in: ["recommended", "booked"] },
        })
        .sort({ recommendedFrom: 1 })
        .lean(),
      this.requests
        .find({
          $or: [{ linkedPatientId: pid }, { phone: patient.phone }],
          deletedAt: null,
          status: {
            $in: [
              "NEW_REQUEST",
              "pending_confirmation",
              "pending_reception_assignment",
              "UNDER_SECRETARY_REVIEW",
            ],
          },
        })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const doctorIds = [
      ...new Set(
        allAppts
          .map((a) => (a.doctorId ? String(a.doctorId) : null))
          .filter(Boolean) as string[],
      ),
    ];
    const doctors = await this.users
      .find({ _id: { $in: doctorIds } })
      .select("fullName")
      .lean();
    const doctorMap = new Map(doctors.map((d) => [String(d._id), d.fullName]));

    const upcoming = allAppts.filter(
      (a) =>
        new Date(a.startAt) >= now &&
        !["COMPLETED", "CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC", "NO_SHOW"].includes(
          a.status,
        ),
    );
    const completed = allAppts.filter((a) => a.status === "COMPLETED");
    const cancelled = allAppts.filter((a) =>
      ["CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC"].includes(a.status),
    );
    const pending = allAppts.filter((a) =>
      [
        "NEW_REQUEST",
        "UNDER_SECRETARY_REVIEW",
        "WAITING_DOCTOR_APPROVAL",
        "DOCTOR_ASSIGNED",
      ].includes(a.status),
    );

    const profileComplete = Boolean(
      patient.fullName && patient.phone && (patient.email || patient.city),
    );

    await this.audit(actor, "PATIENT_DASHBOARD_VIEWED", "Patient", String(pid));

    return {
      ok: true,
      dashboard: {
        greetingName: patient.fullName,
        patientNumber: patient.patientNumber,
        profileComplete,
        counts: {
          upcoming: upcoming.length,
          completed: completed.length,
          cancelled: cancelled.length,
          pending: pending.length,
          medicalCases: caseCount,
          files: fileCount,
          unreadMessages: unreadMessages[0]?.n || 0,
          unreadNotifications,
          openBookingRequests: openRequests.length,
        },
        nextAppointment: upcoming[0]
          ? this.serializeAppointment({
              ...(upcoming[0] as object as Appointment & {
                _id: Types.ObjectId;
                createdAt?: Date;
              }),
              doctor: { fullName: doctorMap.get(String(upcoming[0].doctorId)) },
            })
          : null,
        latestCase: latestCase
          ? {
              id: String(latestCase._id),
              title: latestCase.title,
              status: latestCase.status,
              updatedAt: (latestCase as { updatedAt?: Date }).updatedAt,
            }
          : null,
        latestInstruction: latestInstruction
          ? {
              id: String(latestInstruction._id),
              title: latestInstruction.title,
              followUpDate: latestInstruction.followUpDate,
            }
          : null,
        nextFollowUp: nextFollowUp
          ? {
              id: String(nextFollowUp._id),
              reason: nextFollowUp.reason,
              recommendedFrom: nextFollowUp.recommendedFrom,
              recommendedTo: nextFollowUp.recommendedTo,
              status: nextFollowUp.status,
            }
          : null,
        bookingRequests: openRequests.map((r) => ({
          reference: r.requestNumber,
          status: r.status,
          preferredDate: r.preferredDate,
          reason: r.reason,
          createdAt: (r as { createdAt?: Date }).createdAt,
        })),
      },
    };
  }

  async listAppointments(actor: AuthUser, status?: string) {
    const patient = await this.requirePatient(actor.id);
    const filter: Record<string, unknown> = {
      patientId: patient._id,
      deletedAt: null,
    };
    if (status && status !== "all") {
      const map: Record<string, string[]> = {
        upcoming: [
          "CONFIRMED",
          "REMINDER_SENT",
          "DOCTOR_ASSIGNED",
          "WAITING_DOCTOR_APPROVAL",
          "PATIENT_ARRIVED",
          "WAITING_ROOM",
          "IN_TREATMENT",
        ],
        pending: [
          "NEW_REQUEST",
          "UNDER_SECRETARY_REVIEW",
          "WAITING_DOCTOR_APPROVAL",
        ],
        pending_reception: ["UNDER_SECRETARY_REVIEW", "NEW_REQUEST"],
        confirmed: ["CONFIRMED", "REMINDER_SENT"],
        completed: ["COMPLETED", "FOLLOW_UP_REQUIRED"],
        cancelled: ["CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC"],
        rescheduled: ["RESCHEDULED"],
        no_show: ["NO_SHOW"],
      };
      if (map[status]) filter.status = { $in: map[status] };
      else filter.status = status;
    }

    const rows = await this.appointments
      .find(filter)
      .sort({ startAt: -1 })
      .limit(100)
      .lean();
    const doctorIds = rows
      .map((a) => (a.doctorId ? String(a.doctorId) : null))
      .filter(Boolean) as string[];
    const doctors = await this.users
      .find({ _id: { $in: doctorIds } })
      .select("fullName")
      .lean();
    const doctorMap = new Map(doctors.map((d) => [String(d._id), d.fullName]));

    const requests = await this.requests
      .find({
        $or: [{ linkedPatientId: patient._id }, { phone: patient.phone }],
        deletedAt: null,
      })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return {
      ok: true,
      appointments: rows.map((a) =>
        this.serializeAppointment({
          ...(a as object as Appointment & {
            _id: Types.ObjectId;
            createdAt?: Date;
          }),
          doctor: { fullName: doctorMap.get(String(a.doctorId)) },
        }),
      ),
      bookingRequests: requests.map((r) => ({
        reference: r.requestNumber,
        status: r.status,
        reason: r.reason,
        preferredDate: r.preferredDate,
        preferredTime: r.preferredTime,
        assignmentMode: r.assignmentMode,
        createdAt: (r as { createdAt?: Date }).createdAt,
      })),
    };
  }

  async getAppointmentByReference(actor: AuthUser, reference: string) {
    const patient = await this.requirePatient(actor.id);
    const appt = await this.appointments
      .findOne({
        appointmentNumber: reference,
        patientId: patient._id,
        deletedAt: null,
      })
      .lean();
    if (!appt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الموعد غير موجود.",
      });
    }
    const doctor = appt.doctorId
      ? await this.users.findById(appt.doctorId).select("fullName doctor").lean()
      : null;
    const relatedFiles = await this.files
      .find({
        appointmentId: appt._id,
        patientId: patient._id,
        deletedAt: null,
        visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
      })
      .select("-storageKey")
      .lean();
    const relatedInstructions = await this.instructions
      .find({
        appointmentId: appt._id,
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
        approvedForPatient: true,
      })
      .lean();

    await this.audit(
      actor,
      "PATIENT_APPOINTMENT_VIEWED",
      "Appointment",
      String(appt._id),
    );

    const messagingEligible =
      appt.status === "COMPLETED" &&
      !!appt.doctorId &&
      ["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(
        (
          await this.users.findById(appt.doctorId).select("roleCode").lean()
        )?.roleCode || "",
      );

    return {
      ok: true,
      appointment: {
        ...this.serializeAppointment({
          ...(appt as object as Appointment & {
            _id: Types.ObjectId;
            createdAt?: Date;
          }),
          doctor: { fullName: doctor?.fullName },
        }),
        timeline: this.timelineFromStatus(
          appt.status,
          (appt as { createdAt?: Date }).createdAt,
          appt.startAt,
        ),
        messagingEligible,
        files: relatedFiles.map((f) => ({
          id: String(f._id),
          title: f.title,
          fileType: f.fileType,
          mimeType: f.mimeType,
          description: f.description,
          createdAt: (f as { createdAt?: Date }).createdAt,
          allowDownload: f.allowDownload,
        })),
        instructions: relatedInstructions.map((i) => ({
          id: String(i._id),
          title: i.title,
          body: i.body,
          instructionType: i.instructionType,
          followUpDate: i.followUpDate,
        })),
      },
    };
  }

  async requestCancellation(actor: AuthUser, reference: string, reason?: string) {
    const patient = await this.requirePatient(actor.id);
    const appt = await this.appointments.findOne({
      appointmentNumber: reference,
      patientId: patient._id,
      deletedAt: null,
    });
    if (!appt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الموعد غير موجود.",
      });
    }
    if (["COMPLETED", "CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC"].includes(appt.status)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن طلب إلغاء هذا الموعد.",
      });
    }
    appt.status = "CANCELLED_BY_PATIENT";
    appt.cancelReason = reason?.slice(0, 500) || "طلب إلغاء من المريض";
    await appt.save();
    await this.notifications.create({
      patientId: patient._id,
      title: "تم تسجيل طلب إلغاء الموعد",
      message: `الموعد ${reference}`,
      type: "appointment_cancelled",
      relatedRoute: `/patient/appointments/${reference}`,
    });
    await this.audit(actor, "PATIENT_APPOINTMENT_CANCEL_REQUESTED", "Appointment", String(appt._id));
    return { ok: true, message: "تم تسجيل طلب الإلغاء." };
  }

  async requestModification(
    actor: AuthUser,
    reference: string,
    note?: string,
  ) {
    const patient = await this.requirePatient(actor.id);
    const appt = await this.appointments.findOne({
      appointmentNumber: reference,
      patientId: patient._id,
      deletedAt: null,
    });
    if (!appt) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الموعد غير موجود.",
      });
    }
    if (["COMPLETED", "CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC"].includes(appt.status)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "لا يمكن طلب تعديل هذا الموعد.",
      });
    }
    await this.notifications.create({
      patientId: patient._id,
      title: "تم استلام طلب تعديل الموعد",
      message: `سيتم مراجعة طلبك للموعد ${reference} من الاستقبال.`,
      type: "appointment_modification_requested",
      relatedRoute: `/patient/appointments/${reference}`,
    });
    await this.audit(
      actor,
      "PATIENT_APPOINTMENT_MODIFICATION_REQUESTED",
      "Appointment",
      String(appt._id),
    );
    return {
      ok: true,
      message: "تم إرسال طلب التعديل إلى الاستقبال.",
      note: note?.slice(0, 500),
    };
  }

  async listMedicalCases(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.cases
      .find({
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
      })
      .sort({ updatedAt: -1 })
      .lean();
    const doctorIds = rows
      .map((c) => (c.doctorId ? String(c.doctorId) : null))
      .filter(Boolean) as string[];
    const doctors = await this.users
      .find({ _id: { $in: doctorIds } })
      .select("fullName")
      .lean();
    const map = new Map(doctors.map((d) => [String(d._id), d.fullName]));
    return {
      ok: true,
      cases: rows.map((c) => ({
        id: String(c._id),
        title: c.title,
        status: c.status,
        specialtyLabel: c.specialtyLabel,
        startDate: c.startDate,
        followUpDate: c.followUpDate,
        patientVisibleSummary: c.patientVisibleSummary,
        doctorName: c.doctorId ? map.get(String(c.doctorId)) : undefined,
        updatedAt: (c as { updatedAt?: Date }).updatedAt,
      })),
    };
  }

  async getMedicalCase(actor: AuthUser, id: string) {
    const patient = await this.requirePatient(actor.id);
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الحالة غير موجودة." });
    }
    const c = await this.cases
      .findOne({
        _id: id,
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
      })
      .lean();
    if (!c) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الحالة غير موجودة." });
    }
    const doctor = c.doctorId
      ? await this.users.findById(c.doctorId).select("fullName").lean()
      : null;
    const files = await this.files
      .find({
        medicalCaseId: c._id,
        patientId: patient._id,
        deletedAt: null,
        visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
      })
      .select("-storageKey")
      .lean();
    const instructions = await this.instructions
      .find({
        medicalCaseId: c._id,
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
        approvedForPatient: true,
      })
      .lean();
    await this.audit(actor, "PATIENT_MEDICAL_CASE_VIEWED", "MedicalCase", id);
    return {
      ok: true,
      medicalCase: {
        id: String(c._id),
        title: c.title,
        status: c.status,
        specialtyLabel: c.specialtyLabel,
        startDate: c.startDate,
        followUpDate: c.followUpDate,
        patientVisibleSummary: c.patientVisibleSummary,
        patientVisibleTreatmentPlan: c.patientVisibleTreatmentPlan,
        patientVisibleInstructions: c.patientVisibleInstructions,
        doctorName: doctor?.fullName,
        appointmentId: c.appointmentId ? String(c.appointmentId) : undefined,
        files: files.map((f) => ({
          id: String(f._id),
          title: f.title,
          fileType: f.fileType,
          mimeType: f.mimeType,
          description: f.description,
          createdAt: (f as { createdAt?: Date }).createdAt,
        })),
        instructions: instructions.map((i) => ({
          id: String(i._id),
          title: i.title,
          body: i.body,
          instructionType: i.instructionType,
        })),
      },
    };
  }

  async listFiles(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.files
      .find({
        patientId: patient._id,
        deletedAt: null,
        visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
      })
      .sort({ createdAt: -1 })
      .select("-storageKey")
      .lean();
    return {
      ok: true,
      files: rows.map((f) => ({
        id: String(f._id),
        title: f.title,
        description: f.description,
        fileType: f.fileType,
        mimeType: f.mimeType,
        allowDownload: f.allowDownload,
        createdAt: (f as { createdAt?: Date }).createdAt,
        medicalCaseId: f.medicalCaseId ? String(f.medicalCaseId) : undefined,
        appointmentId: f.appointmentId ? String(f.appointmentId) : undefined,
      })),
    };
  }

  async streamFile(actor: AuthUser, fileId: string, res: Response) {
    const patient = await this.requirePatient(actor.id);
    if (!Types.ObjectId.isValid(fileId)) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الملف غير موجود." });
    }
    const file = await this.files.findOne({
      _id: fileId,
      patientId: patient._id,
      deletedAt: null,
      visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
    });
    if (!file) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الملف غير موجود." });
    }
    const base = process.env.PATIENT_FILES_DIR || path.join(process.cwd(), "uploads", "patient-files");
    const resolved = path.resolve(base, file.storageKey);
    if (!resolved.startsWith(path.resolve(base)) || !existsSync(resolved)) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الملف غير متاح." });
    }
    await this.audit(actor, "PATIENT_FILE_VIEWED", "MedicalFile", fileId);
    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `${file.allowDownload ? "attachment" : "inline"}; filename="file"`,
    );
    createReadStream(resolved).pipe(res);
  }

  async listInstructions(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.instructions
      .find({
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
        approvedForPatient: true,
      })
      .sort({ createdAt: -1 })
      .lean();
    return {
      ok: true,
      disclaimer:
        "تعليمات هذه الصفحة مرتبطة بزيارتك وتوجيهات طبيبك. في الحالات الطارئة أو عند ظهور أعراض شديدة، تواصل مع العيادة أو اطلب الرعاية العاجلة المناسبة.",
      instructions: rows.map((i) => ({
        id: String(i._id),
        title: i.title,
        body: i.body,
        instructionType: i.instructionType,
        followUpDate: i.followUpDate,
        appointmentId: i.appointmentId ? String(i.appointmentId) : undefined,
      })),
    };
  }

  async listThreads(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.threads
      .find({ patientId: patient._id, deletedAt: null })
      .sort({ lastMessageAt: -1 })
      .lean();
    const doctorIds = rows.map((t) => String(t.doctorId));
    const doctors = await this.users
      .find({ _id: { $in: doctorIds } })
      .select("fullName")
      .lean();
    const map = new Map(doctors.map((d) => [String(d._id), d.fullName]));
    return {
      ok: true,
      disclaimer:
        "هذه المحادثة مخصصة للاستفسارات المتعلقة بالزيارة المكتملة، وليست لخدمات الطوارئ أو التشخيص الجديد.",
      emergency:
        "في حالة الألم الشديد أو النزيف أو تورم الوجه أو صعوبة التنفس أو البلع، تواصل مع العيادة فورًا أو اطلب الرعاية العاجلة.",
      threads: rows.map((t) => ({
        id: String(t._id),
        status: t.status,
        doctorName: map.get(String(t.doctorId)),
        appointmentId: String(t.appointmentId),
        patientUnreadCount: t.patientUnreadCount,
        lastMessageAt: t.lastMessageAt,
      })),
    };
  }

  async openThreadForAppointment(actor: AuthUser, reference: string) {
    const patient = await this.requirePatient(actor.id);
    const appt = await this.appointments.findOne({
      appointmentNumber: reference,
      patientId: patient._id,
      deletedAt: null,
    });
    if (!appt) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "الموعد غير موجود." });
    }
    const doctor = appt.doctorId
      ? await this.users.findById(appt.doctorId).lean()
      : null;
    assertCompletedVisitMessaging({
      appointmentStatus: appt.status,
      appointmentPatientId: String(appt.patientId),
      actorPatientId: String(patient._id),
      doctorId: appt.doctorId ? String(appt.doctorId) : null,
      doctorRoleCode: doctor?.roleCode,
    });
    if (!doctor) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "لا يوجد طبيب معيّن لهذا الموعد.",
      });
    }
    let thread = await this.threads.findOne({
      appointmentId: appt._id,
      deletedAt: null,
    });
    if (!thread) {
      thread = await this.threads.create({
        patientId: patient._id,
        doctorId: appt.doctorId,
        appointmentId: appt._id,
        status: "open",
        openedAt: new Date(),
        lastMessageAt: new Date(),
      });
      await this.audit(actor, "MESSAGE_THREAD_CREATED", "MedicalMessageThread", String(thread._id));
    }
    return { ok: true, threadId: String(thread._id) };
  }

  async getThread(actor: AuthUser, threadId: string) {
    const patient = await this.requirePatient(actor.id);
    if (!Types.ObjectId.isValid(threadId)) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "المحادثة غير موجودة." });
    }
    const thread = await this.threads.findOne({
      _id: threadId,
      patientId: patient._id,
      deletedAt: null,
    });
    if (!thread) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "المحادثة غير موجودة." });
    }
    const msgs = await this.messages
      .find({ threadId: thread._id, deletedAt: null })
      .sort({ createdAt: 1 })
      .lean();
    await this.messages.updateMany(
      {
        threadId: thread._id,
        senderRole: { $ne: "PATIENT" },
        isRead: false,
        deletedAt: null,
      },
      { $set: { isRead: true, readAt: new Date() } },
    );
    thread.patientUnreadCount = 0;
    await thread.save();
    const doctor = await this.users.findById(thread.doctorId).select("fullName").lean();
    const appt = await this.appointments
      .findById(thread.appointmentId)
      .select("appointmentNumber startAt status")
      .lean();
    return {
      ok: true,
      disclaimer:
        "هذه المحادثة مخصصة للاستفسارات المتعلقة بالزيارة المكتملة، وليست لخدمات الطوارئ أو التشخيص الجديد.",
      emergency:
        "في حالة الألم الشديد أو النزيف أو تورم الوجه أو صعوبة التنفس أو البلع، تواصل مع العيادة فورًا أو اطلب الرعاية العاجلة.",
      thread: {
        id: String(thread._id),
        status: thread.status,
        doctorName: doctor?.fullName,
        appointmentReference: appt?.appointmentNumber,
        completedAt: appt?.startAt,
      },
      messages: msgs.map((m) => ({
        id: String(m._id),
        senderRole: m.senderRole,
        message: m.message,
        isRead: m.isRead,
        createdAt: (m as { createdAt?: Date }).createdAt,
      })),
    };
  }

  async sendMessage(actor: AuthUser, threadId: string, message: string) {
    const patient = await this.requirePatient(actor.id);
    const text = (message || "").trim().slice(0, 4000);
    if (!text) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "الرسالة فارغة.",
      });
    }
    const thread = await this.threads.findOne({
      _id: threadId,
      patientId: patient._id,
      deletedAt: null,
    });
    if (!thread) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "المحادثة غير موجودة." });
    }
    if (["closed", "archived"].includes(thread.status)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "المحادثة مغلقة.",
      });
    }
    const appt = await this.appointments.findById(thread.appointmentId);
    if (!appt || appt.status !== "COMPLETED" || String(appt.patientId) !== String(patient._id)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "المحادثة غير مسموحة لهذا الموعد.",
      });
    }
    const msg = await this.messages.create({
      threadId: thread._id,
      senderId: new Types.ObjectId(actor.id),
      senderRole: "PATIENT",
      message: text,
    });
    thread.lastMessageAt = new Date();
    thread.doctorUnreadCount = (thread.doctorUnreadCount || 0) + 1;
    thread.status = "awaiting_doctor";
    await thread.save();
    await this.audit(actor, "MESSAGE_SENT", "MedicalMessage", String(msg._id));
    return { ok: true, messageId: String(msg._id) };
  }

  /** Doctor-side: list threads for treating doctor */
  async doctorListThreads(actor: AuthUser) {
    if (!["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(actor.roleCode)) {
      throw new ForbiddenException({ code: ErrorCodes.FORBIDDEN, message: "غير مصرح." });
    }
    const rows = await this.threads
      .find({ doctorId: actor.id, deletedAt: null })
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean();
    return {
      ok: true,
      threads: rows.map((t) => ({
        id: String(t._id),
        status: t.status,
        patientId: String(t.patientId),
        appointmentId: String(t.appointmentId),
        doctorUnreadCount: t.doctorUnreadCount,
        lastMessageAt: t.lastMessageAt,
      })),
    };
  }

  async doctorReply(actor: AuthUser, threadId: string, message: string) {
    if (!["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(actor.roleCode)) {
      throw new ForbiddenException({ code: ErrorCodes.FORBIDDEN, message: "غير مصرح." });
    }
    const text = (message || "").trim().slice(0, 4000);
    if (!text) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "الرسالة فارغة.",
      });
    }
    const thread = await this.threads.findOne({
      _id: threadId,
      doctorId: actor.id,
      deletedAt: null,
    });
    if (!thread) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "المحادثة غير موجودة." });
    }
    if (["closed", "archived"].includes(thread.status)) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "المحادثة مغلقة.",
      });
    }
    const msg = await this.messages.create({
      threadId: thread._id,
      senderId: new Types.ObjectId(actor.id),
      senderRole: "DOCTOR",
      message: text,
    });
    thread.lastMessageAt = new Date();
    thread.patientUnreadCount = (thread.patientUnreadCount || 0) + 1;
    thread.status = "awaiting_patient";
    await thread.save();
    await this.notifications.create({
      patientId: thread.patientId,
      title: "رسالة جديدة من الطبيب",
      message: "لديك رد جديد بخصوص زيارتك المكتملة.",
      type: "new_doctor_message",
      relatedRoute: `/patient/messages/${threadId}`,
    });
    await this.audit(actor, "MESSAGE_SENT", "MedicalMessage", String(msg._id));
    return { ok: true, messageId: String(msg._id) };
  }

  async doctorCloseThread(actor: AuthUser, threadId: string) {
    if (!["DOCTOR_GENERAL", "DOCTOR_SPECIALIST"].includes(actor.roleCode)) {
      throw new ForbiddenException({ code: ErrorCodes.FORBIDDEN, message: "غير مصرح." });
    }
    const thread = await this.threads.findOne({
      _id: threadId,
      doctorId: actor.id,
      deletedAt: null,
    });
    if (!thread) {
      throw new NotFoundException({ code: ErrorCodes.NOT_FOUND, message: "المحادثة غير موجودة." });
    }
    thread.status = "closed";
    thread.closedAt = new Date();
    await thread.save();
    await this.audit(actor, "MESSAGE_THREAD_CLOSED", "MedicalMessageThread", threadId);
    return { ok: true };
  }

  async listFollowUps(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.followUps
      .find({
        patientId: patient._id,
        deletedAt: null,
        visibleToPatient: true,
      })
      .sort({ recommendedFrom: -1 })
      .lean();
    return {
      ok: true,
      motivation: [
        "لا تنسَ موعد المتابعة الذي أوصى به طبيبك.",
        "احتفظ بتعليمات زيارتك السابقة وراجعها عند الحاجة.",
        "تابع مراحل علاجك من مكان واحد.",
        "احجز موعد المتابعة بسهولة عند الحاجة.",
        "المتابعة المنتظمة تساعد على اكتشاف المشكلات مبكرًا وفق تقييم الطبيب.",
      ],
      followUps: rows.map((f) => ({
        id: String(f._id),
        reason: f.reason,
        recommendedFrom: f.recommendedFrom,
        recommendedTo: f.recommendedTo,
        status: f.status,
        patientInstructions: f.patientInstructions,
      })),
    };
  }

  async listNotifications(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.notifications
      .find({ patientId: patient._id, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return {
      ok: true,
      notifications: rows.map((n) => ({
        id: String(n._id),
        title: n.title,
        message: n.message,
        type: n.type,
        relatedRoute: n.relatedRoute,
        isRead: n.isRead,
        createdAt: (n as { createdAt?: Date }).createdAt,
      })),
    };
  }

  async markNotificationRead(actor: AuthUser, id: string) {
    const patient = await this.requirePatient(actor.id);
    await this.notifications.updateOne(
      { _id: id, patientId: patient._id },
      { $set: { isRead: true } },
    );
    return { ok: true };
  }

  async markAllNotificationsRead(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    await this.notifications.updateMany(
      { patientId: patient._id, isRead: false },
      { $set: { isRead: true } },
    );
    return { ok: true };
  }

  async getProfile(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const user = await this.users.findById(actor.id).lean();
    return {
      ok: true,
      profile: {
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email || user?.email,
        city: patient.city,
        address: patient.address,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        locale: user?.locale || "ar",
        patientNumber: patient.patientNumber,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
      },
    };
  }

  async updateProfile(
    actor: AuthUser,
    dto: {
      fullName?: string;
      email?: string;
      city?: string;
      address?: string;
      locale?: "ar" | "en" | "fr";
      emergencyContact?: string;
      emergencyPhone?: string;
    },
  ) {
    const patient = await this.patients.findOne({
      userId: actor.id,
      deletedAt: null,
    });
    if (!patient) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "سجل المريض غير مرتبط بهذا الحساب.",
      });
    }
    if (dto.fullName) patient.fullName = dto.fullName.trim();
    if (dto.city !== undefined) patient.city = dto.city;
    if (dto.address !== undefined) patient.address = dto.address;
    if (dto.emergencyContact !== undefined) {
      patient.emergencyContact = dto.emergencyContact;
    }
    if (dto.emergencyPhone !== undefined) {
      patient.emergencyPhone = dto.emergencyPhone;
    }
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase() || undefined;
      if (email) {
        const taken = await this.users.findOne({
          email,
          _id: { $ne: actor.id },
          deletedAt: null,
        });
        if (taken) {
          throw new ConflictException({
            code: ErrorCodes.DUPLICATE_EMAIL,
            message: "البريد مستخدم بالفعل.",
          });
        }
      }
      patient.email = email;
      await this.users.updateOne(
        { _id: actor.id },
        { $set: { email, fullName: patient.fullName } },
      );
    } else if (dto.fullName) {
      await this.users.updateOne(
        { _id: actor.id },
        { $set: { fullName: patient.fullName } },
      );
    }
    if (dto.locale) {
      await this.users.updateOne({ _id: actor.id }, { $set: { locale: dto.locale } });
    }
    await patient.save();
    await this.audit(actor, "PATIENT_PROFILE_UPDATED", "Patient", String(patient._id));
    return { ok: true, message: "تم حفظ المعلومات الشخصية." };
  }

  async listSessions(actor: AuthUser) {
    const rows = await this.sessions
      .find({ userId: actor.id, revokedAt: null })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return {
      ok: true,
      sessions: rows.map((s) => ({
        id: String(s._id),
        createdAt: (s as { createdAt?: Date }).createdAt,
        expiresAt: s.expiresAt,
        userAgent: s.userAgent,
        ip: s.ipAddress,
      })),
    };
  }

  async revokeSession(actor: AuthUser, sessionId: string) {
    await this.sessions.updateOne(
      { _id: sessionId, userId: actor.id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit(actor, "SESSION_REVOKED", "Session", sessionId);
    return { ok: true };
  }

  async logoutAll(actor: AuthUser) {
    await this.sessions.updateMany(
      { userId: actor.id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
    await this.audit(actor, "LOGOUT_ALL_DEVICES", "User", actor.id);
    return { ok: true };
  }

  async listConsents(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const rows = await this.consents.find({ patientId: patient._id }).lean();
    return {
      ok: true,
      consents: rows.map((c) => ({
        id: String(c._id),
        consentType: c.consentType,
        accepted: c.accepted,
        acceptedAt: c.acceptedAt,
        withdrawnAt: c.withdrawnAt,
        required: c.required,
      })),
    };
  }

  async requestDeletion(actor: AuthUser, reason?: string) {
    const patient = await this.requirePatient(actor.id);
    const existing = await this.deletions.findOne({
      userId: actor.id,
      status: { $in: ["pending", "under_review"] },
    });
    if (existing) {
      return {
        ok: true,
        message: "طلب حذف الحساب قيد المعالجة بالفعل.",
        requestId: String(existing._id),
      };
    }
    const req = await this.deletions.create({
      userId: new Types.ObjectId(actor.id),
      patientId: patient._id,
      reason: reason?.slice(0, 500),
      status: "pending",
    });
    await this.audit(actor, "ACCOUNT_DELETION_REQUESTED", "AccountDeletionRequest", String(req._id));
    return {
      ok: true,
      message:
        "تم تسجيل طلب حذف/إخفاء الحساب. قد تُحتفظ السجلات الطبية وفق سياسة العيادة والقوانين المعمول بها.",
      requestId: String(req._id),
    };
  }

  async requestExport(actor: AuthUser) {
    const patient = await this.requirePatient(actor.id);
    const req = await this.exports.create({
      userId: new Types.ObjectId(actor.id),
      patientId: patient._id,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Build patient-safe export payload (no internal notes / storage keys).
    const [appts, cases, files, msgsThreads, consents, instructions] =
      await Promise.all([
        this.appointments
          .find({ patientId: patient._id, deletedAt: null })
          .select("appointmentNumber status startAt appointmentType cancelReason")
          .lean(),
        this.cases
          .find({
            patientId: patient._id,
            deletedAt: null,
            visibleToPatient: true,
          })
          .select(
            "title status patientVisibleSummary patientVisibleTreatmentPlan patientVisibleInstructions startDate followUpDate",
          )
          .lean(),
        this.files
          .find({
            patientId: patient._id,
            deletedAt: null,
            visibility: { $in: [...PATIENT_FILE_VISIBILITIES] },
          })
          .select("title fileType mimeType description createdAt")
          .lean(),
        this.threads.find({ patientId: patient._id, deletedAt: null }).lean(),
        this.consents.find({ patientId: patient._id }).lean(),
        this.instructions
          .find({
            patientId: patient._id,
            deletedAt: null,
            visibleToPatient: true,
            approvedForPatient: true,
          })
          .select("title body instructionType followUpDate")
          .lean(),
      ]);

    const threadIds = msgsThreads.map((t) => t._id);
    const messages = await this.messages
      .find({ threadId: { $in: threadIds }, deletedAt: null })
      .select("threadId senderRole message createdAt")
      .lean();

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        patientNumber: patient.patientNumber,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email,
        city: patient.city,
        address: patient.address,
      },
      appointments: appts,
      medicalCases: cases,
      files,
      instructions,
      messages,
      consents,
    };

    const dir =
      process.env.PATIENT_EXPORT_DIR ||
      path.join(process.cwd(), "uploads", "patient-exports");
    await fs.mkdir(dir, { recursive: true });
    const key = `${actor.id}-${req._id}.json`;
    await fs.writeFile(path.join(dir, key), JSON.stringify(payload, null, 2), "utf8");
    req.status = "ready";
    req.storageKey = key;
    req.readyAt = new Date();
    await req.save();
    await this.audit(actor, "DATA_EXPORT_REQUESTED", "DataExportRequest", String(req._id));
    return {
      ok: true,
      message: "تم تجهيز تصدير بياناتك المتاحة للعرض.",
      requestId: String(req._id),
      status: "ready",
    };
  }

  async downloadExport(actor: AuthUser, requestId: string, res: Response) {
    const req = await this.exports.findOne({
      _id: requestId,
      userId: actor.id,
      status: "ready",
    });
    if (!req || !req.storageKey) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "ملف التصدير غير متاح.",
      });
    }
    if (req.expiresAt && req.expiresAt < new Date()) {
      req.status = "expired";
      await req.save();
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "انتهت صلاحية ملف التصدير.",
      });
    }
    const dir =
      process.env.PATIENT_EXPORT_DIR ||
      path.join(process.cwd(), "uploads", "patient-exports");
    const resolved = path.resolve(dir, req.storageKey);
    if (!resolved.startsWith(path.resolve(dir)) || !existsSync(resolved)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "ملف التصدير غير متاح.",
      });
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="patient-export.json"`,
    );
    createReadStream(resolved).pipe(res);
  }
}
