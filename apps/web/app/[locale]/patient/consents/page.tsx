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
  consents: Array<{
    id: string;
    consentType: string;
    accepted: boolean;
    acceptedAt?: string;
    required: boolean;
  }>;
};

const CONSENT_AR: Record<string, string> = {
  terms: "الشروط والأحكام",
  privacy: "سياسة الخصوصية",
  messaging: "المراسلة الطبية",
  data_processing: "معالجة البيانات",
};

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/consents",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const rows = data?.consents || [];
  if (!rows.length) {
    return (
      <EmptyState>
        لا توجد سجلات موافقات بعد. تُسجَّل عند التسجيل والعمليات ذات الصلة.
      </EmptyState>
    );
  }

  return (
    <ul className="patient-card-list">
      {rows.map((c) => (
        <li key={c.id} className="card-surface">
          <strong>{CONSENT_AR[c.consentType] || c.consentType}</strong>
          <p>
            {c.accepted ? "مقبولة" : "غير مقبولة"}
            {c.required ? " (مطلوبة)" : ""}
          </p>
          {c.acceptedAt ? (
            <p className="muted">
              {new Date(c.acceptedAt).toLocaleString(locale)}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="الموافقات">
      <Body />
    </PatientPortalPage>
  );
}
