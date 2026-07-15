"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost, apiRequest } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy, reasonLabel } from "../../lib/i18n/public-copy";
import type { PublicDoctor, PublicSpecialty } from "../../lib/public-site";
import {
  localizedDoctorSpecialty,
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
  preselectedDoctorId?: string;
  preselectedSpecialty?: string;
  preselectedDate?: string;
};

export function AppointmentWizard({
  locale,
  doctors,
  specialties,
  preselectedDoctorId,
  preselectedSpecialty,
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
  const [form, setForm] = useState({
    specialty: preselectedSpecialty || "",
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
    copy.wizardDoctor,
    copy.wizardSchedule,
    copy.wizardPatient,
    copy.wizardReview,
  ];

  const filteredDoctors = useMemo(() => {
    if (!form.specialty.trim()) return doctors;
    const key = form.specialty.trim().toLowerCase();
    return doctors.filter((d) => {
      const blob = [d.specialtyAr, d.specialtyEn, d.specialtyFr, d.type]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(key) || key.includes(blob.slice(0, 8));
    });
  }, [doctors, form.specialty]);

  const selectedDoctor = doctors.find((d) => d.id === form.preferredDoctorId);

  useEffect(() => {
    if (!filteredDoctors.some((d) => d.id === form.preferredDoctorId)) {
      setForm((f) =>
        f.preferredDoctorId ? { ...f, preferredDoctorId: "" } : f,
      );
    }
  }, [filteredDoctors, form.preferredDoctorId]);

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
    if (step === 2) {
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
    if (step === 3) {
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
        additionalNotes:
          [
            form.specialty ? `specialty:${form.specialty}` : "",
            form.additionalNotes,
          ]
            .filter(Boolean)
            .join(" | ") || undefined,
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
              value={form.specialty}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  specialty: e.target.value,
                  preferredDoctorId: "",
                }))
              }
            >
              <option value="">{copy.anyDoctor}</option>
              {specialties.map((s) => (
                <option key={s.slug} value={localizedSpecialtyName(locale, s)}>
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

      {step === 2 ? (
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

      {step === 3 ? (
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

      {step === 4 ? (
        <div className="review-box card-surface">
          <h3>{copy.reviewSummary}</h3>
          <ul className="contact-list">
            <li>
              {copy.visitReason}: {reasonLabel(locale, form.appointmentType)}
            </li>
            <li>
              {copy.wizardDoctor}: {selectedDoctor?.fullName || copy.anyDoctor}
            </li>
            <li>
              {copy.preferredDate}:{" "}
              <span dir="ltr">{form.preferredDate}</span>
            </li>
            <li>
              {copy.preferredTime}:{" "}
              <span dir="ltr">{form.preferredTime}</span>
            </li>
            <li>
              {dict.fullName}: {form.firstName} {form.lastName}
            </li>
            <li>
              {dict.phone}: <span dir="ltr">{form.phone}</span>
            </li>
          </ul>
        </div>
      ) : null}

      <div className="wizard-actions cta-row">
        {step > 0 ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={saving}
          >
            {copy.previous}
          </button>
        ) : null}
        <button
          type="button"
          className="btn btn-primary"
          onClick={goNext}
          disabled={saving || (step === 2 && slotsLoading)}
        >
          {saving
            ? dict.saving
            : step === steps.length - 1
              ? copy.navBook
              : copy.next}
        </button>
      </div>
    </div>
  );
}
