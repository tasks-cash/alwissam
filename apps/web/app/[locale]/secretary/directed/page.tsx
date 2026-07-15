"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../components/layout/DashboardShell";
import { apiPatch } from "../../../../lib/api";
import { useDashboardSession } from "../../../../lib/use-dashboard-session";

type Entry = {
  id: string;
  appointmentId: string;
  appointmentNumber?: string;
  patientName?: string;
  doctorName?: string;
  status: string;
  waitingMinutes: number;
  urgency?: boolean;
};

export default function WaitingQueuePage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "SECRETARY", "DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  });
  const [entries, setEntries] = useState<Entry[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/waiting-room", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setEntries(Array.isArray(data.entries) ? data.entries : []);
  }, []);

  useEffect(() => {
    if (!user) return;
    void load();
    const t = setInterval(() => void load(), 15000);
    return () => clearInterval(t);
  }, [load, user]);

  async function act(entryId: string, status: string) {
    setBusy(entryId + status);
    setMsg("");
    const { ok, data } = await apiPatch<{ message?: string }>("/api/waiting-room", {
      entryId,
      status,
    });
    setBusy("");
    setMsg(ok ? data.message || dict.successSaved : String(data.message || dict.connectionError));
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
      title={dict.navWaiting}
      description={dict.waitingQueue}
    >
      {msg ? <div className="alert-success">{msg}</div> : null}
      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>{dict.waitingQueue}</h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {entries.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{dict.patient}</th>
                  <th>{dict.doctor}</th>
                  <th>{dict.status}</th>
                  <th>min</th>
                  <th>{dict.actions}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {e.appointmentNumber || "—"}
                      {e.urgency ? " ⚠" : ""}
                    </td>
                    <td>{e.patientName || "—"}</td>
                    <td>{e.doctorName || "—"}</td>
                    <td>
                      <span className="badge">{e.status}</span>
                    </td>
                    <td>{e.waitingMinutes}</td>
                    <td>
                      <div className="toolbar">
                        {e.status !== "WAITING" ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            disabled={!!busy}
                            onClick={() => void act(e.id, "WAITING")}
                          >
                            {dict.navWaiting}
                          </button>
                        ) : null}
                        {e.status !== "WITH_DOCTOR" ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!!busy}
                            onClick={() => void act(e.id, "WITH_DOCTOR")}
                          >
                            {dict.startConsult}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={!!busy}
                          onClick={() => void act(e.id, "SESSION_DONE")}
                        >
                          {dict.complete}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={!!busy}
                          onClick={() => void act(e.id, "LEFT")}
                        >
                          {dict.noShow}
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
    </DashboardShell>
  );
}
