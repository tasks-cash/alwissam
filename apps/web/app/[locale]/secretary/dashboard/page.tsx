"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type Stats = {
  appointmentsToday: number;
  waitingNow: number;
  patientsToday: number;
  confirmedToday: number;
  cancelledToday: number;
  noShowToday: number;
  doctorsActive: number;
};

type Appt = {
  id: string;
  appointmentNumber: string;
  patientName?: string;
  doctorName?: string;
  status: string;
  startAt: string;
};

type Wait = {
  id: string;
  patientName?: string;
  doctorName?: string;
  status: string;
  waitingMinutes: number;
};

export default function SecretaryDashboardPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY"],
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [waiting, setWaiting] = useState<Wait[]>([]);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard/secretary", {
      credentials: "include",
    });
    if (!res.ok) {
      setLoadError(dict.connectionError);
      return;
    }
    const data = await res.json();
    setStats(data.stats || null);
    setAppts(Array.isArray(data.todayAppointments) ? data.todayAppointments : []);
    setWaiting(Array.isArray(data.waitingQueue) ? data.waitingQueue : []);
  }, [dict.connectionError]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error || loadError) {
    return (
      <main className="dash-panel alert-error">{error || loadError}</main>
    );
  }

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={`${dict.dashboardWelcome}, ${user.fullName}`}
      description={dict.secretaryDashboardLead}
    >
      <section className="stat-grid">
        <article className="stat-card card-surface">
          <span>{dict.appointmentsToday}</span>
          <strong>{stats?.appointmentsToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.waitingNow}</span>
          <strong>{stats?.waitingNow ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.patientsToday}</span>
          <strong>{stats?.patientsToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.confirmedToday}</span>
          <strong>{stats?.confirmedToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.appointmentsCancelled}</span>
          <strong>{stats?.cancelledToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.appointmentsNoShow}</span>
          <strong>{stats?.noShowToday ?? 0}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.doctorsActive}</span>
          <strong>{stats?.doctorsActive ?? 0}</strong>
        </article>
      </section>

      <section className="card-surface dash-actions">
        <h2>{dict.quickActions}</h2>
        <div className="toolbar">
          <Link className="btn btn-primary" href={`/${locale}/secretary/patients`}>
            {dict.registerPatient}
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/appointments`}
          >
            {dict.scheduleAppointment}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/secretary/directed`}>
            {dict.viewWaiting}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/secretary/today`}>
            {dict.navToday}
          </Link>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
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
                  <th>{dict.doctor}</th>
                  <th>{dict.startAt}</th>
                  <th>{dict.status}</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointmentNumber}</td>
                    <td>{a.patientName || "—"}</td>
                    <td>{a.doctorName || "—"}</td>
                    <td>{new Date(a.startAt).toLocaleTimeString(locale)}</td>
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
                  <th>{dict.doctor}</th>
                  <th>{dict.status}</th>
                  <th>min</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map((w) => (
                  <tr key={w.id}>
                    <td>{w.patientName || "—"}</td>
                    <td>{w.doctorName || "—"}</td>
                    <td>
                      <span className="badge">{w.status}</span>
                    </td>
                    <td>{w.waitingMinutes}</td>
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
