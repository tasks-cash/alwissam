"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../../../lib/use-dashboard-session";

type LogRow = {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  actorName?: string;
  roleCode?: string;
  createdAt?: string;
};

/**
 * Spec §9.1 — staff activity viewer for a staff userId (Quick mode).
 * Backed by Nest `GET /api/admin/audit-logs?userId=`.
 */
export default function StaffActivityPage() {
  const params = useParams();
  const userId = String(params?.userId || "");
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [staffName, setStaffName] = useState("");
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setBusy(true);
    setLoadError("");
    try {
      const res = await fetch(
        `/api/admin/audit-logs?userId=${encodeURIComponent(userId)}&pageSize=50`,
        { credentials: "include" },
      );
      if (!res.ok) {
        setLoadError("تعذر تحميل نشاط الموظف.");
        setLogs([]);
        return;
      }
      const data = await res.json();
      const rows: LogRow[] = Array.isArray(data.logs) ? data.logs : [];
      setLogs(rows);
      setTotal(Number(data.total) || 0);
      setStaffName(rows[0]?.actorName || userId.slice(-6));
    } catch {
      setLoadError("تعذر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }, [userId]);

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
      title={`نشاط الموظف · ${staffName}`}
      description="سجل تدقيق الإجراءات المرتبطة بهذا الحساب."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <div className="toolbar">
        <Link className="btn btn-outline" href={`/${locale}/doctor/specialist/audit-logs`}>
          كل سجلات التدقيق
        </Link>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={busy}>
          {dict.refresh}
        </button>
      </div>

      {loadError ? <p className="alert-error">{loadError}</p> : null}
      <p className="muted">
        {dict.total}: {total}
      </p>

      {logs.length === 0 && !busy && !loadError ? (
        <p className="muted">{dict.emptyState}</p>
      ) : (
        <div className="activity-list">
          {logs.map((a) => (
            <div key={a.id} className="activity-item card-surface" style={{ padding: "0.75rem 1rem" }}>
              <strong>
                {a.actorName || "—"} · {a.action}
              </strong>
              <span className="muted">
                {a.entityType || ""}
                {a.entityId ? ` #${String(a.entityId).slice(-6)}` : ""} ·{" "}
                {a.createdAt
                  ? new Date(a.createdAt).toLocaleString(locale)
                  : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
