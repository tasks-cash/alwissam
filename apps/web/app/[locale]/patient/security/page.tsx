"use client";

import { FormEvent, useState } from "react";
import { PASSWORD_MIN_CREATE, changePasswordSchema } from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import {
  EmptyState,
  ErrorRetry,
  PatientPortalPage,
  SkeletonBlock,
  usePatientFetch,
  usePatientPortal,
} from "../../../../components/patient/PatientPortalPage";

type SessionsRes = {
  sessions: Array<{
    id: string;
    createdAt?: string;
    userAgent?: string;
    ip?: string;
  }>;
};

function Body() {
  const { reloadKey, bump } = usePatientPortal();
  const [currentPassword, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const { data, error, loading, reload } = usePatientFetch<SessionsRes>(
    "/api/patient/sessions",
    reloadKey,
  );

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setMsg(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, password, confirmPassword }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setCurrent("");
      setPassword("");
      setConfirm("");
    }
    setMsg(json.message || (res.ok ? "تم التحديث" : "تعذر التحديث"));
  }

  async function revoke(id: string) {
    await fetch(`/api/patient/sessions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    bump();
  }

  async function logoutAll() {
    await fetch("/api/patient/logout-all", {
      method: "POST",
      credentials: "include",
    });
    bump();
  }

  return (
    <div className="patient-module">
      <form
        onSubmit={onChangePassword}
        className="card-surface patient-auth-form"
        style={{ maxWidth: 520 }}
      >
        <h2>تغيير كلمة المرور</h2>
        <div className="field">
          <label htmlFor="currentPassword">كلمة المرور الحالية</label>
          <PasswordField
            id="currentPassword"
            value={currentPassword}
            onChange={setCurrent}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </div>
        <div className="field">
          <label htmlFor="password">كلمة المرور الجديدة</label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
          />
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirm}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          تحديث كلمة المرور
        </button>
        {msg ? <p role="status">{msg}</p> : null}
      </form>
      <section className="card-surface dash-actions">
        <h2>الجلسات النشطة</h2>
        {loading ? (
          <SkeletonBlock />
        ) : error ? (
          <ErrorRetry message={error} onRetry={reload} label="إعادة" />
        ) : (data?.sessions || []).length === 0 ? (
          <EmptyState>لا توجد جلسات.</EmptyState>
        ) : (
          <ul className="patient-card-list">
            {(data?.sessions || []).map((s) => (
              <li key={s.id} className="patient-card">
                <div>
                  <p className="muted">{s.userAgent || "جهاز"}</p>
                  {s.createdAt ? (
                    <p className="muted">
                      {new Date(s.createdAt).toLocaleString()}
                    </p>
                  ) : null}
                  <p className="muted" dir="ltr">
                    {s.ip}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => void revoke(s.id)}
                >
                  إنهاء
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => void logoutAll()}
        >
          تسجيل الخروج من جميع الأجهزة
        </button>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <PatientPortalPage title="الأمان وكلمة المرور">
      <Body />
    </PatientPortalPage>
  );
}
