"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";

type PatientRow = {
  id: string;
  patientNumber: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  createdAt?: string;
};

/**
 * Spec §8.3 / §10.2 — specialist patients board (Quick mode).
 * Uses Nest `GET /api/patients` (no Prisma). Clinical chart/QR tabs remain hidden until Nest APIs exist.
 */
export default function SpecialistPatientsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("pageSize", "50");
      const res = await fetch(`/api/patients?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setLoadError("تعذر تحميل قائمة المرضى.");
        setRows([]);
        return;
      }
      const data = await res.json();
      setRows(Array.isArray(data.patients) ? data.patients : []);
      setTotal(Number(data.total) || 0);
    } catch {
      setLoadError("تعذر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }, [q]);

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
      title="مرضاي"
      description="قائمة مرضى العيادة المرتبطة بلوحة الأخصائي/المدير."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <form
        className="toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={dict.search}
          aria-label={dict.search}
        />
        <button type="submit" className="btn btn-outline" disabled={busy}>
          {busy ? dict.loading : dict.search}
        </button>
        <Link
          className="btn btn-primary"
          href={`/${locale}/secretary/patients`}
        >
          {dict.createPatient}
        </Link>
      </form>

      {loadError ? (
        <div className="alert-error">
          <span>{loadError}</span>
          <button type="button" className="btn btn-outline" onClick={() => void load()}>
            {dict.refresh}
          </button>
        </div>
      ) : null}

      <p className="muted">
        {dict.total}: {total}
      </p>

      {rows.length === 0 && !busy && !loadError ? (
        <p className="muted">{dict.emptyState}</p>
      ) : (
        <div className="card-surface" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          {rows.map((p) => (
            <article
              key={p.id}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "0.65rem",
              }}
            >
              <strong>{p.fullName}</strong>
              <div className="hint">
                {p.patientNumber} · {p.phone}
                {p.city ? ` · ${p.city}` : ""}
                {p.email ? ` · ${p.email}` : ""}
              </div>
            </article>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
