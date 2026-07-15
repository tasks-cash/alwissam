import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  locale: Locale;
  copy: PublicCopy;
};

export function BookingConvenience({ locale, copy }: Props) {
  return (
    <section
      className="booking-convenience"
      aria-labelledby="booking-convenience-title"
    >
      <div className="pub-container booking-convenience-inner">
        <div className="booking-convenience-copy">
          <p className="section-kicker">{copy.bookingConvenienceKicker}</p>
          <h2 id="booking-convenience-title">{copy.bookingConvenienceTitle}</h2>
          <p className="booking-convenience-support">
            {copy.bookingConvenienceSupport}
          </p>
          <p className="booking-convenience-main">
            {copy.bookingConvenienceMain}
          </p>
          <p className="booking-convenience-close">
            {copy.bookingConvenienceClose}
          </p>
          <ul className="booking-convenience-benefits">
            {copy.bookingConvenienceBenefits.map((item) => (
              <li key={item}>
                <span className="booking-benefit-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M7.5 12.2 10.4 15l6.1-6.4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
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
          <Image
            src="/images/contact-clinic.svg"
            alt={copy.bookingConvenienceImageAlt}
            width={960}
            height={720}
            className="booking-convenience-image"
            loading="lazy"
            unoptimized
            sizes="(max-width: 900px) 100vw, 44vw"
          />
        </div>
      </div>
    </section>
  );
}
