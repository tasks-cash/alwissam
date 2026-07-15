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
  disclaimer: string;
  emergency: string;
  threads: Array<{
    id: string;
    status: string;
    doctorName?: string;
    patientUnreadCount: number;
    lastMessageAt?: string;
  }>;
};

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/messages",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const threads = data?.threads || [];

  return (
    <div className="patient-module">
      <p role="note">{data?.disclaimer}</p>
      <p className="alert-error" role="alert">
        {data?.emergency}
      </p>
      {threads.length === 0 ? (
        <EmptyState>
          يمكنك التواصل مع الطبيب بعد اكتمال زيارة مرتبطة بحسابك.
        </EmptyState>
      ) : (
        <ul className="patient-card-list">
          {threads.map((t) => (
            <li key={t.id} className="card-surface patient-card">
              <div>
                <strong>{t.doctorName || "الطبيب"}</strong>
                <p className="muted">
                  {t.status} · غير مقروء: {t.patientUnreadCount}
                </p>
                {t.lastMessageAt ? (
                  <p className="muted">
                    {new Date(t.lastMessageAt).toLocaleString(locale)}
                  </p>
                ) : null}
              </div>
              <Link
                className="btn btn-outline"
                href={`/${locale}/patient/messages/${t.id}`}
              >
                فتح
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
      title="الرسائل"
      description="التواصل الآمن بخصوص الزيارات المكتملة فقط."
    >
      <Body />
    </PatientPortalPage>
  );
}
