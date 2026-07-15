"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiPost } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type Appt = {
  id: string;
  appointmentNumber: string;
  patientName?: string;
  doctorName?: string;
  status: string;
  startAt: string;
  appointmentType: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function SecretaryTodayPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  });
  const [rows, setRows] = useState<Appt[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/appointments?date=${encodeURIComponent(todayISO())}&pageSize=100`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const data = await res.json();
    setRows(Array.isArray(data.appointments) ? data.appointments : []);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function checkIn(appointmentId: string) {
    setBusy(appointmentId);
    setMsg("");
    const { ok, data } = await apiPost<{ message?: string }>(
      "/api/secretary/appointments/check-in",
      { appointmentId },
    );
    setBusy("");
    setMsg(ok ? data.message || dict.successSaved : data.message || dict.connectionError);
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
      title={dict.navToday}
      description={dict.secretaryDashboardLead}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{dict.appointmentsToday}</h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.patient}</th>
                  <th>{dict.doctor}</th>
                  <th>{dict.appointmentType}</th>
                  <th>{dict.startAt}</th>
                  <th>{dict.status}</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id}>
                    <td>{a.appointmentNumber}</td>
                    <td>{a.patientName || "—"}</td>
                    <td>{a.doctorName || "—"}</td>
                    <td>{a.appointmentType}</td>
                    <td>{new Date(a.startAt).toLocaleString(locale)}</td>
                    <td>
                      <span className="badge">{a.status}</span>
                    </td>
                    <td>
                      {["CONFIRMED", "REMINDER_SENT", "PATIENT_ARRIVED"].includes(
                        a.status,
                      ) ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={busy === a.id}
                          onClick={() => void checkIn(a.id)}
                        >
                          {busy === a.id ? dict.saving : dict.checkIn}
                        </button>
                      ) : (
                        "—"
                      )}
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
