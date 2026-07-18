"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost, mapFieldErrors } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../lib/i18n/public-copy";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "name").max(120),
  phone: z
    .string()
    .regex(/^\d+$/, "phone")
    .min(8, "phone")
    .max(15, "phone"),
  subject: z.string().trim().min(2, "subject").max(160),
  message: z.string().trim().min(5, "message").max(4000),
  doctorId: z.string().optional(),
  specialtyId: z.string().optional(),
  serviceId: z.string().optional(),
});

type ContactValues = z.infer<typeof contactSchema>;

type InquiryOption = { id: string; label: string };

type InquiryFormProps = {
  locale: Locale;
  title?: string;
  lead?: string;
  doctors?: InquiryOption[];
  specialties?: InquiryOption[];
  services?: InquiryOption[];
};

export function ProfessionalInquiryForm({
  locale,
  title,
  lead,
  doctors = [],
  specialties = [],
  services = [],
}: InquiryFormProps) {
  const copy = useMemo(() => getPublicCopy(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      subject: "",
      message: "",
      doctorId: "",
      specialtyId: "",
      serviceId: "",
    },
  });

  const phone = watch("phone");

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
      subject: "موضوع الاستفسار مطلوب.",
      message: "تفاصيل الاستفسار مطلوبة.",
    };
    return map[key] || "حقل غير صالح.";
  }

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    clearErrors("root");
    try {
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        subject: values.subject,
        message: values.message,
        locale,
        sourcePage: "contact",
        ...(values.doctorId ? { doctorId: values.doctorId } : {}),
        ...(values.specialtyId ? { specialtyId: values.specialtyId } : {}),
        ...(values.serviceId ? { serviceId: values.serviceId } : {}),
      };
      const { ok, data } = await apiPost<{
        message?: string;
        ok?: boolean;
      }>("/api/public/contact", payload);
      if (!ok) {
        const fe = mapFieldErrors(data);
        for (const [key, msg] of Object.entries(fe)) {
          setError(key as keyof ContactValues, { message: msg });
        }
        setError("root", {
          message: apiErrorMessage(
            data,
            locale === "en"
              ? "Unable to send your inquiry right now. Please try again."
              : locale === "fr"
                ? "Impossible d’envoyer votre demande pour le moment. Veuillez réessayer."
                : "تعذر إرسال الاستفسار حاليًا. يرجى المحاولة مرة أخرى.",
          ),
        });
        return;
      }
      reset({
        fullName: "",
        phone: "",
        subject: "",
        message: "",
        doctorId: "",
        specialtyId: "",
        serviceId: "",
      });
      setSuccess(true);
    } catch {
      setError("root", { message: dict.connectionError });
    }
  });

  return (
    <form
      className="stack-form public-form card-surface professional-inquiry-form contact-inquiry-form"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby="contact-inquiry-form-heading"
    >
      <div className="contact-inquiry-form-header">
        <p className="section-kicker">{copy.tabInquiry}</p>
        <h2 id="contact-inquiry-form-heading">
          {title || copy.contactFormTitle}
        </h2>
        <p className="pub-lead">{lead || copy.inquiryFormLead}</p>
      </div>

      {errors.root?.message ? (
        <div className="alert-error" role="alert">
          {errors.root.message}
        </div>
      ) : null}
      {success ? (
        <div className="alert-success" role="status">
          <strong>{copy.inquirySuccessTitle}</strong>
          <p>{copy.inquirySuccessMessage}</p>
        </div>
      ) : null}

      <div className="field field-with-icon">
        <label htmlFor="fullName">
          {copy.fullNameLabel} <span className="required">*</span>
        </label>
        <div className="input-icon-wrap">
          <span className="input-field-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M5.5 19c1.8-3 4-4.5 6.5-4.5S16.7 16 18.5 19"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="fullName"
            className="input"
            autoComplete="name"
            placeholder={copy.fullNamePlaceholder}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
        </div>
        {errors.fullName ? (
          <p id="fullName-error" className="field-error">
            {localizeFieldError(String(errors.fullName.message || "name"))}
          </p>
        ) : null}
      </div>

      <div className="field field-with-icon">
        <label htmlFor="phone">
          {copy.phoneLabel} <span className="required">*</span>
        </label>
        <div className="input-icon-wrap">
          <span className="input-field-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M7.5 3.5h3.2l1.2 4.2-2 1.2a12.5 12.5 0 0 0 5.2 5.2l1.2-2 4.2 1.2v3.2c0 .9-.7 1.7-1.6 1.8A16.5 16.5 0 0 1 3.7 5.1c.1-.9.9-1.6 1.8-1.6Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <PhoneField
            id="phone"
            value={phone}
            onChange={(next) =>
              setValue("phone", next, { shouldValidate: true, shouldDirty: true })
            }
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            placeholder={copy.phonePlaceholder}
          />
        </div>
        {errors.phone ? (
          <p id="phone-error" className="field-error">
            {localizeFieldError(String(errors.phone.message || "phone"))}
          </p>
        ) : null}
      </div>

      <div className="field field-with-icon">
        <label htmlFor="subject">
          {copy.subject} <span className="required">*</span>
        </label>
        <div className="input-icon-wrap">
          <span className="input-field-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <path
                d="M5 7.5h14M5 12h10M5 16.5h8"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <input
            id="subject"
            className="input"
            placeholder={copy.subjectPlaceholder}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            {...register("subject")}
          />
        </div>
        {errors.subject ? (
          <p id="subject-error" className="field-error">
            {localizeFieldError(String(errors.subject.message || "subject"))}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="message">
          {copy.message} <span className="required">*</span>
        </label>
        <textarea
          id="message"
          className="input contact-inquiry-textarea"
          rows={7}
          placeholder={copy.messagePlaceholder}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        {errors.message ? (
          <p id="message-error" className="field-error">
            {localizeFieldError(String(errors.message.message || "message"))}
          </p>
        ) : null}
      </div>

      {specialties.length > 0 ? (
        <div className="field">
          <label htmlFor="specialtyId">
            {locale === "en"
              ? "Specialty (optional)"
              : locale === "fr"
                ? "Spécialité (optionnel)"
                : "التخصص (اختياري)"}
          </label>
          <select id="specialtyId" className="input" {...register("specialtyId")}>
            <option value="">
              {locale === "en"
                ? "No specialty selected"
                : locale === "fr"
                  ? "Aucune spécialité"
                  : "بدون تخصص"}
            </option>
            {specialties.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {services.length > 0 ? (
        <div className="field">
          <label htmlFor="serviceId">
            {locale === "en"
              ? "Service (optional)"
              : locale === "fr"
                ? "Service (optionnel)"
                : "الخدمة (اختياري)"}
          </label>
          <select id="serviceId" className="input" {...register("serviceId")}>
            <option value="">
              {locale === "en"
                ? "No service selected"
                : locale === "fr"
                  ? "Aucun service"
                  : "بدون خدمة"}
            </option>
            {services.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {doctors.length > 0 ? (
        <div className="field">
          <label htmlFor="doctorId">
            {locale === "en"
              ? "Doctor (optional)"
              : locale === "fr"
                ? "Médecin (optionnel)"
                : "الطبيب (اختياري)"}
          </label>
          <select id="doctorId" className="input" {...register("doctorId")}>
            <option value="">
              {locale === "en"
                ? "No doctor selected"
                : locale === "fr"
                  ? "Aucun médecin"
                  : "بدون طبيب"}
            </option>
            {doctors.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <button
        className="btn btn-primary contact-inquiry-submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="btn-spinner" aria-hidden />
            {copy.sendingInquiry}
          </>
        ) : (
          copy.sendInquiryButton
        )}
      </button>
    </form>
  );
}

/** @deprecated Use ProfessionalInquiryForm */
export { ProfessionalInquiryForm as ContactForm };
