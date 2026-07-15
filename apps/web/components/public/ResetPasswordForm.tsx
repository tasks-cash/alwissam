"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  resetPasswordSchema,
  omitConfirmPassword,
} from "@alwisam/shared-validation";
import { PasswordField } from "../ui/PasswordField";
import { apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";

function ResetPasswordFormInner({ locale }: { locale: Locale }) {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const parsed = resetPasswordSchema.safeParse({
      token,
      password,
      confirmPassword,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }

    setLoading(true);
    try {
      const payload = omitConfirmPassword(parsed.data);
      const { ok, data } = await apiPost<{
        ok?: boolean;
        message?: string;
        error?: string;
      }>("/api/auth/reset-password", payload);
      if (!ok) {
        setError(data.error || "فشل تحديث كلمة المرور");
        return;
      }
      setSuccess(data.message || "تم التحديث");
      setTimeout(() => router.push(`/${locale}/patient/login`), 1200);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="patient-auth-layout patient-auth-layout--single patient-auth-layout--premium">
      <form onSubmit={onSubmit} className="patient-auth-form">
        <header className="patient-auth-form-header">
          <h1>تعيين كلمة مرور جديدة</h1>
          <p>أدخل رمز الاستعادة وكلمة المرور الجديدة لحساب المريض.</p>
        </header>
        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="alert-success" role="status">
            {success}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="token">
            رمز الاستعادة <span className="required">*</span>
          </label>
          <input
            id="token"
            className="input"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            كلمة المرور الجديدة <span className="required">*</span>
          </label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
            hint={`الحد الأدنى: ${PASSWORD_MIN_CREATE} أحرف`}
          />
        </div>

        <div className="field">
          <label htmlFor="confirmPassword">
            تأكيد كلمة المرور <span className="required">*</span>
          </label>
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جارٍ الحفظ..." : "حفظ"}
        </button>
        <p className="patient-auth-switch">
          <Link href={`/${locale}/patient/login`}>العودة لتسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
}

export function ResetPasswordForm({ locale }: { locale: Locale }) {
  return (
    <Suspense
      fallback={
        <div className="patient-auth-layout patient-auth-layout--single">
          <div className="patient-auth-form">جارٍ التحميل...</div>
        </div>
      }
    >
      <ResetPasswordFormInner locale={locale} />
    </Suspense>
  );
}
