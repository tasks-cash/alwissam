"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../../components/patient/PatientPortalPage";

type Detail = {
  appointment: {
    reference: string;
    status: string;
    startAt: string;
    endAt: string;
    doctorName?: string;
    appointmentType: string;
    cancelReason?: string;
    messagingEligible: boolean;
    timeline: Array<{ key: string; labelAr: string; done: boolean }>;
    files: Array<{ id: string; title: string }>;
    instructions: Array<{ id: string; title: string; body: string }>;
  };
};

function Body() {
  const params = useParams<{ reference: string }>();
  const reference = params?.reference ?? "";
  const { locale, reloadKey, bump } = usePatientPortal();
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const { data, error, loading, reload } = usePatientFetch<Detail>(
    reference
      ? `/api/patient/appointments/${encodeURIComponent(reference)}`
      : null,
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }

  const a = data?.appointment;
  if (!a) return <EmptyState>الموعد غير موجود.</EmptyState>;

  async function postAction(path: string, body: Record<string, string>) {
    setBusy(true);
    setActionMsg("");
    try {
      const res = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionMsg(json.message || "تعذر تنفيذ الإجراء");
        return;
      }
      if (json.threadId) {
        window.location.href = `/${locale}/patient/messages/${json.threadId}`;
        return;
      }
      setActionMsg(json.message || "تم بنجاح");
      bump();
    } catch {
      setActionMsg("تعذر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  }

  const canModify = ![
    "COMPLETED",
    "CANCELLED_BY_PATIENT",
    "CANCELLED_BY_CLINIC",
  ].includes(a.status);

  return (
    <div className="patient-module">
      <section className="card-surface dash-actions">
        <p>
          <strong>المرجع:</strong> {a.reference}
        </p>
        <p>
          <strong>الحالة:</strong> {a.status}
        </p>
        <p>
          <strong>الطبيب:</strong> {a.doctorName || "—"}
        </p>
        <p>
          <strong>النوع:</strong> {a.appointmentType}
        </p>
        <p>
          <strong>الوقت:</strong> {new Date(a.startAt).toLocaleString(locale)}
        </p>
        {a.cancelReason ? (
          <p>
            <strong>سبب الإلغاء:</strong> {a.cancelReason}
          </p>
        ) : null}
      </section>

      <section className="card-surface dash-actions">
        <h2>خط الحالة</h2>
        <ol className="patient-timeline">
          {a.timeline.map((s) => (
            <li key={s.key} data-done={s.done}>
              {s.labelAr}
            </li>
          ))}
        </ol>
      </section>

      {a.instructions.length > 0 ? (
        <section className="card-surface dash-actions">
          <h2>تعليمات الطبيب</h2>
          {a.instructions.map((i) => (
            <article key={i.id}>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      {a.files.length > 0 ? (
        <section className="card-surface dash-actions">
          <h2>ملفات مرتبطة</h2>
          <ul>
            {a.files.map((f) => (
              <li key={f.id}>
                <Link href={`/${locale}/patient/files?file=${f.id}`}>
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="patient-quick-actions">
        {canModify ? (
          <>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() =>
                void postAction(
                  `/api/patient/appointments/${encodeURIComponent(reference)}/modification-request`,
                  { note: "طلب تعديل من بوابة المريض" },
                )
              }
            >
              طلب تعديل
            </button>
            <button
              type="button"
              className="btn btn-outline"
              disabled={busy}
              onClick={() =>
                void postAction(
                  `/api/patient/appointments/${encodeURIComponent(reference)}/cancellation-request`,
                  { reason: "طلب إلغاء من بوابة المريض" },
                )
              }
            >
              طلب إلغاء
            </button>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              التواصل مع الاستقبال
            </Link>
          </>
        ) : null}
        {a.messagingEligible ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() =>
              void postAction(
                `/api/patient/appointments/${encodeURIComponent(reference)}/message-thread`,
                {},
              )
            }
          >
            التواصل مع الطبيب بخصوص هذه الزيارة
          </button>
        ) : null}
        {a.status === "COMPLETED" ? (
          <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
            حجز متابعة
          </Link>
        ) : null}
        {["CANCELLED_BY_PATIENT", "CANCELLED_BY_CLINIC"].includes(a.status) ? (
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            حجز موعد آخر
          </Link>
        ) : null}
      </section>
      {actionMsg ? (
        <p className="muted" role="status">
          {actionMsg}
        </p>
      ) : null}
    </div>
  );
}

export default function Page() {
  const params = useParams<{ reference: string }>();
  const reference = params?.reference ?? "";

  return (
    <PatientPortalPage title={`موعد ${reference}`}>
      <Body />
    </PatientPortalPage>
  );
}
