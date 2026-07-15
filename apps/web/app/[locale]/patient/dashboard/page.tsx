"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type Patient = {
  id: string;
  patientNumber: string;
  fullName: string;
  phone: string;
  email?: string;
};

type Appt = {
  id: string;
  appointmentNumber: string;
  doctorName?: string;
  status: string;
  startAt: string;
  appointmentType: string;
};

export default function PatientDashboardPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["PATIENT"],
    loginPath: "patient",
  });
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(async () => {
    const [meRes, apRes] = await Promise.all([
      fetch("/api/patients/me", { credentials: "include" }),
      fetch("/api/appointments/mine", { credentials: "include" }),
    ]);
    if (meRes.ok) {
      const me = await meRes.json();
      setPatient(me.patient || null);
    } else if (meRes.status === 404) {
      setPatient(null);
    } else {
      setLoadError(dict.connectionError);
    }
    if (apRes.ok) {
      const a = await apRes.json();
      setAppts(Array.isArray(a.appointments) ? a.appointments : []);
    }
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
      description={dict.patientDashboardLead}
    >
      <section className="stat-grid">
        <article className="stat-card card-surface">
          <span>{dict.patient}</span>
          <strong>{patient?.patientNumber || "—"}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.phone}</span>
          <strong>{patient?.phone || "—"}</strong>
        </article>
        <article className="stat-card card-surface">
          <span>{dict.upcomingAppointments}</span>
          <strong>{appts.length}</strong>
        </article>
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
                  <th>{dict.doctor}</th>
                  <th>{dict.appointmentType}</th>
                  <th>{dict.startAt}</th>
                  <th>{dict.status}</th>
                </tr>
              </thead>
              <tbody>
                {appts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointmentNumber}</td>
                    <td>{a.doctorName || "—"}</td>
                    <td>{a.appointmentType}</td>
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
