"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { PASSWORD_MIN_LOGIN, loginSchema } from "@alwisam/shared-validation";
import { PasswordField } from "../ui/PasswordField";
import { apiErrorMessage, apiPost } from "../../lib/api";
import { roleDashboardPath } from "../../lib/auth/role-paths";
import type { Locale } from "../../lib/i18n/config";
import { getUnifiedAuthCopy } from "../../lib/i18n/unified-auth-copy";
import { AuthVisualPanel } from "./AuthVisualPanel";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  message?: string | string[];
  error?: string;
  user?: { role?: string };
};

type Props = { locale: Locale };

export function UnifiedLoginForm({ locale }: Props) {
  const copy = getUnifiedAuthCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || undefined;
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = loginSchema.safeParse({
      identifier,
      password,
      rememberMe,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid data");
      return;
    }
    setLoading(true);
    try {
      const qs = next ? `?next=${encodeURIComponent(next)}` : "";
      const { ok, data } = await apiPost<LoginResponse>(`/api/auth/login${qs}`, {
        identifier: parsed.data.loginId,
        password: parsed.data.password,
        rememberMe: parsed.data.rememberMe,
      });
      if (!ok) {
        setError(apiErrorMessage(data, "بيانات تسجيل الدخول غير صحيحة."));
        return;
      }
      await fetch("/api/auth/locale", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      }).catch(() => undefined);

      const role = data.user?.role || "PATIENT";
      const target =
        data.redirectTo?.replace(/^\/(ar|en|fr)/, `/${locale}`) ||
        roleDashboardPath(role, locale);
      router.replace(target);
    } catch {
      setError("تعذر إكمال العملية حاليًا. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="patient-auth-layout patient-auth-layout--premium">
      <form
        className="patient-auth-form card-surface"
        onSubmit={onSubmit}
        noValidate
        aria-labelledby="unified-login-title"
      >
        <header className="patient-auth-form-header">
          <h1 id="unified-login-title">{copy.loginTitle}</h1>
          <p className="patient-auth-lead">{copy.loginLead}</p>
          <p className="patient-auth-support muted">{copy.loginSupport}</p>
        </header>

        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="identifier">
            {copy.identifier} <span className="required">*</span>
          </label>
          <input
            id="identifier"
            className="input"
            name="identifier"
            autoComplete="username"
            dir="ltr"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            minLength={3}
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            {copy.password} <span className="required">*</span>
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

        <div className="patient-auth-row">
          <label className="checkbox-row" htmlFor="rememberMe">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>{copy.rememberMe}</span>
          </label>
          <Link
            className="patient-auth-forgot"
            href={`/${locale}/auth/forgot-password`}
          >
            {copy.forgotPassword}
          </Link>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? copy.loginSubmitting : copy.loginSubmit}
        </button>

        <p className="patient-auth-switch">
          <Link
            className="btn btn-outline"
            href={`/${locale}/auth/register`}
          >
            {copy.createAccount}
          </Link>
        </p>

        <p className="patient-auth-home">
          <Link href={`/${locale}`}>{copy.homeLink}</Link>
        </p>
      </form>

      <AuthVisualPanel
        imageSrc="/images/stock/dental-care-hero.jpg"
        imageAlt={copy.loginImageAlt}
        overlayTitle={copy.loginOverlay}
        benefitsTitle={copy.loginBenefitsTitle}
        benefits={copy.loginBenefits}
        securityNote={copy.loginSecurityNote}
        priority
      />
    </div>
  );
}
