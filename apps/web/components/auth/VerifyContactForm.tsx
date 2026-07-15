"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiErrorMessage, apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";

type Props = { locale: Locale; initialToken?: string };

export function VerifyContactForm({ locale, initialToken = "" }: Props) {
  const [token, setToken] = useState(initialToken);
  const [channel, setChannel] = useState<"email" | "phone">("email");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const path =
        channel === "phone" ? "/api/auth/verify-phone" : "/api/auth/verify-email";
      const { ok, data } = await apiPost<{ message?: string }>(path, {
        token: token.trim(),
        channel,
      });
      if (!ok) {
        setError(apiErrorMessage(data, "رمز التحقق غير صالح أو منتهٍ."));
        return;
      }
      setMessage(
        typeof data.message === "string"
          ? data.message
          : "تم التحقق بنجاح.",
      );
    } catch {
      setError("تعذر إكمال العملية حاليًا. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card-surface auth-card stack-form" onSubmit={onSubmit}>
      <div>
        <h1>
          {locale === "fr"
            ? "Vérification"
            : locale === "en"
              ? "Verify account"
              : "تأكيد الحساب"}
        </h1>
        <p className="lead">
          {locale === "fr"
            ? "Saisissez le code reçu pour confirmer votre e-mail ou téléphone."
            : locale === "en"
              ? "Enter the code you received to confirm your email or phone."
              : "أدخل رمز التحقق لإتمام تأكيد البريد أو رقم الهاتف."}
        </p>
      </div>

      <label>
        <span>
          {locale === "fr" ? "Canal" : locale === "en" ? "Channel" : "القناة"}
        </span>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as "email" | "phone")}
        >
          <option value="email">
            {locale === "fr" ? "E-mail" : locale === "en" ? "Email" : "البريد"}
          </option>
          <option value="phone">
            {locale === "fr"
              ? "Téléphone"
              : locale === "en"
                ? "Phone"
                : "الهاتف"}
          </option>
        </select>
      </label>

      <label>
        <span>
          {locale === "fr"
            ? "Code"
            : locale === "en"
              ? "Verification code"
              : "رمز التحقق"}
        </span>
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoComplete="one-time-code"
          required
        />
      </label>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="form-success" role="status">
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={loading}>
        {loading
          ? locale === "fr"
            ? "Vérification..."
            : locale === "en"
              ? "Verifying..."
              : "جارٍ التحقق..."
          : locale === "fr"
            ? "Confirmer"
            : locale === "en"
              ? "Confirm"
              : "تأكيد"}
      </button>

      <p className="muted">
        <Link href={`/${locale}/auth/login`}>
          {locale === "fr"
            ? "Retour à la connexion"
            : locale === "en"
              ? "Back to sign in"
              : "العودة لتسجيل الدخول"}
        </Link>
      </p>
    </form>
  );
}
