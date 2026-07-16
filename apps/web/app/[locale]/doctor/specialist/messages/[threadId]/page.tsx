"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardShell } from "../../../../../../components/layout/DashboardShell";
import { useDashboardSession } from "../../../../../../lib/use-dashboard-session";

type ThreadRes = {
  thread: {
    id: string;
    status: string;
    patientName?: string;
    patientNumber?: string;
    appointmentReference?: string;
  };
  messages: Array<{
    id: string;
    senderRole: string;
    message: string;
    createdAt?: string;
  }>;
};

export default function DoctorMessageThreadPage() {
  const params = useParams();
  const threadId = String(params?.threadId || "");
  const { locale, dict, user, loading, error } = useDashboardSession({
    roles: ["DOCTOR_SPECIALIST", "DOCTOR_GENERAL"],
  });
  const [data, setData] = useState<ThreadRes | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    if (!threadId) return;
    setBusy(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/doctor/messages/${encodeURIComponent(threadId)}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setLoadError("تعذر تحميل المحادثة.");
        setData(null);
        return;
      }
      const json = await res.json();
      setData({
        thread: json.thread,
        messages: Array.isArray(json.messages) ? json.messages : [],
      });
    } catch {
      setLoadError("تعذر الاتصال بالخادم.");
    } finally {
      setBusy(false);
    }
  }, [threadId]);

  useEffect(() => {
    if (user) void load();
  }, [load, user]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    if (!threadId || !text.trim()) return;
    setSending(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/doctor/messages/${encodeURIComponent(threadId)}/reply`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim() }),
        },
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(json.message || "تعذر الإرسال");
        return;
      }
      setText("");
      await load();
    } catch {
      setActionError("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  }

  async function onClose() {
    if (!threadId) return;
    setSending(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/doctor/messages/${encodeURIComponent(threadId)}/close`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setActionError(json.message || "تعذر إغلاق المحادثة");
        return;
      }
      await load();
    } catch {
      setActionError("تعذر الاتصال بالخادم");
    } finally {
      setSending(false);
    }
  }

  if (loading || !user) {
    return <main className="dash-panel">{dict.loading}</main>;
  }
  if (error) {
    return <main className="dash-panel alert-error">{error}</main>;
  }

  const closed = data
    ? ["closed", "archived"].includes(data.thread.status)
    : false;

  return (
    <DashboardShell
      locale={locale}
      dict={dict}
      role={user.role}
      userName={user.fullName}
      title={data?.thread.patientName || "محادثة مريض"}
      description="رد آمن على رسائل ما بعد الزيارة المكتملة."
      initialAdminMode={
        user.adminDashboardMode === "full" ? "full" : "quick"
      }
    >
      <div className="toolbar">
        <Link
          className="btn btn-outline"
          href={`/${locale}/doctor/specialist/messages`}
        >
          كل المحادثات
        </Link>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void load()}
          disabled={busy}
        >
          {dict.refresh}
        </button>
        {data && !closed ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void onClose()}
            disabled={sending}
          >
            إغلاق المحادثة
          </button>
        ) : null}
      </div>

      {loadError ? <p className="alert-error">{loadError}</p> : null}
      {actionError ? <p className="alert-error">{actionError}</p> : null}

      {data ? (
        <>
          <p className="muted">
            {data.thread.patientNumber ? `${data.thread.patientNumber} · ` : ""}
            الموعد: {data.thread.appointmentReference || "—"} ·{" "}
            {data.thread.status}
          </p>
          <ul className="message-list" style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.65rem" }}>
            {data.messages.map((m) => (
              <li
                key={m.id}
                className="card-surface"
                style={{ padding: "0.75rem 1rem" }}
                data-role={m.senderRole}
              >
                <span className="muted">
                  {m.senderRole === "PATIENT" ? "المريض" : "أنت"}
                </span>
                <p style={{ margin: "0.35rem 0" }}>{m.message}</p>
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
            <form onSubmit={onSend} className="card-surface" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
              <label htmlFor="doctor-msg">ردك</label>
              <textarea
                id="doctor-msg"
                className="input"
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                maxLength={4000}
              />
              <button className="btn btn-primary" type="submit" disabled={sending}>
                {sending ? dict.loading : "إرسال"}
              </button>
            </form>
          )}
        </>
      ) : null}
    </DashboardShell>
  );
}
