"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  PASSWORD_MIN_LOGIN,
  loginSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../ui/PasswordField";
import { apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPatientAuthCopy } from "../../lib/i18n/patient-auth-copy";

type LoginResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
  code?: string;
};

type Props = { locale: Locale };

function PatientLoginFormInner({ locale }: Props) {
  const copy = getPatientAuthCopy(locale);
  const router = useRouter();
  const search = useSearchParams();
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
      portal: "patient",
      rememberMe,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid data");
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiPost<LoginResponse>("/api/auth/login", {
        identifier: parsed.data.loginId,
        password: parsed.data.password,
        portal: "patient",
        rememberMe,
      });
      if (!ok) {
        const code = data.code || "";
        if (code === "ACCOUNT_DISABLED") {
          setError(
            locale === "en"
              ? "This account is disabled or temporarily locked."
              : locale === "fr"
                ? "Ce compte est désactivé ou temporairement verrouillé."
                : "تم تعطيل هذا الحساب أو قفله مؤقتًا.",
          );
        } else {
          setError(
            data.error ||
              (Array.isArray(data.message) ? data.message[0] : data.message) ||
              (locale === "en"
                ? "Invalid login details."
                : locale === "fr"
                  ? "Identifiants incorrects."
                  : "بيانات الدخول غير صحيحة."),
          );
        }
        return;
      }
      const next = search.get("next");
      const safeNext =
        next && next.startsWith(`/${locale}/patient`) ? next : null;
      router.push(
        safeNext || data.redirectTo || `/${locale}/patient/dashboard`,
      );
      router.refresh();
    } catch {
      setError(
        locale === "en"
          ? "Could not reach the server"
          : locale === "fr"
            ? "Impossible de joindre le serveur"
            : "تعذر الاتصال بالخادم",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="patient-auth-layout patient-auth-layout--premium">
      <form
        onSubmit={onSubmit}
        className="patient-auth-form card-surface"
        noValidate
        aria-labelledby="patient-login-title"
      >
        <header className="patient-auth-form-header">
          <h1 id="patient-login-title">{copy.loginTitle}</h1>
          <p className="patient-auth-lead">{copy.loginLead}</p>
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
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            autoComplete="username"
            dir="ltr"
            required
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
          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>{copy.rememberMe}</span>
          </label>
          <Link
            className="patient-auth-forgot"
            href={`/${locale}/forgot-password`}
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
            href={`/${locale}/patient/register`}
          >
            {copy.loginCreateAccount}
          </Link>
        </p>
      </form>

      <aside className="patient-auth-visual" aria-label={copy.benefitsTitle}>
        <Image
          src="/images/stock/dental-care-hero.jpg"
          alt={copy.loginImageAlt}
          fill
          sizes="(max-width: 900px) 100vw, 48vw"
          priority
          className="patient-auth-image"
        />
        <div className="patient-auth-visual-copy">
          <h2>{copy.benefitsTitle}</h2>
          <ul className="patient-auth-benefits">
            {copy.benefits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export function PatientLoginForm({ locale }: Props) {
  return (
    <Suspense
      fallback={
        <div className="patient-auth-layout patient-auth-layout--premium">
          <div className="patient-auth-form card-surface">
            <p className="muted">…</p>
          </div>
        </div>
      }
    >
      <PatientLoginFormInner locale={locale} />
    </Suspense>
  );
}
