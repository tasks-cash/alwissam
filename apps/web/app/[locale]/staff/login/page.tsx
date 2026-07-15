"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  PASSWORD_MIN_LOGIN,
  loginSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../../../../components/ui/PasswordField";
import { apiErrorMessage, apiPost } from "../../../../lib/api";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
};

export default function StaffLoginPage() {
  const params = useParams();
  const raw = String(params?.locale || "en");
  const locale: Locale = isLocale(raw) ? raw : "en";
  const dict = useMemo(() => getDictionary(locale), [locale]);
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
      setError(parsed.error.issues[0]?.message || dict.connectionError);
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
        setError(apiErrorMessage(data, dict.connectionError));
        return;
      }
      // Persist preferred locale after login
      await fetch("/api/auth/locale", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      }).catch(() => undefined);

      const redirect =
        data.redirectTo?.replace(/^\/(ar|en|fr)/, `/${locale}`) ||
        `/${locale}/doctor/specialist/dashboard`;
      router.push(redirect);
      router.refresh();
    } catch {
      setError(dict.connectionError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-grid">
      <aside className="login-hero login-aside">
        <div>
          <div className="aside-brand">{dict.brand}</div>
          <h1>{dict.staffLoginAside}</h1>
          <p>{dict.staffLoginAsideLead}</p>
        </div>
      </aside>
      <main className="login-main">
        <form onSubmit={onSubmit} className="card-surface login-card">
          <h2>{dict.staffLoginTitle}</h2>
          {error ? <div className="alert-error">{error}</div> : null}

          <div className="field">
            <label htmlFor="email">
              {dict.emailOrPhone} <span className="required">*</span>
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
              {dict.password} <span className="required">*</span>
            </label>
            <PasswordField
              id="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              minLength={PASSWORD_MIN_LOGIN}
            />
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            {dict.rememberMe}
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? dict.signingIn : dict.signIn}
          </button>

          <div className="form-links">
            <Link href={`/${locale}/forgot-password`}>{dict.forgotPassword}</Link>
            <Link href={`/${locale}/patient/login`}>{dict.patientPortalLink}</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
