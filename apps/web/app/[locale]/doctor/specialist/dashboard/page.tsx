"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type OwnerStats = {
  patientsTotal: number;
  patientsToday: number;
  patientsWeek: number;
  patientsMonth: number;
  doctorsActive: number;
  doctorsUnavailable: number;
  secretariesActive: number;
  appointmentsToday: number;
  appointmentsCompletedToday: number;
  appointmentsCancelledToday: number;
  appointmentsNoShowToday: number;
  waitingNow: number;
  inTreatmentNow: number;
};

type Activity = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorName?: string;
  roleCode?: string;
  createdAt?: string;
};

export default function OwnerDashboardPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/dashboard/owner", { credentials: "include" });
    if (!res.ok) {
      setLoadError(dict.connectionError);
      return;
    }
    const data = await res.json();
    setStats(data.stats || null);
    setActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
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

  const cards: { label: string; value: number }[] = stats
    ? [
        { label: dict.patientsTotal, value: stats.patientsTotal },
        { label: dict.patientsToday, value: stats.patientsToday },
        { label: dict.patientsWeek, value: stats.patientsWeek },
        { label: dict.patientsMonth, value: stats.patientsMonth },
        { label: dict.doctorsActive, value: stats.doctorsActive },
        { label: dict.doctorsUnavailable, value: stats.doctorsUnavailable },
        { label: dict.secretariesCount, value: stats.secretariesActive },
        { label: dict.appointmentsToday, value: stats.appointmentsToday },
        {
          label: dict.appointmentsCompleted,
          value: stats.appointmentsCompletedToday,
        },
        {
          label: dict.appointmentsCancelled,
          value: stats.appointmentsCancelledToday,
        },
        {
          label: dict.appointmentsNoShow,
          value: stats.appointmentsNoShowToday,
        },
        { label: dict.waitingNow, value: stats.waitingNow },
        { label: dict.inTreatment, value: stats.inTreatmentNow },
      ]
    : [];

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={`${dict.dashboardWelcome}, ${user.fullName}`}
      description={dict.dashboardLead}
    >
      <section className="stat-grid">
        {cards.map((c) => (
          <article key={c.label} className="stat-card card-surface">
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </article>
        ))}
      </section>

      <section className="card-surface dash-actions">
        <h2>{dict.quickActions}</h2>
        <div className="cta-row toolbar">
          <Link
            className="btn btn-primary"
            href={`/${locale}/secretary/patients`}
          >
            {dict.createPatient}
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/appointments`}
          >
            {dict.createAppointment}
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/directed`}
          >
            {dict.viewWaiting}
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctor/specialist/doctors`}
          >
            {dict.openDoctors}
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctor/specialist/secretaries`}
          >
            {dict.openSecretaries}
          </Link>
        </div>
      </section>

      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{dict.recentActivity}</h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {activity.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div className="activity-list">
            {activity.map((a) => (
              <div key={a.id} className="activity-item">
                <strong>
                  {a.actorName || "—"} · {a.action}
                </strong>
                <span className="muted">
                  {a.entityType}
                  {a.entityId ? ` #${a.entityId.slice(-6)}` : ""} ·{" "}
                  {a.createdAt
                    ? new Date(a.createdAt).toLocaleString(locale)
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
