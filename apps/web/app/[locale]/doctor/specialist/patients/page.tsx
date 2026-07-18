"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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

type ApptRow = {
  id: string;
  patientId?: string;
  patientName?: string;
  status: string;
  startAt: string;
};

type PatientDetail = PatientRow & {
  gender?: string;
  address?: string;
  notes?: string;
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Spec §8.3 / §10.2 — specialist patients board (Quick mode).
 * Uses Nest `GET /api/patients` + today's appointments (no Prisma).
 */
export default function SpecialistPatientsPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PatientRow[]>([]);
  const [todayAppts, setTodayAppts] = useState<ApptRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("pageSize", "50");
      const date = todayISO();
      const [patientsRes, apptsRes] = await Promise.all([
        fetch(`/api/patients?${params}`, { credentials: "include" }),
        fetch(
          `/api/appointments?date=${encodeURIComponent(date)}&pageSize=50`,
          { credentials: "include" },
        ),
      ]);
      if (!patientsRes.ok) {
        setLoadError("تعذر تحميل قائمة المرضى.");
        setRows([]);
        setTodayAppts([]);
        return;
      }
      const patientsData = await patientsRes.json();
      setRows(Array.isArray(patientsData.patients) ? patientsData.patients : []);

      if (apptsRes.ok) {
        const apptsData = await apptsRes.json();
        setTodayAppts(
          Array.isArray(apptsData.appointments) ? apptsData.appointments : [],
        );
      } else {
        setTodayAppts([]);
      }
    } catch {
      setLoadError("تعذر الاتصال بالخادم.");
      setRows([]);
      setTodayAppts([]);
    } finally {
      setBusy(false);
    }
  }, [q]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  const todayPatientIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of todayAppts) {
      if (a.patientId) ids.add(a.patientId);
    }
    return ids;
  }, [todayAppts]);

  const apptsByPatient = useMemo(() => {
    const map = new Map<string, ApptRow[]>();
    for (const a of todayAppts) {
      if (!a.patientId) continue;
      const list = map.get(a.patientId) || [];
      list.push(a);
      map.set(a.patientId, list);
    }
    return map;
  }, [todayAppts]);

  const visiblePatients = useMemo(() => {
    const byId = new Map(rows.map((p) => [p.id, p]));
    const ordered: PatientRow[] = [];
    const seen = new Set<string>();

    for (const a of todayAppts) {
      if (!a.patientId || seen.has(a.patientId)) continue;
      seen.add(a.patientId);
      const found = byId.get(a.patientId);
      if (found) {
        ordered.push(found);
      } else {
        ordered.push({
          id: a.patientId,
          patientNumber: "—",
          fullName: a.patientName || "مريض",
          phone: "—",
        });
      }
    }

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      return ordered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(needle) ||
          p.phone.includes(needle) ||
          p.patientNumber.toLowerCase().includes(needle),
      );
    }

    if (ordered.length > 0) return ordered;
    return rows;
  }, [rows, todayAppts, q]);

  async function openManage(patientId: string) {
    if (manageId === patientId) {
      setManageId(null);
      setDetail(null);
      setDetailError("");
      return;
    }
    setManageId(patientId);
    setDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setDetailError("تعذر تحميل تفاصيل المريض.");
        return;
      }
      const data = await res.json();
      setDetail(data.patient || null);
    } catch {
      setDetailError("تعذر الاتصال بالخادم.");
    } finally {
      setDetailLoading(false);
    }
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
      title="مرضاي"
      description="قائمة مرضى العيادة المرتبطة بلوحة الأخصائي/المدير."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <div className="card-surface" style={{ padding: "0.85rem 1rem", marginBottom: "0.75rem" }}>
        <strong>مواعيد اليوم: {todayAppts.length}</strong>
        {todayAppts.length > 0 ? (
          <span className="hint" style={{ marginInlineStart: "0.5rem" }}>
            ({todayPatientIds.size} مريض/ة)
          </span>
        ) : null}
      </div>

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

      {busy && !loadError ? (
        <p className="muted">{dict.loading}</p>
      ) : null}

      {!busy && !loadError && visiblePatients.length === 0 ? (
        <p className="muted">
          {todayAppts.length === 0 && !q.trim()
            ? "لا توجد مواعيد اليوم."
            : dict.emptyState}
        </p>
      ) : null}

      {!busy && visiblePatients.length > 0 ? (
        <div className="card-surface" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          {visiblePatients.map((p) => {
            const appts = apptsByPatient.get(p.id) || [];
            const isOpen = manageId === p.id;
            return (
              <article
                key={p.id}
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.65rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <strong>{p.fullName}</strong>
                    <div className="hint">
                      {p.patientNumber} · {p.phone}
                      {p.city ? ` · ${p.city}` : ""}
                    </div>
                    {appts.length > 0 ? (
                      <div className="hint" style={{ marginTop: "0.25rem" }}>
                        {appts.length} موعد/مواعيد اليوم
                        {appts[0]?.startAt
                          ? ` · ${new Date(appts[0].startAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}`
                          : ""}
                      </div>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => void openManage(p.id)}
                  >
                    {isOpen ? "إغلاق" : "إدارة"}
                  </button>
                </div>

                {isOpen ? (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      display: "grid",
                      gap: "0.65rem",
                      padding: "0.75rem",
                      background: "var(--surface-muted, #f8fbfa)",
                      borderRadius: "0.5rem",
                    }}
                  >
                    {detailLoading ? (
                      <p className="hint">{dict.loading}</p>
                    ) : detailError ? (
                      <div className="alert-error">{detailError}</div>
                    ) : detail ? (
                      <dl className="exam-meta">
                        <div>
                          <dt>الاسم</dt>
                          <dd>{detail.fullName}</dd>
                        </div>
                        <div>
                          <dt>الهاتف</dt>
                          <dd dir="ltr">{detail.phone}</dd>
                        </div>
                        <div>
                          <dt>رقم المريض</dt>
                          <dd>{detail.patientNumber}</dd>
                        </div>
                        {detail.email ? (
                          <div>
                            <dt>البريد</dt>
                            <dd dir="ltr">{detail.email}</dd>
                          </div>
                        ) : null}
                        {detail.city ? (
                          <div>
                            <dt>المدينة</dt>
                            <dd>{detail.city}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : (
                      <p className="hint">{p.fullName}</p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      <Link
                        className="btn btn-outline"
                        href={`/${locale}/secretary/patients`}
                      >
                        ملف المريض
                      </Link>
                      <Link
                        className="btn btn-outline"
                        href={`/${locale}/secretary/appointments`}
                      >
                        المواعيد
                      </Link>
                      <Link
                        className="btn btn-outline"
                        href={`/${locale}/secretary/directed`}
                      >
                        الطابور
                      </Link>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </DashboardShell>
  );
}
