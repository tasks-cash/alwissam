"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  DoctorExamPanel,
  type ExamWaitingEntry,
} from "../../../../../components/doctor/DoctorExamPanel";
import { DashboardShell } from "../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../lib/use-dashboard-session";
import type { AdminDashboardMode } from "../../../../../lib/navigation";
import { normalizeAdminDashboardMode } from "../../../../../lib/navigation";

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
  pendingRequests?: number;
  unreadStaffMessages?: number;
  pendingSupportRequests?: number;
  _partialFailures?: string[];
};

type ModuleLink = {
  key: string;
  href: string;
  labelKey: string;
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

const MODULE_AR: Record<string, string> = {
  overview: "نظرة عامة",
  doctors: "إدارة الأطباء",
  secretaries: "إدارة السكرتارية",
  patients: "إدارة المرضى",
  appointments: "إدارة المواعيد",
  queue: "قائمة انتظار اليوم",
  today: "مواعيد العمل اليوم",
  assignment: "طلبات الحجز والتعيين",
  settings: "إعدادات العيادة الأساسية",
  invitations: "دعوات الطاقم",
  secretaryHub: "لوحة الاستقبال",
  generalDoctor: "لوحة الطبيب العام",
  payments: "المدفوعات",
  experiences: "تجارب المرضى",
  beforeAfter: "قبل وبعد",
  specialties: "التخصصات",
  services: "الخدمات",
  faqs: "الأسئلة الشائعة",
  reviews: "المراجعات",
  audit: "سجلات التدقيق",
};

export default function OwnerDashboardPage() {
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["ADMIN", "DOCTOR_SPECIALIST"],
  });
  const [mode, setMode] = useState<AdminDashboardMode>(
    normalizeAdminDashboardMode(user?.adminDashboardMode),
  );
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [modules, setModules] = useState<ModuleLink[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loadError, setLoadError] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [waiting, setWaiting] = useState<ExamWaitingEntry[]>([]);
  const [waitingError, setWaitingError] = useState("");

  useEffect(() => {
    if (!user) return;
    setMode(normalizeAdminDashboardMode(user.adminDashboardMode));
  }, [user]);

  const loadWaiting = useCallback(async () => {
    setWaitingError("");
    try {
      const res = await fetch("/api/waiting-room", { credentials: "include" });
      if (!res.ok) {
        setWaitingError("تعذر تحميل قائمة المعاينة.");
        setWaiting([]);
        return;
      }
      const data = await res.json();
      setWaiting(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setWaitingError("تعذر تحميل قائمة المعاينة.");
    }
  }, []);

  const load = useCallback(async (activeMode: AdminDashboardMode) => {
    setLoadingSummary(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/dashboard/owner?mode=${activeMode}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setLoadError("تعذر تحميل ملخص لوحة التحكم حاليًا.");
        setStats(null);
        return;
      }
      const data = await res.json();
      setStats(data.stats || null);
      setModules(Array.isArray(data.modules) ? data.modules : []);
      setActivity(Array.isArray(data.recentActivity) ? data.recentActivity : []);
      // Mode is owned by shell/preferences — do not overwrite from summary payload.
    } catch {
      setLoadError("تعذر تحميل ملخص لوحة التحكم حاليًا.");
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void load(mode);
      void loadWaiting();
    }
  }, [load, loadWaiting, user, mode]);

  if (loading || !user) {
    return <main className="dash-panel">جارٍ تحميل لوحة التحكم...</main>;
  }

  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  const title =
    mode === "quick" ? "لوحة التحكم السريعة" : "لوحة التحكم الشاملة";
  const description =
    mode === "quick"
      ? "الوصول السريع إلى المميزات الأساسية لإدارة العمل اليومي في العيادة."
      : "إدارة جميع أقسام العيادة والموقع والإعدادات والتقارير من مكان واحد.";

  const quickCards: { label: string; value: number; href: string }[] = stats
    ? [
        {
          label: "مواعيد اليوم",
          value: stats.appointmentsToday,
          href: `/${locale}/secretary/appointments`,
        },
        {
          label: "بانتظار الآن",
          value: stats.waitingNow,
          href: `/${locale}/secretary/directed`,
        },
        {
          label: "قيد العلاج",
          value: stats.inTreatmentNow,
          href: `/${locale}/secretary/directed`,
        },
        {
          label: "زيارات مكتملة اليوم",
          value: stats.appointmentsCompletedToday,
          href: `/${locale}/secretary/today`,
        },
        {
          label: "طلبات حجز معلّقة",
          value: stats.pendingRequests || 0,
          href: `/${locale}/secretary/assignment-queue`,
        },
        {
          label: "أطباء نشطون",
          value: stats.doctorsActive,
          href: `/${locale}/doctor/specialist/doctors`,
        },
        {
          label: "سكرتارية نشطة",
          value: stats.secretariesActive,
          href: `/${locale}/doctor/specialist/secretaries`,
        },
      ]
    : [];

  const fullExtra: { label: string; value: number }[] = stats
    ? [
        { label: dict.patientsTotal, value: stats.patientsTotal },
        { label: dict.patientsToday, value: stats.patientsToday },
        { label: dict.patientsWeek, value: stats.patientsWeek },
        { label: dict.patientsMonth, value: stats.patientsMonth },
        { label: dict.doctorsUnavailable, value: stats.doctorsUnavailable },
        {
          label: dict.appointmentsCancelled,
          value: stats.appointmentsCancelledToday,
        },
        {
          label: dict.appointmentsNoShow,
          value: stats.appointmentsNoShowToday,
        },
      ]
    : [];

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={title}
      description={description}
      initialAdminMode={mode}
      onAdminModeChange={(next) => setMode(next)}
    >
      {loadingSummary ? (
        <p className="muted" aria-busy="true">
          جارٍ تحميل لوحة التحكم...
        </p>
      ) : null}

      {loadError ? (
        <div className="alert-error admin-dash-error">
          <span>{loadError}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void load(mode)}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      {waitingError ? (
        <div className="alert-error admin-dash-error">
          <span>{waitingError}</span>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void loadWaiting()}
          >
            إعادة المحاولة
          </button>
        </div>
      ) : null}

      <section className="card-surface dash-actions" aria-label="المعاينة">
        <div className="toolbar" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>المعاينة — قائمة الانتظار</h2>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void loadWaiting()}
          >
            تحديث
          </button>
        </div>
        {waiting.length === 0 && !waitingError ? (
          <p className="muted">لا يوجد مرضى بانتظار المعاينة حاليًا.</p>
        ) : (
          <div className="exam-queue-list">
            {waiting.map((entry) => (
              <DoctorExamPanel
                key={entry.id}
                entry={entry}
                onDone={() => void loadWaiting()}
              />
            ))}
          </div>
        )}
      </section>

      {stats && !loadError ? (
        <section className="stat-grid" aria-label="ملخص يومي">
          {quickCards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="stat-card card-surface admin-stat-link"
            >
              <span>{c.label}</span>
              <strong>{c.value}</strong>
            </Link>
          ))}
          {mode === "full"
            ? fullExtra.map((c) => (
                <article key={c.label} className="stat-card card-surface">
                  <span>{c.label}</span>
                  <strong>{c.value}</strong>
                </article>
              ))
            : null}
        </section>
      ) : null}

      {!stats && !loadingSummary && !loadError ? (
        <p className="muted">لا توجد بيانات متاحة حاليًا.</p>
      ) : null}

      <section className="card-surface dash-actions">
        <h2>{dict.quickActions}</h2>
        <div className="cta-row toolbar admin-quick-actions">
          <Link
            className="btn btn-primary"
            href={`/${locale}/doctor/specialist/doctors`}
          >
            إضافة طبيب
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctor/specialist/secretaries`}
          >
            إضافة سكرتارية
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/patients`}
          >
            إضافة مريض
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/appointments`}
          >
            إنشاء موعد
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/directed`}
          >
            فتح قائمة الانتظار
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/today`}
          >
            إدارة مواعيد العمل
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctor/specialist/invitations`}
          >
            دعوة طاقم
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/secretary/payments`}
          >
            المدفوعات
          </Link>
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctor/specialist/audit-logs`}
          >
            سجلات التدقيق
          </Link>
          {mode === "full" ? (
            <Link
              className="btn btn-outline"
              href={`/${locale}/doctor/specialist/public-content/specialties`}
            >
              إدارة الموقع
            </Link>
          ) : null}
        </div>
      </section>

      <section className="admin-module-grid" aria-label="وحدات الإدارة">
        {modules.map((m) => (
          <Link
            key={m.key}
            className="admin-module-card card-surface"
            href={`/${locale}${m.href}`}
          >
            <strong>{MODULE_AR[m.key] || (dict as Record<string, string>)[m.labelKey] || m.key}</strong>
            <span className="muted">فتح الوحدة</span>
          </Link>
        ))}
      </section>

      {mode === "full" ? (
        <section className="card-surface dash-actions">
          <div className="toolbar" style={{ justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>{dict.recentActivity}</h2>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void load(mode)}
            >
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
      ) : null}
    </DashboardShell>
  );
}
