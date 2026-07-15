"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPasswordSchema } from "@alwisam/shared-validation";
import { apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPatientAuthCopy } from "../../lib/i18n/patient-auth-copy";

type Props = { locale: Locale };

export function ForgotPasswordForm({ locale }: Props) {
  const auth = getPatientAuthCopy(locale);
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [devToken, setDevToken] = useState("");
  const [loading, setLoading] = useState(false);

  const title =
    locale === "en"
      ? "Reset password"
      : locale === "fr"
        ? "Réinitialiser le mot de passe"
        : "استعادة كلمة المرور";
  const lead =
    locale === "en"
      ? "Enter your phone or email and we will send reset instructions when the account exists."
      : locale === "fr"
        ? "Saisissez votre téléphone ou e-mail pour recevoir les instructions de réinitialisation."
        : "أدخل رقم الهاتف أو البريد لإرسال تعليمات استعادة كلمة المرور إن وُجد الحساب.";
  const submit =
    locale === "en" ? "Send" : locale === "fr" ? "Envoyer" : "إرسال";
  const submitting =
    locale === "en"
      ? "Sending..."
      : locale === "fr"
        ? "Envoi..."
        : "جارٍ الإرسال...";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDevToken("");
    const parsed = forgotPasswordSchema.safeParse({ identifier });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid data");
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
        setError(data.error || "Request failed");
        return;
      }
      setSuccess(data.message || "Request sent");
      if (data.devToken) setDevToken(data.devToken);
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
    <div className="patient-auth-layout patient-auth-layout--single">
      <form
        onSubmit={onSubmit}
        className="patient-auth-form card-surface"
        noValidate
      >
        <header className="patient-auth-form-header">
          <h1>{title}</h1>
          <p className="patient-auth-lead">{lead}</p>
        </header>
        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? <div className="alert-success">{success}</div> : null}
        {devToken ? (
          <div className="alert-success">
            {locale === "en" ? "Dev token only: " : "رمز التطوير فقط: "}
            <Link
              href={`/${locale}/reset-password?token=${encodeURIComponent(devToken)}`}
            >
              {locale === "en" ? "Open reset page" : "افتح صفحة التعيين"}
            </Link>
          </div>
        ) : null}
        <div className="field">
          <label htmlFor="identifier">
            {auth.identifier} <span className="required">*</span>
          </label>
          <input
            id="identifier"
            className="input"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            dir="ltr"
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? submitting : submit}
        </button>
        <p className="patient-auth-switch">
          <Link href={`/${locale}/patient/login`}>{auth.loginLink}</Link>
        </p>
      </form>
    </div>
  );
}
