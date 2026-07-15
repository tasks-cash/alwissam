"use client";

import Link from "next/link";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type Res = {
  cases: Array<{
    id: string;
    title: string;
    status: string;
    doctorName?: string;
    patientVisibleSummary?: string;
    updatedAt?: string;
  }>;
};

const STATUS_AR: Record<string, string> = {
  new: "حالة جديدة",
  under_evaluation: "قيد التقييم",
  treatment_planned: "تم إعداد خطة العلاج",
  treatment_in_progress: "العلاج جارٍ",
  follow_up: "متابعة",
  completed: "مكتملة",
  closed: "مغلقة",
};

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/medical-cases",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const rows = data?.cases || [];
  if (!rows.length) {
    return (
      <EmptyState>لا توجد حالات علاجية متاحة للعرض حاليًا.</EmptyState>
    );
  }

  return (
    <ul className="patient-card-list">
      {rows.map((c) => (
        <li key={c.id} className="card-surface patient-card">
          <div>
            <strong>{c.title}</strong>
            <p className="muted">
              {STATUS_AR[c.status] || c.status} · {c.doctorName || "—"}
            </p>
            {c.patientVisibleSummary ? <p>{c.patientVisibleSummary}</p> : null}
          </div>
          <Link
            className="btn btn-outline"
            href={`/${locale}/patient/medical-cases/${c.id}`}
          >
            التفاصيل
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="حالاتي العلاجية"
      description="الحالات العلاجية المشتركة معك من فريق العيادة."
    >
      <Body />
    </PatientPortalPage>
  );
}
