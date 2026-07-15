"use client";

import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type Log = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  actorName?: string;
  roleCode?: string;
  createdAt?: string;
};

export default function AuditLogsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [logs, setLogs] = useState<Log[]>([]);
  const [total, setTotal] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/audit-logs?pageSize=50", {
      credentials: "include",
    });
    if (!res.ok) return;
    const data = await res.json();
    setLogs(Array.isArray(data.logs) ? data.logs : []);
    setTotal(Number(data.total) || 0);
  }, []);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

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
      title={dict.navAuditLogs}
      description={dict.recentActivity}
    >
      <section className="card-surface dash-actions">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>
            {dict.navAuditLogs} ({total})
          </h2>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
        {logs.length === 0 ? (
          <p className="muted">{dict.emptyState}</p>
        ) : (
          <div className="activity-list">
            {logs.map((l) => (
              <div key={l.id} className="activity-item">
                <strong>
                  {l.actorName || "—"} · {l.action}
                </strong>
                <span className="muted">
                  {l.entityType}
                  {l.entityId ? ` #${String(l.entityId).slice(-6)}` : ""} ·{" "}
                  {l.roleCode || ""} ·{" "}
                  {l.createdAt
                    ? new Date(l.createdAt).toLocaleString(locale)
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
