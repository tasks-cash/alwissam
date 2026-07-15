"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { apiPatch } from "../../../../../lib/api";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type Stats = {
  appointmentsToday: number;
  completedToday: number;
  waitingNow: number;
  nextAppointment: {
    id: string;
    patientName?: string;
    startAt: string;
    appointmentNumber?: string;
  } | null;
};

type Appt = {
  id: string;
  appointmentNumber: string;
  patientName?: string;
  status: string;
  startAt: string;
};

type Wait = {
  id: string;
  patientName?: string;
  status: string;
  waitingMinutes: number;
};

export default function DoctorGeneralDashboardPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_GENERAL", "DOCTOR_SPECIALIST"],
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [waiting, setWaiting] = useState<Wait[]>([]);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard/doctor", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setStats(data.stats || null);
    setAppts(Array.isArray(data.todayAppointments) ? data.todayAppointments : []);
    setWaiting(Array.isArray(data.waitingQueue) ? data.waitingQueue : []);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function start(entryId: string) {
    const { ok, data } = await apiPatch<{ message?: string }>("/api/waiting-room", {
      entryId,
      status: "WITH_DOCTOR",
    });
    setMsg(ok ? data.message || dict.successSaved : String(data.message || ""));
    if (ok) void load();
  }

  async function complete(entryId: string) {
    const { ok, data } = await apiPatch<{ message?: string }>("/api/waiting-room", {
      entryId,
      status: "SESSION_DONE",
    });
    setMsg(ok ? data.message || dict.successSaved : String(data.message || ""));
    if (ok) void load();
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={`${dict.dashboardWelcome}, ${user.fullName}`}
      description={dict.doctorDashboardLead}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}

      <section className="stat-grid">
        <article className="stat-card card-surface">
          <span>{dict.appointmentsToday}</span>
          <strong>{stats?.appointmentsToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.appointmentsCompleted}</span>
          <strong>{stats?.completedToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.waitingNow}</span>
          <strong>{stats?.waitingNow ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.startAt}</span>
          <strong>
            {stats?.nextAppointment
              ? new Date(stats.nextAppointment.startAt).toLocaleTimeString(locale)
              : "—"}
          </strong>
        </article>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar">
          <Link className="btn btn-outline" href={`/${locale}/secretary/directed`}>
            {dict.viewWaiting}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/secretary/patients`}>
            {dict.navPatients}
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
      </section>

      <section className="card-surface dash-actions">
        <h2>{dict.waitingQueue}</h2>
        {waiting.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{dict.patient}</th>
                  <th>{dict.status}</th>
                  <th>min</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map((w) => (
                  <tr key={w.id}>
                    <td>{w.patientName || "—"}</td>
                    <td>
                      <span className="badge">{w.status}</span>
                    </td>
                    <td>{w.waitingMinutes}</td>
                    <td>
                      <div className="toolbar">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => void start(w.id)}
                        >
                          {dict.startConsult}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => void complete(w.id)}
                        >
                          {dict.complete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card-surface dash-actions">
        <h2>{dict.upcomingAppointments}</h2>
        {appts.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.patient}</th>
                  <th>{dict.startAt}</th>
                  <th>{dict.status}</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointmentNumber}</td>
                    <td>{a.patientName || "—"}</td>
                    <td>{new Date(a.startAt).toLocaleString(locale)}</td>
                    <td>
                      <span className="badge">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
