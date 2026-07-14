"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  resetPasswordSchema,
  omitConfirmPassword,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../components/ui/PasswordField";
import { apiPost } from "../../lib/api";

function ResetPasswordForm() {
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
      }>("/api/auth/password-reset/confirm", payload);
      if (!ok) {
        setError(data.error || "فشل تحديث كلمة المرور");
        return;
      }
      setSuccess(data.message || "تم التحديث");
      setTimeout(() => router.push("/staff/login"), 1200);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card-surface"
      style={{ width: "100%", maxWidth: 440, padding: "1.75rem", display: "grid", gap: "1rem" }}
    >
      <h1 style={{ margin: 0, fontSize: "1.4rem" }}>تعيين كلمة مرور جديدة</h1>
      {error ? <div className="alert-error">{error}</div> : null}
      {success ? <div className="alert-success">{success}</div> : null}

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
      <Link href="/staff/login">العودة لتسجيل الدخول</Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
      <Suspense fallback={<div className="card-surface" style={{ padding: "1.5rem" }}>جارٍ التحميل...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
