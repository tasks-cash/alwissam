"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type Res = {
  appointments: Array<{
    reference: string;
    status: string;
    startAt: string;
    doctorName?: string;
    appointmentType: string;
  }>;
  bookingRequests: Array<{
    reference: string;
    status: string;
    reason: string;
    preferredDate?: string;
  }>;
};

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "upcoming", label: "القادمة" },
  { id: "pending", label: "في انتظار التأكيد" },
  { id: "pending_reception", label: "في انتظار تعيين الطبيب" },
  { id: "confirmed", label: "المؤكدة" },
  { id: "completed", label: "المكتملة" },
  { id: "cancelled", label: "الملغاة" },
  { id: "rescheduled", label: "المعاد جدولتها" },
] as const;

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const [status, setStatus] = useState("all");
  const url = useMemo(
    () =>
      status === "all"
        ? "/api/patient/appointments"
        : `/api/patient/appointments?status=${encodeURIComponent(status)}`,
    [status],
  );
  const { data, error, loading, reload } = usePatientFetch<Res>(url, reloadKey);
  if (loading) return <SkeletonBlock />;
  if (error) return <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />;
  const appointments = data?.appointments || [];
  const requests = data?.bookingRequests || [];
  return (
    <div className="patient-module">
      <div className="patient-filters" role="tablist" aria-label="تصفية المواعيد">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={status === f.id}
            className={status === f.id ? "btn btn-primary" : "btn btn-outline"}
            onClick={() => setStatus(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {appointments.length === 0 ? (
        <EmptyState>لا توجد مواعيد مسجلة في حسابك حاليًا.</EmptyState>
      ) : (
        <ul className="patient-card-list">
          {appointments.map((a) => (
            <li key={a.reference} className="card-surface patient-card">
              <div>
                <strong>{a.reference}</strong>
                <p className="muted">{a.doctorName || "—"} · {a.appointmentType} · {a.status}</p>
                <p>{new Date(a.startAt).toLocaleString(locale)}</p>
              </div>
              <Link className="btn btn-outline" href={`/${locale}/patient/appointments/${a.reference}`}>
                التفاصيل
              </Link>
            </li>
          ))}
        </ul>
      )}
      {requests.length > 0 ? (
        <section className="card-surface dash-actions">
          <h2>طلبات الحجز عبر الموقع</h2>
          <ul>
            {requests.map((r) => (
              <li key={r.reference}>
                <strong>{r.reference}</strong> — {r.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="مواعيدي" description="تتبع حالة جميع مواعيدك وطلبات الحجز.">
      <Body />
    </PatientPortalPage>
  );
}
