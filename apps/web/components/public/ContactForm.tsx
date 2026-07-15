"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost, mapFieldErrors } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../lib/i18n/public-copy";

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "name")
    .max(120),
  phone: z
    .string()
    .regex(/^\d+$/, "phone")
    .min(8, "phone")
    .max(15, "phone"),
  subject: z.string().trim().min(2, "subject").max(160),
  message: z.string().trim().min(5, "message").max(4000),
});

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = useMemo(() => getPublicCopy(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const submittedOnce = useRef(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    subject: "",
    message: "",
  });

  function localizeFieldError(key: string): string {
    if (locale === "en") {
      const map: Record<string, string> = {
        name: "Full name is required.",
        phone: "Enter a valid phone number (digits only).",
        subject: "Subject is required.",
        message: "Message details are required.",
      };
      return map[key] || "Invalid field.";
    }
    if (locale === "fr") {
      const map: Record<string, string> = {
        name: "Le nom complet est obligatoire.",
        phone: "Saisissez un numéro valide (chiffres uniquement).",
        subject: "L’objet est obligatoire.",
        message: "Les détails du message sont obligatoires.",
      };
      return map[key] || "Champ invalide.";
    }
    const map: Record<string, string> = {
      name: "الاسم الكامل مطلوب.",
      phone: "أدخل رقم هاتف صالحًا (أرقام فقط).",
      subject: "موضوع الرسالة مطلوب.",
      message: "تفاصيل الرسالة مطلوبة.",
    };
    return map[key] || "حقل غير صالح.";
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving || submittedOnce.current) return;
    setError("");
    setSuccess("");
    setFieldErrors({});

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = String(issue.path[0] || "");
        const code = issue.message;
        if (path && !next[path]) next[path] = localizeFieldError(code);
      }
      setFieldErrors(next);
      setError(
        locale === "en"
          ? "Please correct the highlighted fields."
          : locale === "fr"
            ? "Veuillez corriger les champs indiqués."
            : "يرجى تصحيح الحقول المظلّلة.",
      );
      return;
    }

    setSaving(true);
    submittedOnce.current = true;
    try {
      const { ok, data } = await apiPost<{ message?: string }>(
        "/api/public/contact",
        { ...parsed.data, locale },
      );
      if (!ok) {
        submittedOnce.current = false;
        const fe = mapFieldErrors(data);
        if (Object.keys(fe).length) setFieldErrors(fe);
        setError(apiErrorMessage(data, dict.connectionError));
        return;
      }
      setSuccess(
        data.message ||
          (locale === "en"
            ? "Your message was sent successfully. The clinic team will contact you soon."
            : locale === "fr"
              ? "Votre message a bien été envoyé. L’équipe vous contactera bientôt."
              : "تم إرسال رسالتك بنجاح، وسيتواصل معك فريق العيادة في أقرب وقت."),
      );
      setForm({ fullName: "", phone: "", subject: "", message: "" });
      submittedOnce.current = false;
    } catch {
      submittedOnce.current = false;
      setError(dict.connectionError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="stack-form public-form card-surface" onSubmit={onSubmit} noValidate>
      <h2>{copy.contactFormTitle}</h2>
      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="alert-success" role="status">
          {success}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="fullName">
          {copy.fullNameLabel} <span className="required">*</span>
        </label>
        <input
          id="fullName"
          className="input"
          autoComplete="name"
          placeholder={copy.fullNamePlaceholder}
          aria-invalid={Boolean(fieldErrors.fullName)}
          aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
          value={form.fullName}
          onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
        />
        {fieldErrors.fullName ? (
          <p id="fullName-error" className="field-error">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="phone">
          {copy.phoneLabel} <span className="required">*</span>
        </label>
        <PhoneField
          id="phone"
          value={form.phone}
          onChange={(phone) => setForm((f) => ({ ...f, phone }))}
          aria-invalid={Boolean(fieldErrors.phone)}
          aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
          placeholder={copy.phonePlaceholder}
        />
        {fieldErrors.phone ? (
          <p id="phone-error" className="field-error">
            {fieldErrors.phone}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="subject">
          {copy.subject} <span className="required">*</span>
        </label>
        <input
          id="subject"
          className="input"
          placeholder={copy.subjectPlaceholder}
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={fieldErrors.subject ? "subject-error" : undefined}
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
        />
        {fieldErrors.subject ? (
          <p id="subject-error" className="field-error">
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="message">
          {copy.message} <span className="required">*</span>
        </label>
        <textarea
          id="message"
          className="input"
          rows={5}
          placeholder={copy.messagePlaceholder}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
        />
        {fieldErrors.message ? (
          <p id="message-error" className="field-error">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? copy.sending : copy.sendInquiry}
      </button>
    </form>
  );
}
