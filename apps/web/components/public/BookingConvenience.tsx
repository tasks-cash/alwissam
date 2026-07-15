import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { BookingFlowVisual } from "./BookingFlowVisual";

const STEP_ICONS = [
  // Service
  <svg key="s" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <path
      d="M4 7h16M4 12h10M4 17h7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>,
  // Doctor
  <svg key="d" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5.5 19c1.6-3.2 3.8-4.8 6.5-4.8S16.9 15.8 18.5 19"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>,
  // Calendar
  <svg key="c" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 3.5V7M16 3.5V7M3.5 10h17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>,
  // Send
  <svg key="r" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
    <path
      d="M4 12 20 4l-6.5 16L11 13 4 12Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
  </svg>,
];

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

export function BookingConvenience({ locale, copy }: Props) {
  return (
    <section
      className="booking-convenience booking-convenience--premium"
      aria-labelledby="booking-convenience-title"
    >
      <div className="pub-container booking-convenience-inner">
        <div className="booking-convenience-copy">
          <p className="section-kicker">{copy.bookingConvenienceKicker}</p>
          <h2 id="booking-convenience-title">{copy.bookingConvenienceTitle}</h2>
          <p className="booking-convenience-support">
            {copy.bookingConvenienceSupport}
          </p>
          {copy.bookingConvenienceMain ? (
            <p className="booking-convenience-main">
              {copy.bookingConvenienceMain}
            </p>
          ) : null}
          <p className="booking-convenience-close">
            {copy.bookingConvenienceClose}
          </p>

          <ol className="booking-home-steps">
            {copy.bookingSteps.map((step, index) => (
              <li key={step.label}>
                <span className="booking-step-num" aria-hidden>
                  {index + 1}
                </span>
                <span className="booking-step-icon" aria-hidden>
                  {STEP_ICONS[index]}
                </span>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="cta-row">
            <Link
              className="btn btn-primary"
              href={`/${locale}/book-appointment`}
            >
              {copy.bookingConveniencePrimary}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/doctors`}>
              {copy.bookingConvenienceSecondary}
            </Link>
          </div>
          <p className="booking-convenience-trust muted">
            {copy.bookingConvenienceTrust}
          </p>
        </div>

        <div className="booking-convenience-media">
          <BookingFlowVisual
            locale={locale}
            imageAlt={copy.bookingConvenienceImageAlt}
            cardAppointment={copy.bookingFloatAppointment}
            cardCalendar={copy.bookingFloatCalendar}
            cardConfirm={copy.bookingFloatConfirm}
          />
        </div>
      </div>
    </section>
  );
}
