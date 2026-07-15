"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneField } from "../ui/PhoneField";
import { apiErrorMessage, apiPost } from "../../lib/api";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import type { PublicDoctor } from "../../lib/public-site";
import { getDictionary } from "../../lib/i18n/dictionaries";

const REASONS = [
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
  preselectedDoctorId?: string;
};

export function BookAppointmentForm({
  locale,
  doctors,
  preselectedDoctorId,
}: Props) {
  const copy = useMemo(() => getPublicCopy(locale), [locale]);
  const dict = useMemo(() => getDictionary(locale), [locale]);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    appointmentType: "GENERAL_EXAM",
    preferredDoctorId: preselectedDoctorId || "",
    preferredDate: "",
    preferredTime: "",
    additionalNotes: "",
    consentAccepted: false,
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.consentAccepted) {
      setError(copy.consent);
      return;
    }
    setSaving(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const reason =
        form.appointmentType === "EMERGENCY"
          ? "Emergency"
          : form.appointmentType;
      const { ok, data } = await apiPost<{
        requestNumber?: string;
        queueNumber?: string;
        message?: string;
      }>("/api/public/appointments", {
        fullName,
        phone: form.phone,
        appointmentType: form.appointmentType,
        reason,
        consentAccepted: true,
        isEmergency: form.appointmentType === "EMERGENCY",
        preferredDoctorId: form.preferredDoctorId || undefined,
        preferredDate: form.preferredDate || undefined,
        preferredTime: form.preferredTime || undefined,
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

  return (
    <form className="stack-form public-form card-surface" onSubmit={onSubmit}>
      {error ? <div className="alert-error">{error}</div> : null}
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
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
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
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
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
      <div className="row-2">
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
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="doctorId">{dict.doctor}</label>
          <select
            id="doctorId"
            className="input"
            value={form.preferredDoctorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredDoctorId: e.target.value }))
            }
          >
            <option value="">—</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="row-2">
        <div className="field">
          <label htmlFor="preferredDate">{copy.preferredDate}</label>
          <input
            id="preferredDate"
            className="input"
            type="date"
            value={form.preferredDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredDate: e.target.value }))
            }
          />
        </div>
        <div className="field">
          <label htmlFor="preferredTime">{copy.preferredTime}</label>
          <input
            id="preferredTime"
            className="input"
            type="time"
            value={form.preferredTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, preferredTime: e.target.value }))
            }
          />
        </div>
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
            setForm((f) => ({ ...f, consentAccepted: e.target.checked }))
          }
          required
        />
        {copy.consent}
      </label>
      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? dict.saving : copy.navBook}
      </button>
    </form>
  );
}
