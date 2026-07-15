"use client";

import { useState } from "react";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type Res = {
  files: Array<{
    id: string;
    title: string;
    description?: string;
    mimeType: string;
    allowDownload: boolean;
    createdAt?: string;
  }>;
};

function Body() {
  const { locale, reloadKey } = usePatientPortal();
  const [active, setActive] = useState<string | null>(null);
  const { data, error, loading, reload } = usePatientFetch<Res>(
    "/api/patient/files",
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const files = data?.files || [];
  if (!files.length) {
    return (
      <EmptyState>
        لا توجد صور أو تقارير طبية مشتركة معك حاليًا.
      </EmptyState>
    );
  }

  return (
    <div className="patient-module">
      <ul className="patient-card-list">
        {files.map((f) => (
          <li key={f.id} className="card-surface patient-card">
            <div>
              <strong>{f.title}</strong>
              {f.description ? <p className="muted">{f.description}</p> : null}
              {f.createdAt ? (
                <p className="muted">
                  {new Date(f.createdAt).toLocaleString(locale)}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActive(f.id)}
            >
              عرض
            </button>
          </li>
        ))}
      </ul>
      {active ? (
        <div
          className="patient-file-viewer card-surface"
          role="dialog"
          aria-modal="true"
          aria-label="عرض الملف"
        >
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setActive(null)}
            aria-label="إغلاق"
          >
            إغلاق
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/patient/files/${active}`}
            alt="معاينة الملف الطبي"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage
      title="صوري وتقاريري"
      description="الملفات الطبية المشتركة معك بشكل آمن."
    >
      <Body />
    </PatientPortalPage>
  );
}
