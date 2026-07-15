"use client";

import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type Res = {
  disclaimer: string;
  instructions: Array<{
    id: string;
    title: string;
    body: string;
    instructionType: string;
    followUpDate?: string;
  }>;
};

function Body() {
  const { reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/instructions",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const instructions = data?.instructions || [];

  return (
    <div className="patient-module">
      <p className="alert-error" role="note">
        {data?.disclaimer}
      </p>
      {instructions.length === 0 ? (
        <EmptyState>لا توجد تعليمات معتمدة للعرض حاليًا.</EmptyState>
      ) : (
        <ul className="patient-card-list">
          {instructions.map((i) => (
            <li key={i.id} className="card-surface">
              <h2>{i.title}</h2>
              <p className="muted">{i.instructionType}</p>
              <p>{i.body}</p>
              {i.followUpDate ? (
                <p className="muted">
                  موعد المتابعة: {new Date(i.followUpDate).toLocaleDateString()}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="تعليمات الطبيب">
      <Body />
    </PatientPortalPage>
  );
}
