"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  imageAlt: string;
  mockLabel: string;
  cardAppointment: string;
  cardProgress: string;
  cardNotice: string;
  cardFile: string;
  securityBadge: string;
};

/** Decorative patient-dashboard composition — no real patient data. */
export function PatientDashboardVisual({
  locale,
  imageAlt,
  mockLabel,
  cardAppointment,
  cardProgress,
  cardNotice,
  cardFile,
  securityBadge,
}: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div
      className={`patient-dash-visual${reduced ? " patient-dash-visual--reduced" : ""}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-label={mockLabel}
    >
      <figure className="patient-dash-main">
        <Image
          src="/images/stock/dental-team-care.jpg"
          alt={imageAlt}
          width={960}
          height={720}
          className="patient-dash-image"
          sizes="(max-width: 768px) 100vw, 42vw"
        />
      </figure>
      <div className="patient-dash-panel" aria-hidden>
        <span className="mock-label">{mockLabel}</span>
        <div className="mock-row" />
        <div className="mock-row short" />
        <div className="mock-chips">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="patient-float patient-float--appt" aria-hidden>
        {cardAppointment}
      </div>
      <div className="patient-float patient-float--progress" aria-hidden>
        {cardProgress}
      </div>
      <div className="patient-float patient-float--notice" aria-hidden>
        {cardNotice}
      </div>
      <div className="patient-float patient-float--file" aria-hidden>
        {cardFile}
      </div>
      <div className="patient-float patient-float--secure" aria-hidden>
        {securityBadge}
      </div>
    </div>
  );
}
