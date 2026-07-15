"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  PASSWORD_MIN_CREATE,
  omitConfirmPassword,
  registerPatientSchema,
} from "@alwisam/shared-validation";
import { PasswordField } from "../ui/PasswordField";
import { PhoneField } from "../ui/PhoneField";
import { apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPatientAuthCopy } from "../../lib/i18n/patient-auth-copy";

type RegisterResponse = {
  ok?: boolean;
  redirectTo?: string;
  error?: string;
  message?: string | string[];
};

function strengthScore(password: string) {
  let score = 0;
  if (password.length >= PASSWORD_MIN_CREATE) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

type Props = { locale: Locale };

export function PatientRegisterForm({ locale }: Props) {
  const copy = getPatientAuthCopy(locale);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const score = useMemo(() => strengthScore(password), [password]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsed = registerPatientSchema.safeParse({
      fullName,
      phone,
      email: email || undefined,
      password,
      confirmPassword,
      locale: locale as "ar" | "en" | "fr",
      privacyAccepted: privacyAccepted || undefined,
      termsAccepted: termsAccepted || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid data");
      return;
    }
    setLoading(true);
    try {
      const payload = omitConfirmPassword(parsed.data);
      const { ok, data } = await apiPost<RegisterResponse>("/api/auth/register", {
        ...payload,
        confirmPassword: parsed.data.confirmPassword,
        privacyAccepted: true,
        termsAccepted: true,
      });
      if (!ok) {
        setError(
          data.error ||
            (Array.isArray(data.message) ? data.message[0] : data.message) ||
            "Could not create account",
        );
        return;
      }
      router.push(data.redirectTo || `/${locale}/patient/dashboard`);
      router.refresh();
    } catch {
      setError("Could not reach the server");
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
        aria-labelledby="patient-register-title"
      >
        <header className="patient-auth-form-header">
          <h1 id="patient-register-title">{copy.registerTitle}</h1>
          <p className="patient-auth-lead">{copy.registerLead}</p>
          <p className="patient-auth-support muted">{copy.registerSupport}</p>
        </header>

        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="fullName">
            {copy.fullName} <span className="required">*</span>
          </label>
          <input
            id="fullName"
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="phone">
            {copy.phone} <span className="required">*</span>
          </label>
          <PhoneField
            id="phone"
            value={phone}
            onChange={setPhone}
            required
            autoComplete="tel"
          />
        </div>
        <div className="field">
          <label htmlFor="email">{copy.emailOptional}</label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
          />
          <div className="password-strength" aria-hidden>
            <span data-active={score >= 1} />
            <span data-active={score >= 2} />
            <span data-active={score >= 3} />
            <span data-active={score >= 4} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="confirmPassword">
            {copy.confirmPassword} <span className="required">*</span>
          </label>
          <PasswordField
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_CREATE}
          />
        </div>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
          />
          <span>
            {copy.privacyAgree} (
            <Link href={`/${locale}/privacy`}>
              {locale === "en"
                ? "Privacy"
                : locale === "fr"
                  ? "Confidentialité"
                  : "الخصوصية"}
            </Link>
            )
          </span>
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
          />
          <span>{copy.termsAgree}</span>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? copy.registerSubmitting : copy.registerSubmit}
        </button>
        <p className="patient-auth-switch">
          {copy.registerHasAccount}{" "}
          <Link href={`/${locale}/patient/login`}>{copy.loginLink}</Link>
        </p>
      </form>

      <aside className="patient-auth-visual" aria-label={copy.benefitsTitle}>
        <Image
          src="/images/stock/dental-clinic-interior.jpg"
          alt={copy.registerImageAlt}
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
