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
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    relatedRoute?: string;
    isRead: boolean;
    createdAt?: string;
  }>;
};

function Body() {
  const { locale, reloadKey, bump } = usePatientPortal();
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/notifications",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const rows = data?.notifications || [];

  async function markAll() {
    await fetch("/api/patient/notifications/read-all", {
      method: "PATCH",
      credentials: "include",
    });
    bump();
  }

  return (
    <div className="patient-module">
      {rows.some((n) => !n.isRead) ? (
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void markAll()}
        >
          تعليم الكل كمقروء
        </button>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState>لا توجد إشعارات.</EmptyState>
      ) : (
        <ul className="patient-card-list">
          {rows.map((n) => (
            <li key={n.id} className="card-surface" data-unread={!n.isRead}>
              <strong>{n.title}</strong>
              <p>{n.message}</p>
              {n.createdAt ? (
                <p className="muted">
                  {new Date(n.createdAt).toLocaleString(locale)}
                </p>
              ) : null}
              {n.relatedRoute ? (
                <Link href={`/${locale}${n.relatedRoute}`}>عرض</Link>
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
    <PatientPortalPage title="الإشعارات">
      <Body />
    </PatientPortalPage>
  );
}
