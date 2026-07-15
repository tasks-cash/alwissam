"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import type { PublicDoctor, PublicSpecialty } from "../../lib/public-site";
import {
  localizedDoctorSpecialty,
  localizedSpecialtyName,
} from "../../lib/public-site";

type Props = {
  locale: Locale;
  doctors: PublicDoctor[];
  specialties: PublicSpecialty[];
};

type SlotPayload = {
  ok?: boolean;
  times?: string[];
  message?: string;
};

export function QuickBookPanel({ locale, doctors, specialties }: Props) {
  const copy = useMemo(() => getPublicCopy(locale), [locale]);
  const router = useRouter();
  const [specialty, setSpecialty] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const filteredDoctors = useMemo(() => {
    if (!specialty) return doctors;
    const name = specialty.toLowerCase();
    return doctors.filter((d) => {
      const s = localizedDoctorSpecialty(locale, d).toLowerCase();
      return !s || s.includes(name) || name.includes(s);
    });
  }, [doctors, specialty, locale]);

  useEffect(() => {
    if (doctorId && !filteredDoctors.some((d) => d.id === doctorId)) {
      setDoctorId("");
    }
  }, [filteredDoctors, doctorId]);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setSlotsError("");
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    setSlotsError("");
    const q = new URLSearchParams({ date, doctorId });
    fetch(`/api/public/appointments/available-times?${q.toString()}`)
      .then(async (res) => {
        const data = (await res.json()) as SlotPayload;
        if (cancelled) return;
        if (!res.ok) {
          setSlots([]);
          setSlotsError(data.message || copy.noSlots);
          return;
        }
        setSlots(Array.isArray(data.times) ? data.times : []);
        if (!data.times?.length) setSlotsError(copy.noSlots);
      })
      .catch(() => {
        if (!cancelled) {
          setSlots([]);
          setSlotsError(copy.noSlots);
        }
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, date, copy.noSlots]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (specialty) params.set("specialty", specialty);
    if (doctorId) params.set("doctor", doctorId);
    if (date) params.set("date", date);
    const qs = params.toString();
    router.push(`/${locale}/book-appointment${qs ? `?${qs}` : ""}`);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form className="quick-book-panel" onSubmit={onSubmit}>
      <div>
        <p className="section-kicker">{copy.quickBookTitle}</p>
        <h2>{copy.quickBookTitle}</h2>
      </div>
      <div className="quick-book-fields">
        <div className="field">
          <label htmlFor="qb-specialty">{copy.wizardSpecialty}</label>
          <select
            id="qb-specialty"
            className="input"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">{copy.anyDoctor}</option>
            {specialties.map((s) => {
              const label = localizedSpecialtyName(locale, s);
              return (
                <option key={s.slug} value={label}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qb-doctor">{copy.wizardDoctor}</label>
          <select
            id="qb-doctor"
            className="input"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
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
        <div className="field">
          <label htmlFor="qb-date">{copy.preferredDate}</label>
          <input
            id="qb-date"
            className="input"
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            dir="ltr"
          />
        </div>
        <button className="btn btn-primary" type="submit">
          {copy.quickBookCta}
        </button>
      </div>
      {doctorId && date ? (
        <div className="quick-book-slots" aria-live="polite">
          {slotsLoading ? (
            <p className="muted">{copy.loadingSlots}</p>
          ) : slotsError && !slots.length ? (
            <p className="muted">{slotsError}</p>
          ) : slots.length ? (
            <ul className="slot-chip-row">
              {slots.slice(0, 8).map((t) => (
                <li key={t}>
                  <span className="slot-chip" dir="ltr">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
