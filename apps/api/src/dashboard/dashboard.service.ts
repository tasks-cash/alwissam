import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, User } from "../auth/schemas/auth.schemas";
import { AppointmentsService } from "../appointments/appointments.service";
import { PatientsService } from "../patients/patients.service";
import type { AuthUser } from "../common/auth/session.guard";

const CLINIC_TZ = "Africa/Algiers";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
    private readonly patients: PatientsService,
    private readonly appointments: AppointmentsService,
  ) {}

  /** Clinic-local calendar day bounds (Algeria is UTC+1 year-round). */
  private clinicDayBounds(now = new Date()) {
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const start = new Date(`${day}T00:00:00+01:00`);
    const end = new Date(`${day}T23:59:59.999+01:00`);
    return { start, end, day };
  }

  private startOfWeekClinic(now = new Date()) {
    const { start } = this.clinicDayBounds(now);
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: CLINIC_TZ,
      weekday: "short",
    }).format(now);
    const map: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const offset = map[weekday] ?? start.getDay();
    const weekStart = new Date(start);
    weekStart.setUTCDate(weekStart.getUTCDate() - offset);
    return weekStart;
  }

  private startOfMonthClinic(now = new Date()) {
    const day = new Intl.DateTimeFormat("en-CA", {
      timeZone: CLINIC_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const [y, m] = day.split("-").map(Number);
    return new Date(`${y}-${String(m).padStart(2, "0")}-01T00:00:00+01:00`);
  }

  private async safeCount(fn: () => Promise<number>): Promise<number | null> {
    try {
      return await fn();
    } catch {
      return null;
    }
  }

  async ownerStats(actor?: AuthUser, mode?: "quick" | "full" | "light") {
    const resolvedMode = mode === "full" ? "full" : "quick";
    const { start: today } = this.clinicDayBounds();
    const week = this.startOfWeekClinic();
    const month = this.startOfMonthClinic();

    const lightKeys = {
      appointmentsToday: () => this.appointments.countForDay(today),
      waitingNow: () => this.appointments.countWaiting(),
      inTreatmentNow: () =>
        this.appointments.countForDay(today, ["IN_TREATMENT"]),
      appointmentsCompletedToday: () =>
        this.appointments.countForDay(today, ["COMPLETED"]),
      pendingRequests: () => this.appointments.countPendingRequests(),
      doctorsActive: () =>
        this.users.countDocuments({
          deletedAt: null,
          doctor: { $exists: true },
          status: "ACTIVE",
          "doctor.isActive": { $ne: false },
        }),
      secretariesActive: () =>
        this.users.countDocuments({
          deletedAt: null,
          roleCode: "SECRETARY",
          status: "ACTIVE",
        }),
    };

    const [
      appointmentsToday,
      waitingNow,
      inTreatmentNow,
      appointmentsCompletedToday,
      pendingRequests,
      doctorsActive,
      secretariesActive,
    ] = await Promise.all([
      this.safeCount(lightKeys.appointmentsToday),
      this.safeCount(lightKeys.waitingNow),
      this.safeCount(lightKeys.inTreatmentNow),
      this.safeCount(lightKeys.appointmentsCompletedToday),
      this.safeCount(lightKeys.pendingRequests),
      this.safeCount(lightKeys.doctorsActive),
      this.safeCount(lightKeys.secretariesActive),
    ]);

    const lightStats = {
      appointmentsToday: appointmentsToday ?? 0,
      waitingNow: waitingNow ?? 0,
      inTreatmentNow: inTreatmentNow ?? 0,
      appointmentsCompletedToday: appointmentsCompletedToday ?? 0,
      pendingRequests: pendingRequests ?? 0,
      doctorsActive: doctorsActive ?? 0,
      secretariesActive: secretariesActive ?? 0,
      unreadStaffMessages: 0,
      pendingSupportRequests: 0,
      _partialFailures: [
        appointmentsToday === null && "appointmentsToday",
        waitingNow === null && "waitingNow",
        inTreatmentNow === null && "inTreatmentNow",
        appointmentsCompletedToday === null && "appointmentsCompletedToday",
        pendingRequests === null && "pendingRequests",
        doctorsActive === null && "doctorsActive",
        secretariesActive === null && "secretariesActive",
      ].filter(Boolean) as string[],
    };

    if (resolvedMode === "quick") {
      return {
        ok: true,
        mode: "quick" as const,
        timezone: CLINIC_TZ,
        stats: {
          ...lightStats,
          patientsTotal: 0,
          patientsToday: 0,
          patientsWeek: 0,
          patientsMonth: 0,
          doctorsUnavailable: 0,
          appointmentsCancelledToday: 0,
          appointmentsNoShowToday: 0,
        },
        modules: this.quickModules(),
        recentActivity: [],
      };
    }

    const [
      patientsTotal,
      patientsToday,
      patientsWeek,
      patientsMonth,
      doctorsInactive,
      apptsCancelledToday,
      apptsNoShowToday,
      recentAudit,
    ] = await Promise.all([
      this.safeCount(() => this.patients.countActive()),
      this.safeCount(() => this.patients.countCreatedSince(today)),
      this.safeCount(() => this.patients.countCreatedSince(week)),
      this.safeCount(() => this.patients.countCreatedSince(month)),
      this.safeCount(() =>
        this.users.countDocuments({
          deletedAt: null,
          doctor: { $exists: true },
          $or: [{ status: "INACTIVE" }, { "doctor.isActive": false }],
        }),
      ),
      this.safeCount(() =>
        this.appointments.countForDay(today, [
          "CANCELLED_BY_CLINIC",
          "CANCELLED_BY_PATIENT",
        ]),
      ),
      this.safeCount(() => this.appointments.countForDay(today, ["NO_SHOW"])),
      this.auditLogs.find({}).sort({ createdAt: -1 }).limit(15).lean().catch(() => []),
    ]);

    const actorIds = [
      ...new Set(
        (recentAudit || [])
          .map((a) => (a.userId ? String(a.userId) : null))
          .filter(Boolean) as string[],
      ),
    ];
    const actors = actorIds.length
      ? await this.users
          .find({ _id: { $in: actorIds } })
          .select("fullName roleCode")
          .lean()
      : [];
    const actorMap = new Map(actors.map((u) => [String(u._id), u]));

    return {
      ok: true,
      mode: "full" as const,
      timezone: CLINIC_TZ,
      stats: {
        ...lightStats,
        patientsTotal: patientsTotal ?? 0,
        patientsToday: patientsToday ?? 0,
        patientsWeek: patientsWeek ?? 0,
        patientsMonth: patientsMonth ?? 0,
        doctorsUnavailable: doctorsInactive ?? 0,
        appointmentsCancelledToday: apptsCancelledToday ?? 0,
        appointmentsNoShowToday: apptsNoShowToday ?? 0,
        _partialFailures: [
          ...lightStats._partialFailures,
          patientsTotal === null && "patientsTotal",
          patientsToday === null && "patientsToday",
          patientsWeek === null && "patientsWeek",
          patientsMonth === null && "patientsMonth",
          doctorsInactive === null && "doctorsUnavailable",
          apptsCancelledToday === null && "appointmentsCancelledToday",
          apptsNoShowToday === null && "appointmentsNoShowToday",
        ].filter(Boolean) as string[],
      },
      modules: this.fullModules(),
      recentActivity: (recentAudit || []).map((a) => {
        const aud = a.userId ? actorMap.get(String(a.userId)) : undefined;
        return {
          id: String(a._id),
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          roleCode: a.roleCode || aud?.roleCode,
          actorName: aud?.fullName,
          createdAt: (a as { createdAt?: Date }).createdAt,
        };
      }),
      actor: actor
        ? { id: actor.id, role: actor.roleCode, fullName: actor.fullName }
        : undefined,
    };
  }

  private quickModules() {
    // Keep in sync with apps/web/lib/navigation.ts ADMIN_QUICK_HREFS
    return [
      {
        key: "overview",
        href: "/doctor/specialist/dashboard",
        labelKey: "navOwnerDashboard",
      },
      { key: "doctors", href: "/doctor/specialist/doctors", labelKey: "navDoctors" },
      {
        key: "secretaries",
        href: "/doctor/specialist/secretaries",
        labelKey: "navSecretaries",
      },
      {
        key: "specialistPatients",
        href: "/doctor/specialist/patients",
        labelKey: "navSpecialistPatients",
      },
      {
        key: "invitations",
        href: "/doctor/specialist/invitations",
        labelKey: "navInvitations",
      },
      { key: "settings", href: "/doctor/specialist/settings", labelKey: "navSettings" },
      {
        key: "audit",
        href: "/doctor/specialist/audit-logs",
        labelKey: "navAuditLogs",
      },
      {
        key: "generalDoctor",
        href: "/doctor/general/dashboard",
        labelKey: "navDoctorDashboard",
      },
      {
        key: "secretaryHub",
        href: "/secretary/dashboard",
        labelKey: "navSecretaryDashboard",
      },
      { key: "patients", href: "/secretary/patients", labelKey: "navPatients" },
      {
        key: "appointments",
        href: "/secretary/appointments",
        labelKey: "navAppointments",
      },
      { key: "today", href: "/secretary/today", labelKey: "navToday" },
      { key: "queue", href: "/secretary/directed", labelKey: "navWaiting" },
      {
        key: "assignment",
        href: "/secretary/assignment-queue",
        labelKey: "navAssignmentQueue",
      },
      { key: "payments", href: "/secretary/payments", labelKey: "navPayments" },
    ];
  }

  private fullModules() {
    // Quick modules + ADMIN_FULL_EXTRA_HREFS (Nest CMS extras)
    return [
      ...this.quickModules(),
      {
        key: "experiences",
        href: "/doctor/specialist/public-content/patient-experiences",
        labelKey: "navPatientExperiences",
      },
      {
        key: "beforeAfter",
        href: "/doctor/specialist/public-content/before-after",
        labelKey: "navBeforeAfter",
      },
      {
        key: "specialties",
        href: "/doctor/specialist/public-content/specialties",
        labelKey: "navSpecialtiesAdmin",
      },
      {
        key: "services",
        href: "/doctor/specialist/public-content/services",
        labelKey: "navServicesAdmin",
      },
      {
        key: "faqs",
        href: "/doctor/specialist/public-content/faqs",
        labelKey: "navFaqsAdmin",
      },
      {
        key: "reviews",
        href: "/doctor/specialist/public-content/reviews",
        labelKey: "navReviewsAdmin",
      },
      {
        key: "doctorMessages",
        href: "/doctor/specialist/messages",
        labelKey: "navDoctorMessages",
      },
    ];
  }

  async secretaryStats() {
    const { start: today, day } = this.clinicDayBounds();
    const [
      appointmentsToday,
      waitingNow,
      patientsToday,
      confirmedToday,
      cancelledToday,
      noShowToday,
      doctorsActive,
    ] = await Promise.all([
      this.appointments.countForDay(today),
      this.appointments.countWaiting(),
      this.patients.countCreatedSince(today),
      this.appointments.countForDay(today, ["CONFIRMED", "REMINDER_SENT"]),
      this.appointments.countForDay(today, [
        "CANCELLED_BY_CLINIC",
        "CANCELLED_BY_PATIENT",
      ]),
      this.appointments.countForDay(today, ["NO_SHOW"]),
      this.users.countDocuments({
        deletedAt: null,
        doctor: { $exists: true },
        status: "ACTIVE",
        "doctor.isActive": { $ne: false },
      }),
    ]);

    const [upcoming, waiting] = await Promise.all([
      this.appointments.list({ date: day, pageSize: "20" }),
      this.appointments.listWaiting(),
    ]);

    return {
      ok: true,
      stats: {
        appointmentsToday,
        waitingNow,
        patientsToday,
        confirmedToday,
        cancelledToday,
        noShowToday,
        doctorsActive,
      },
      todayAppointments: upcoming.appointments,
      waitingQueue: waiting.entries,
    };
  }

  async doctorStats(user: { id: string; roleCode: string }) {
    const { day } = this.clinicDayBounds();
    const doctorId = user.roleCode === "ADMIN" ? undefined : user.id;
    const mine = await this.appointments.list(
      {
        date: day,
        doctorId,
        pageSize: "50",
      },
      user as AuthUser,
    );
    const waiting = await this.appointments.listWaiting(doctorId, user as AuthUser);
    const completed = mine.appointments.filter((a) => a.status === "COMPLETED")
      .length;
    const upcoming = mine.appointments.filter(
      (a) =>
        a.status === "CONFIRMED" ||
        a.status === "WAITING_ROOM" ||
        a.status === "PATIENT_ARRIVED",
    );

    return {
      ok: true,
      stats: {
        appointmentsToday: mine.total,
        completedToday: completed,
        waitingNow: waiting.entries.length,
        nextAppointment: upcoming[0] || null,
      },
      todayAppointments: mine.appointments,
      waitingQueue: waiting.entries,
    };
  }
}
