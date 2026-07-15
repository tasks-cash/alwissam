"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  PASSWORD_MIN_LOGIN,
  loginSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import { apiPost } from "../../../../lib/api";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
};

export default function PatientLoginPage() {
  const params = useParams();
  const locale = String(params?.locale || "ar");
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({
      identifier,
      password,
      portal: "patient",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiPost<LoginResponse>("/api/auth/login", {
        identifier: parsed.data.loginId,
        password: parsed.data.password,
        portal: "patient",
      });
      if (!ok) {
        setError(
          data.error ||
            (Array.isArray(data.message) ? data.message[0] : data.message) ||
            "فشل تسجيل الدخول",
        );
        return;
      }
      router.push(data.redirectTo || `/${locale}/patient/dashboard`);
      router.refresh();
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
        <h1 style={{ margin: 0, color: "var(--primary-navy)", fontSize: "1.5rem" }}>
          دخول المريض
        </h1>
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="field">
          <label htmlFor="identifier">
            البريد أو الهاتف <span className="required">*</span>
          </label>
          <input
            id="identifier"
            className="input"
            name="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            كلمة المرور <span className="required">*</span>
          </label>
          <PasswordField
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
            minLength={PASSWORD_MIN_LOGIN}
            hint={`الحد الأدنى لتسجيل الدخول: ${PASSWORD_MIN_LOGIN} أحرف`}
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جارٍ الدخول..." : "دخول"}
        </button>

        <div style={{ fontSize: "0.9rem" }}>
          <Link href={`/${locale}/forgot-password`}>نسيت كلمة المرور؟</Link>
        </div>
      </form>
    </main>
  );
}
