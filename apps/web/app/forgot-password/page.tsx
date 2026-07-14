"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPasswordSchema } from "@alwisam/shared-validation";
import { apiPost } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devToken, setDevToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevToken("");
    const parsed = forgotPasswordSchema.safeParse({ identifier });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }
    setLoading(true);
    try {
      const { ok, data } = await apiPost<{
        ok?: boolean;
        message?: string;
        error?: string;
        devToken?: string;
      }>("/api/auth/password-reset", parsed.data);
      if (!ok) {
        setError(data.error || "تعذر إرسال الطلب");
        return;
      }
      setSuccess(data.message || "تم إرسال الطلب");
      if (data.devToken) setDevToken(data.devToken);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: "grid", placeItems: "center", minHeight: "100vh", padding: "2rem 1rem" }}>
      <form
        onSubmit={onSubmit}
        className="card-surface"
        style={{ width: "100%", maxWidth: 440, padding: "1.75rem", display: "grid", gap: "1rem" }}
      >
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>استعادة كلمة المرور</h1>
        {error ? <div className="alert-error">{error}</div> : null}
        {success ? <div className="alert-success">{success}</div> : null}
        {devToken ? (
          <div className="alert-success">
            رمز التطوير فقط:{" "}
            <Link href={`/reset-password?token=${encodeURIComponent(devToken)}`}>
              افتح صفحة التعيين
            </Link>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="identifier">
            البريد أو الهاتف <span className="required">*</span>
          </label>
          <input
            id="identifier"
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جارٍ الإرسال..." : "إرسال"}
        </button>
        <Link href="/staff/login">العودة لتسجيل الدخول</Link>
      </form>
    </main>
  );
}
