import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import {
  buildWhatsAppUrl,
  facebookAriaLabel,
  resolveClinicContact,
  type ClinicContact,
} from "../../lib/clinic-contact";
import { pickLocalized } from "../../lib/public-site";
import { BidiSafeValue } from "./BidiSafeValue";
import { WorkingHours } from "./WorkingHours";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  hours?: string;
};

/**
 * Homepage-only location & contact — clinic-settings driven, no duplicated constants.
 */
export function HomeLocationContact({ locale, copy, clinic, hours }: Props) {
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    "",
  );
  const contact = resolveClinicContact(locale, clinic, clinicName);
  const directions = contact.mapsLink || "";
  const waHref = contact.whatsappEnabled
    ? buildWhatsAppUrl(locale, {
        ...clinic,
        whatsappNumber: contact.whatsappNumber,
        whatsappEnabled: true,
      })
    : "";

  return (
    <div className="home-location-cinematic">
      <div className="home-location-media">
        <div className="home-location-glow" aria-hidden />
        <div className="home-location-pin" aria-hidden>
          <svg viewBox="0 0 40 48" width="36" height="44">
            <path
              d="M20 2C11.7 2 5 8.7 5 17c0 11.2 15 29 15 29s15-17.8 15-29C35 8.7 28.3 2 20 2Z"
              fill="#0B7A68"
            />
            <circle cx="20" cy="17" r="6" fill="#fff" />
          </svg>
        </div>
        <figure className="home-location-frame">
          <Image
            src="/images/stock/dental-clinic-interior.jpg"
            alt={copy.locationImageAlt}
            width={1200}
            height={900}
            className="home-location-photo"
            loading="lazy"
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        </figure>
        <div className="home-location-route" aria-hidden />
      </div>

      <div className="home-location-panel">
        <p className="section-kicker">{copy.locationTitle}</p>
        <h2>{copy.locationTitle}</h2>
        <p className="pub-lead location-lead">{copy.homeLocationLead}</p>

        <div className="home-location-cards">
          <article className="home-location-card">
            <h3>{contact.name || clinicName}</h3>
            {contact.address ? <p>{contact.address}</p> : null}
            {contact.phoneDisplay && contact.phoneTel ? (
              <p>
                <a href={contact.phoneTel}>
                  <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
                </a>
              </p>
            ) : null}
            {contact.email ? (
              <p>
                <a href={`mailto:${contact.email}`}>
                  <BidiSafeValue>{contact.email}</BidiSafeValue>
                </a>
              </p>
            ) : null}
            {contact.facebookUrl ? (
              <p>
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={facebookAriaLabel(locale)}
                >
                  Clinic.ElWissam
                </a>
              </p>
            ) : null}
          </article>

          {contact.hours || hours ? (
            <article className="home-location-card home-location-card--hours">
              <WorkingHours copy={copy} hours={contact.hours || hours || ""} />
            </article>
          ) : null}
        </div>

        <div className="clinic-location-actions cta-row">
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/contact`}>
            {copy.sendInquiry}
          </Link>
          {contact.phoneTel ? (
            <a className="btn btn-outline" href={contact.phoneTel}>
              {copy.callClinic}
            </a>
          ) : null}
          {waHref ? (
            <a
              className="btn btn-outline"
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.locationWhatsappAction}
            </a>
          ) : null}
          {directions ? (
            <a
              className="btn btn-outline"
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.directionsLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
