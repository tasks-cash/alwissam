"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  PASSWORD_MIN_LOGIN,
  loginSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../components/ui/PasswordField";
import { apiErrorMessage, apiPost } from "../../../lib/api";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
  code?: string;
};

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({
      email,
      password,
      rememberMe,
      portal: "staff",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "بيانات غير صالحة");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiPost<LoginResponse>("/api/auth/login", {
        email: parsed.data.loginId,
        password: parsed.data.password,
        rememberMe: parsed.data.rememberMe,
        portal: "staff",
      });
      if (!ok) {
        setError(apiErrorMessage(data, "فشل تسجيل الدخول"));
        return;
      }
      router.push(data.redirectTo || "/");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالخادم حاليًا. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", minHeight: "100vh" }} className="login-grid">
      <style>{`
        @media (min-width: 960px) {
          .login-grid { grid-template-columns: 1fr 1fr; }
          .login-aside { display:flex !important; }
        }
      `}</style>
      <aside
        className="login-hero login-aside"
        style={{ display: "none", color: "#fff", padding: "3rem", alignItems: "center" }}
      >
        <div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>عيادة الوسام</div>
          <h1 style={{ fontSize: "2rem", marginTop: "1.5rem" }}>بوابة الطاقم الطبي</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.7 }}>
            دخول السكرتارية والأطباء وصاحبة العيادة.
          </p>
        </div>
      </aside>
      <main style={{ display: "grid", placeItems: "center", padding: "2rem 1rem" }}>
        <form
          onSubmit={onSubmit}
          className="card-surface"
          style={{ width: "100%", maxWidth: 440, padding: "1.75rem", display: "grid", gap: "1rem" }}
        >
          <h2 style={{ margin: 0, color: "var(--primary-navy)" }}>تسجيل دخول الطاقم</h2>
          {error ? <div className="alert-error">{error}</div> : null}

          <div className="field">
            <label htmlFor="email">
              البريد أو الهاتف <span className="required">*</span>
            </label>
            <input
              id="email"
              className="input"
              name="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            تذكرني
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
            <Link href="/patient/login">بوابة المريض</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
