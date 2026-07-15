import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLog, User } from "../auth/schemas/auth.schemas";
import { AppointmentsService } from "../appointments/appointments.service";
import { PatientsService } from "../patients/patients.service";

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<User>,
    @InjectModel(AuditLog.name) private readonly auditLogs: Model<AuditLog>,
    private readonly patients: PatientsService,
    private readonly appointments: AppointmentsService,
  ) {}

  private startOfDay(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private startOfWeek(d = new Date()) {
    const x = this.startOfDay(d);
    const day = x.getDay();
    // Sunday start to match clinic week labels used in legacy
    x.setDate(x.getDate() - day);
    return x;
  }

  private startOfMonth(d = new Date()) {
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  }

  async ownerStats() {
    const today = this.startOfDay();
    const week = this.startOfWeek();
    const month = this.startOfMonth();

    const [
      patientsTotal,
      patientsToday,
      patientsWeek,
      patientsMonth,
      doctors,
      doctorsInactive,
      secretaries,
      apptsToday,
      apptsCompletedToday,
      apptsCancelledToday,
      apptsNoShowToday,
      waitingCount,
      inTreatment,
      recentAudit,
    ] = await Promise.all([
      this.patients.countActive(),
      this.patients.countCreatedSince(today),
      this.patients.countCreatedSince(week),
      this.patients.countCreatedSince(month),
      this.users.countDocuments({
        deletedAt: null,
        doctor: { $exists: true },
        status: "ACTIVE",
        "doctor.isActive": { $ne: false },
      }),
      this.users.countDocuments({
        deletedAt: null,
        doctor: { $exists: true },
        $or: [{ status: "INACTIVE" }, { "doctor.isActive": false }],
      }),
      this.users.countDocuments({
        deletedAt: null,
        roleCode: "SECRETARY",
        status: "ACTIVE",
      }),
      this.appointments.countForDay(today),
      this.appointments.countForDay(today, ["COMPLETED"]),
      this.appointments.countForDay(today, [
        "CANCELLED_BY_CLINIC",
        "CANCELLED_BY_PATIENT",
      ]),
      this.appointments.countForDay(today, ["NO_SHOW"]),
      this.appointments.countWaiting(),
      this.appointments.countForDay(today, ["IN_TREATMENT"]),
      this.auditLogs
        .find({})
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),
    ]);

    const actorIds = [
      ...new Set(
        recentAudit
          .map((a) => (a.userId ? String(a.userId) : null))
          .filter(Boolean) as string[],
      ),
    ];
    const actors = await this.users
      .find({ _id: { $in: actorIds } })
      .select("fullName roleCode")
      .lean();
    const actorMap = new Map(actors.map((u) => [String(u._id), u]));

    return {
      ok: true,
      stats: {
        patientsTotal,
        patientsToday,
        patientsWeek,
        patientsMonth,
        doctorsActive: doctors,
        doctorsUnavailable: doctorsInactive,
        secretariesActive: secretaries,
        appointmentsToday: apptsToday,
        appointmentsCompletedToday: apptsCompletedToday,
        appointmentsCancelledToday: apptsCancelledToday,
        appointmentsNoShowToday: apptsNoShowToday,
        waitingNow: waitingCount,
        inTreatmentNow: inTreatment,
      },
      recentActivity: recentAudit.map((a) => {
        const actor = a.userId ? actorMap.get(String(a.userId)) : undefined;
        return {
          id: String(a._id),
          action: a.action,
          entityType: a.entityType,
          entityId: a.entityId,
          roleCode: a.roleCode || actor?.roleCode,
          actorName: actor?.fullName,
          createdAt: (a as { createdAt?: Date }).createdAt,
        };
      }),
    };
  }

  async secretaryStats() {
    const today = this.startOfDay();
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

    const todayISO = today.toISOString().slice(0, 10);
    const [upcoming, waiting] = await Promise.all([
      this.appointments.list({ date: todayISO, pageSize: "20" }),
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
    const today = this.startOfDay();
    const todayISO = today.toISOString().slice(0, 10);
    const doctorId =
      user.roleCode === "ADMIN" ? undefined : user.id;
    const mine = await this.appointments.list({
      date: todayISO,
      doctorId,
      pageSize: "50",
    });
    const waiting = await this.appointments.listWaiting(doctorId);
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
