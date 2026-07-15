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
  motivation: string[];
  followUps: Array<{
    id: string;
    reason: string;
    status: string;
    recommendedFrom?: string;
    recommendedTo?: string;
    patientInstructions?: string;
  }>;
};

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/follow-up",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const followUps = data?.followUps || [];

  return (
    <div className="patient-module">
      <ul className="patient-motivation">
        {(data?.motivation || []).map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      {followUps.length === 0 ? (
        <EmptyState>
          لا توجد توصيات متابعة معتمدة من الطبيب حاليًا.
        </EmptyState>
      ) : (
        <ul className="patient-card-list">
          {followUps.map((f) => (
            <li key={f.id} className="card-surface">
              <strong>{f.reason}</strong>
              <p className="muted">{f.status}</p>
              {f.recommendedFrom && f.recommendedTo ? (
                <p className="muted">
                  الفترة المقترحة:{" "}
                  {new Date(f.recommendedFrom).toLocaleDateString(locale)} —{" "}
                  {new Date(f.recommendedTo).toLocaleDateString(locale)}
                </p>
              ) : null}
              {f.patientInstructions ? <p>{f.patientInstructions}</p> : null}
              <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
                حجز متابعة
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="تابع زياراتك واهتم بصحة أسنانك"
      description="متابعة مبنية على توصيات الطبيب فقط، دون وعود بنتائج مضمونة."
    >
      <Body />
    </PatientPortalPage>
  );
}
