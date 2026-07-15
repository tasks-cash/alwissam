"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost, apiRequest } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy, reasonLabel } from "../../lib/i18n/public-copy";
import type {
  PublicDoctor,
  PublicService,
  PublicSpecialty,
} from "../../lib/public-site";
import {
  localizedDoctorSpecialty,
  localizedServiceName,
  localizedSpecialtyName,
} from "../../lib/public-site";
import { getDictionary } from "../../lib/i18n/dictionaries";

const REASON_CODES = [
  "GENERAL_EXAM",
  "EMERGENCY",
  "TOOTHACHE",
  "CLEANING",
  "FILLING",
  "EXTRACTION",
  "ROOT_CANAL",
  "ORTHO_CONSULT",
  "ORTHO_FOLLOWUP",
  "PROSTHETICS",
  "SURGERY_CONSULT",
  "SURGERY",
  "POST_OP_FOLLOWUP",
  "OTHER",
] as const;

type Props = {
  locale: Locale;
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
  services: PublicService[];
  preselectedDoctorId?: string;
  preselectedSpecialty?: string;
  preselectedService?: string;
  preselectedDate?: string;
};

export function AppointmentWizard({
  locale,
  doctors,
  specialties,
  services: initialServices,
  preselectedDoctorId,
  preselectedSpecialty,
  preselectedService,
  preselectedDate,
}: Props) {
  const copy = useMemo(() => getPublicCopy(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [services, setServices] = useState<PublicService[]>(initialServices);
  const [serviceDoctors, setServiceDoctors] = useState<PublicDoctor[] | null>(
    null,
  );
  const [form, setForm] = useState({
    specialtySlug: preselectedSpecialty || "",
    serviceSlug: preselectedService || "",
    preferredDoctorId: preselectedDoctorId || "",
    preferredDate: preselectedDate || "",
    preferredTime: "",
    appointmentType: "GENERAL_EXAM",
    firstName: "",
    lastName: "",
    phone: "",
    additionalNotes: "",
    consentAccepted: false,
  });

  const steps = [
    copy.wizardSpecialty,
    copy.wizardService,
    copy.wizardDoctor,
    copy.wizardSchedule,
    copy.wizardPatient,
    copy.wizardReview,
  ];

  useEffect(() => {
    if (!form.specialtySlug) {
      setServices(initialServices);
      return;
    }
    let cancelled = false;
    void apiRequest<{ services?: PublicService[] }>(
      `/api/public/services?locale=${locale}&specialty=${encodeURIComponent(form.specialtySlug)}&limit=48`,
    ).then(({ ok, data }) => {
      if (cancelled || !ok) return;
      setServices(Array.isArray(data.services) ? data.services : []);
    });
    return () => {
      cancelled = true;
    };
  }, [form.specialtySlug, initialServices, locale]);

  useEffect(() => {
    if (!form.serviceSlug) {
      setServiceDoctors(null);
      return;
    }
    let cancelled = false;
    void apiRequest<{ doctors?: PublicDoctor[] }>(
      `/api/public/services/${encodeURIComponent(form.serviceSlug)}?locale=${locale}`,
    ).then(({ ok, data }) => {
      if (cancelled || !ok) return;
      setServiceDoctors(Array.isArray(data.doctors) ? data.doctors : []);
    });
    return () => {
      cancelled = true;
    };
  }, [form.serviceSlug, locale]);

  const filteredDoctors = useMemo(() => {
    if (serviceDoctors) {
      return serviceDoctors.length ? serviceDoctors : doctors;
    }
    if (!form.specialtySlug) return doctors;
    const specialty = specialties.find((s) => s.slug === form.specialtySlug);
    if (!specialty) return doctors;
    const keys = [
      specialty.nameAr,
      specialty.nameEn,
      specialty.nameFr,
      specialty.slug,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    return doctors.filter((d) => {
      const blob = [d.specialtyAr, d.specialtyEn, d.specialtyFr, d.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return keys.some((k) => blob.includes(k) || k.includes(blob.slice(0, 8)));
    });
  }, [
    doctors,
    form.specialtySlug,
    serviceDoctors,
    specialties,
  ]);

  const selectedDoctor = doctors.find((d) => d.id === form.preferredDoctorId);
  const selectedSpecialty = specialties.find(
    (s) => s.slug === form.specialtySlug,
  );
  const selectedService = services.find((s) => s.slug === form.serviceSlug);

  useEffect(() => {
    if (!filteredDoctors.some((d) => d.id === form.preferredDoctorId)) {
      setForm((f) =>
        f.preferredDoctorId ? { ...f, preferredDoctorId: "" } : f,
      );
    }
  }, [filteredDoctors, form.preferredDoctorId]);

  useEffect(() => {
    if (
      form.serviceSlug &&
      services.length &&
      !services.some((s) => s.slug === form.serviceSlug)
    ) {
      setForm((f) => ({ ...f, serviceSlug: "" }));
    }
  }, [form.serviceSlug, services]);

  useEffect(() => {
    if (!form.preferredDate) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    const q = new URLSearchParams({ date: form.preferredDate });
    if (form.preferredDoctorId) q.set("doctorId", form.preferredDoctorId);
    void apiRequest<{ times?: string[] }>(
      `/api/public/appointments/available-times?${q.toString()}`,
    ).then(({ ok, data }) => {
      if (cancelled) return;
      setSlotsLoading(false);
      if (!ok) {
        setSlots([]);
        return;
      }
      const times = data.times || [];
      setSlots(times);
      setForm((f) =>
        f.preferredTime && !times.includes(f.preferredTime)
          ? { ...f, preferredTime: "" }
          : f,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [form.preferredDate, form.preferredDoctorId]);

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function validateStep(): boolean {
    setError("");
    if (step === 3) {
      if (!form.preferredDate) {
        setError(copy.preferredDate);
        return false;
      }
      if (form.preferredDate < todayISO()) {
        setError(copy.pastDateError);
        return false;
      }
      if (!form.preferredTime) {
        setError(copy.preferredTime);
        return false;
      }
      if (slots.length && !slots.includes(form.preferredTime)) {
        setError(copy.noSlots);
        return false;
      }
    }
    if (step === 4) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
        setError(
          locale === "en"
            ? "Please complete required patient fields."
            : locale === "fr"
              ? "Veuillez compléter les champs obligatoires."
              : "يرجى إكمال الحقول المطلوبة للمريض.",
        );
        return false;
      }
      if (!form.consentAccepted) {
        setError(copy.consent);
        return false;
      }
    }
    return true;
  }

  async function onSubmit() {
    setError("");
    if (!form.consentAccepted) {
      setError(copy.consent);
      return;
    }
    setSaving(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const { ok, data } = await apiPost<{
        requestNumber?: string;
        queueNumber?: string;
        message?: string;
      }>("/api/public/appointments", {
        fullName,
        phone: form.phone,
        appointmentType: form.appointmentType,
        reason: form.appointmentType,
        consentAccepted: true,
        isEmergency: form.appointmentType === "EMERGENCY",
        preferredDoctorId: form.preferredDoctorId || undefined,
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
        specialtySlug: form.specialtySlug || undefined,
        serviceSlug: form.serviceSlug || undefined,
        additionalNotes: form.additionalNotes || undefined,
      });
      if (!ok) {
        setError(apiErrorMessage(data));
        return;
      }
      const ref = data.requestNumber || data.queueNumber || "";
      router.push(
        `/${locale}/book-appointment/confirmation?ref=${encodeURIComponent(ref)}`,
      );
    } catch {
      setError(dict.connectionError);
    } finally {
      setSaving(false);
    }
  }

  function goNext() {
    if (!validateStep()) return;
    if (step >= steps.length - 1) {
      void onSubmit();
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="appointment-wizard">
      <ol className="wizard-steps" aria-label={copy.bookTitle}>
        {steps.map((label, i) => (
          <li
            key={label}
            className={i === step ? "active" : i < step ? "done" : ""}
          >
            <span>
              {copy.stepLabel} {i + 1}
            </span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>

      {error ? <div className="alert-error">{error}</div> : null}
      <p className="muted">{copy.preferredSlotNote}</p>

      {step === 0 ? (
        <div className="stack-form">
          <div className="field">
            <label htmlFor="specialty">{copy.wizardSpecialty}</label>
            <select
              id="specialty"
              className="input"
              value={form.specialtySlug}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  specialtySlug: e.target.value,
                  serviceSlug: "",
                  preferredDoctorId: "",
                }))
              }
            >
              <option value="">{copy.anyDoctor}</option>
              {specialties.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {localizedSpecialtyName(locale, s)}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="appointmentType">{copy.visitReason}</label>
            <select
              id="appointmentType"
              className="input"
              value={form.appointmentType}
              onChange={(e) =>
                setForm((f) => ({ ...f, appointmentType: e.target.value }))
              }
            >
              {REASON_CODES.map((code) => (
                <option key={code} value={code}>
                  {reasonLabel(locale, code)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="field">
          <label htmlFor="serviceSlug">{copy.wizardService}</label>
          <select
            id="serviceSlug"
            className="input"
            value={form.serviceSlug}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                serviceSlug: e.target.value,
                preferredDoctorId: "",
              }))
            }
          >
            <option value="">
              {locale === "en"
                ? "Any service"
                : locale === "fr"
                  ? "Tout service"
                  : "أي خدمة"}
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {localizedServiceName(locale, s)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="field">
          <label htmlFor="doctorId">{copy.wizardDoctor}</label>
          <select
            id="doctorId"
            className="input"
            value={form.preferredDoctorId}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                preferredDoctorId: e.target.value,
                preferredTime: "",
              }))
            }
          >
            <option value="">{copy.anyDoctor}</option>
            {filteredDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
                {localizedDoctorSpecialty(locale, d)
                  ? ` — ${localizedDoctorSpecialty(locale, d)}`
                  : ""}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="stack-form">
          <div className="field">
            <label htmlFor="preferredDate">{copy.preferredDate}</label>
            <input
              id="preferredDate"
              className="input"
              type="date"
              min={todayISO()}
              value={form.preferredDate}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  preferredDate: e.target.value,
                  preferredTime: "",
                }))
              }
              required
            />
          </div>
          <fieldset className="time-slots">
            <legend>{copy.preferredTime}</legend>
            {slotsLoading ? <p className="muted">{copy.loadingSlots}</p> : null}
            {!slotsLoading && form.preferredDate && slots.length === 0 ? (
              <p className="muted">{copy.noSlots}</p>
            ) : null}
            <div className="time-slot-grid">
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    form.preferredTime === t
                      ? "btn btn-primary"
                      : "btn btn-outline"
                  }
                  onClick={() => setForm((f) => ({ ...f, preferredTime: t }))}
                >
                  <span dir="ltr">{t}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}

      {step === 4 ? (
        <form
          className="stack-form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            goNext();
          }}
        >
          <div className="row-2">
            <div className="field">
              <label htmlFor="firstName">
                {copy.firstName} <span className="required">*</span>
              </label>
              <input
                id="firstName"
                className="input"
                required
                value={form.firstName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="lastName">
                {copy.lastName} <span className="required">*</span>
              </label>
              <input
                id="lastName"
                className="input"
                required
                value={form.lastName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="phone">
              {dict.phone} <span className="required">*</span>
            </label>
            <PhoneField
              id="phone"
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="notes">{dict.notes}</label>
            <textarea
              id="notes"
              className="input"
              rows={3}
              value={form.additionalNotes}
              onChange={(e) =>
                setForm((f) => ({ ...f, additionalNotes: e.target.value }))
              }
            />
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={form.consentAccepted}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  consentAccepted: e.target.checked,
                }))
              }
              required
            />
            {copy.consent}
          </label>
        </form>
      ) : null}

      {step === 5 ? (
        <div className="review-box card-surface">
          <h3>{copy.reviewSummary}</h3>
          <ul>
            <li>
              {copy.wizardSpecialty}:{" "}
              {selectedSpecialty
                ? localizedSpecialtyName(locale, selectedSpecialty)
                : "—"}
            </li>
            <li>
              {copy.wizardService}:{" "}
              {selectedService
                ? localizedServiceName(locale, selectedService)
                : "—"}
            </li>
            <li>
              {copy.wizardDoctor}: {selectedDoctor?.fullName || copy.anyDoctor}
            </li>
            <li>
              {copy.preferredDate}: {form.preferredDate || "—"}
            </li>
            <li>
              {copy.preferredTime}:{" "}
              <span dir="ltr">{form.preferredTime || "—"}</span>
            </li>
            <li>
              {copy.visitReason}: {reasonLabel(locale, form.appointmentType)}
            </li>
            <li>
              {copy.fullNameLabel}: {form.firstName} {form.lastName}
            </li>
            <li>
              {dict.phone}: <span dir="ltr">{form.phone}</span>
            </li>
          </ul>
          <p className="muted">{copy.medicalTreatmentDisclaimer}</p>
        </div>
      ) : null}

      <div className="cta-row wizard-actions">
        <button
          type="button"
          className="btn btn-outline"
          disabled={step === 0 || saving}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          {copy.previous}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving}
          onClick={goNext}
        >
          {step >= steps.length - 1
            ? saving
              ? copy.sending
              : copy.navBook
            : copy.next}
        </button>
      </div>
    </div>
  );
}
