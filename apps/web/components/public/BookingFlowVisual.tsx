"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  imageAlt: string;
  cardAppointment: string;
  cardCalendar: string;
  cardConfirm: string;
};

/** Floating booking visual — CSS motion, reduced-motion safe. */
export function BookingFlowVisual({
  locale,
  imageAlt,
  cardAppointment,
  cardCalendar,
  cardConfirm,
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
      className={`booking-flow-visual${reduced ? " booking-flow-visual--reduced" : ""}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="booking-flow-shapes" aria-hidden>
        <span className="booking-flow-blob booking-flow-blob--a" />
        <span className="booking-flow-blob booking-flow-blob--b" />
      </div>
      <figure className="booking-flow-main">
        <Image
          src="/images/stock/dental-treatment.jpg"
          alt={imageAlt}
          width={1600}
          height={1067}
          className="booking-flow-img"
          loading="lazy"
          sizes="(max-width: 900px) 100vw, 44vw"
        />
      </figure>
      <div className="booking-float booking-float--appointment" aria-hidden>
        {cardAppointment}
      </div>
      <div className="booking-float booking-float--calendar" aria-hidden>
        {cardCalendar}
      </div>
      <div className="booking-float booking-float--confirm" aria-hidden>
        {cardConfirm}
      </div>
    </div>
  );
}
