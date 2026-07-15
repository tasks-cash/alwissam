"use client";

import { useParams } from "next/navigation";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../../components/patient/PatientPortalPage";

type Res = {
  medicalCase: {
    title: string;
    status: string;
    doctorName?: string;
    patientVisibleSummary?: string;
    patientVisibleTreatmentPlan?: string;
    patientVisibleInstructions?: string;
    files: Array<{ id: string; title: string }>;
    instructions: Array<{ id: string; title: string; body: string }>;
  };
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
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    id ? `/api/patient/medical-cases/${id}` : null,
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const c = data?.medicalCase;
  if (!c) return <EmptyState>الحالة غير موجودة.</EmptyState>;

  return (
    <div className="patient-module">
      <section className="card-surface dash-actions">
        <h2>{c.title}</h2>
        <p>الحالة: {STATUS_AR[c.status] || c.status}</p>
        <p>الطبيب: {c.doctorName || "—"}</p>
        {c.patientVisibleSummary ? <p>{c.patientVisibleSummary}</p> : null}
        {c.patientVisibleTreatmentPlan ? (
          <>
            <h3>خطة العلاج</h3>
            <p>{c.patientVisibleTreatmentPlan}</p>
          </>
        ) : null}
        {c.patientVisibleInstructions ? (
          <>
            <h3>تعليمات</h3>
            <p>{c.patientVisibleInstructions}</p>
          </>
        ) : null}
      </section>
      {c.instructions?.length ? (
        <section className="card-surface dash-actions">
          <h2>تعليمات مرتبطة</h2>
          {c.instructions.map((i) => (
            <article key={i.id}>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </article>
          ))}
        </section>
      ) : null}
      {c.files?.length ? (
        <section className="card-surface dash-actions">
          <h2>ملفات</h2>
          <ul>
            {c.files.map((f) => (
              <li key={f.id}>{f.title}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="تفاصيل الحالة العلاجية">
      <Body />
    </PatientPortalPage>
  );
}
