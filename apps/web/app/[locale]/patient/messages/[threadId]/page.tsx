"use client";

import { FormEvent, useState } from "react";
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
  disclaimer: string;
  emergency: string;
  thread: {
    id: string;
    status: string;
    doctorName?: string;
    appointmentReference?: string;
  };
  messages: Array<{
    id: string;
    senderRole: string;
    message: string;
    createdAt?: string;
  }>;
};

function Body() {
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId;
  const { locale, reloadKey, bump } = usePatientPortal();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const { data, error, loading, reload } = usePatientFetch<Res>(
    threadId ? `/api/patient/messages/${threadId}` : null,
    reloadKey,
  );

  if (loading) return <SkeletonBlock />;
  if (error) {
    return (
      <ErrorRetry message={error} onRetry={reload} label="إعادة المحاولة" />
    );
  }
  if (!data?.thread) return <EmptyState>المحادثة غير موجودة.</EmptyState>;

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!threadId) return;
    setSending(true);
    setErr("");
    try {
      const res = await fetch(`/api/patient/messages/${threadId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.message || "تعذر الإرسال");
        return;
      }
      setText("");
      bump();
    } catch {
      setErr("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  }

  const closed = ["closed", "archived"].includes(data.thread.status);

  return (
    <div className="patient-module patient-messages">
      <p role="note">{data.disclaimer}</p>
      <p className="alert-error">{data.emergency}</p>
      <p className="muted">
        الموعد: {data.thread.appointmentReference || "—"} ·{" "}
        {data.thread.doctorName || "الطبيب"} · {data.thread.status}
      </p>
      <ul className="message-list">
        {data.messages.map((m) => (
          <li key={m.id} data-role={m.senderRole} className="message-bubble">
            <span className="muted">
              {m.senderRole === "PATIENT" ? "أنت" : "الطبيب"}
            </span>
            <p>{m.message}</p>
            {m.createdAt ? (
              <span className="muted">
                {new Date(m.createdAt).toLocaleString(locale)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      {closed ? (
        <p className="muted">المحادثة مغلقة.</p>
      ) : (
        <form onSubmit={onSend} className="message-compose">
          <label htmlFor="msg">رسالتك</label>
          <textarea
            id="msg"
            className="input"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            maxLength={4000}
          />
          {err ? <div className="alert-error">{err}</div> : null}
          <button className="btn btn-primary" type="submit" disabled={sending}>
            {sending ? "جارٍ الإرسال..." : "إرسال"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="محادثة مع الطبيب">
      <Body />
    </PatientPortalPage>
  );
}
