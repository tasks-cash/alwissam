"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type ThreadRow = {
  id: string;
  status: string;
  patientName?: string;
  patientNumber?: string;
  doctorUnreadCount?: number;
  lastMessageAt?: string;
};

/**
 * Full-mode Nest extra: doctor inbox for completed-visit patient messaging.
 * Spec patient↔doctor messaging had patient UI only; Nest API now has doctor side.
 */
export default function DoctorMessagesPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  });
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setLoadError("");
    try {
      const res = await fetch("/api/doctor/messages", { credentials: "include" });
      if (!res.ok) {
        setLoadError("تعذر تحميل المحادثات.");
        setThreads([]);
        return;
      }
      const data = await res.json();
      setThreads(Array.isArray(data.threads) ? data.threads : []);
    } catch {
      setLoadError("تعذر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
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
      title="رسائل المرضى"
      description="محادثات مرتبطة بزيارات مكتملة فقط."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <div className="toolbar">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void load()}
          disabled={busy}
        >
          {dict.refresh}
        </button>
      </div>

      {loadError ? (
        <div className="alert-error">
          <span>{loadError}</span>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
      ) : null}

      {threads.length === 0 && !busy && !loadError ? (
        <p className="muted">{dict.emptyState}</p>
      ) : (
        <ul className="patient-card-list" style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
          {threads.map((t) => (
            <li key={t.id} className="card-surface" style={{ padding: "1rem", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
              <div>
                <strong>{t.patientName || "مريض"}</strong>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                  {t.patientNumber ? `${t.patientNumber} · ` : ""}
                  {t.status}
                  {t.doctorUnreadCount
                    ? ` · غير مقروء: ${t.doctorUnreadCount}`
                    : ""}
                </p>
                {t.lastMessageAt ? (
                  <p className="muted" style={{ margin: "0.15rem 0 0" }}>
                    {new Date(t.lastMessageAt).toLocaleString(locale)}
                  </p>
                ) : null}
              </div>
              <Link
                className="btn btn-outline"
                href={`/${locale}/doctor/specialist/messages/${t.id}`}
              >
                فتح
              </Link>
            </li>
          ))}
        </ul>
      )}
    </DashboardShell>
  );
}
