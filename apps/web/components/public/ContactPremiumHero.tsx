import Image from "next/image";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import {
  resolveClinicContact,
  type ClinicContact,
} from "../../lib/clinic-contact";
import { pickLocalized } from "../../lib/public-site";
import { BidiSafeValue } from "./BidiSafeValue";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  hours?: string;
};

export function ContactPremiumHero({ locale, copy, clinic, hours }: Props) {
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    copy.clinicIntroTitle,
  );
  const contact = resolveClinicContact(locale, clinic, clinicName);
  const displayHours = contact.hours || hours || "";
  const mapsHref = contact.mapsLink || "";

  return (
    <section className="pub-band pub-band-mist page-hero contact-premium-hero">
      <div className="contact-hero-deco" aria-hidden>
        <span className="contact-hero-deco-ring" />
        <span className="contact-hero-deco-cross" />
        <span className="contact-hero-deco-dot" />
      </div>
      <div className="pub-container page-hero-split">
        <div className="page-hero-copy contact-hero-copy">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <a href={`/${locale}`}>{copy.navHome}</a>
              </li>
              <li>
                <span>{copy.navContact}</span>
              </li>
            </ol>
          </nav>
          <p className="contact-hero-clinic">{clinicName}</p>
          <h1>{copy.contactHeroTitle}</h1>
          <p className="pub-lead">{copy.contactHeroLead}</p>
          <div className="cta-row contact-hero-actions">
            <a className="btn btn-primary" href="#contact-booking-heading">
              {copy.heroBookDoctor}
            </a>
            {mapsHref ? (
              <a
                className="btn btn-outline"
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.heroDirections}
              </a>
            ) : null}
          </div>
          <ul className="contact-hero-trust">
            {contact.phoneDisplay ? (
              <li>
                <span className="contact-hero-trust-label">{copy.phoneNumberLabel}</span>
                <strong>
                  <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
                </strong>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <span className="contact-hero-trust-label">{copy.emailLabel}</span>
                <strong>
                  <BidiSafeValue>{contact.email}</BidiSafeValue>
                </strong>
              </li>
            ) : null}
            {displayHours ? (
              <li>
                <span className="contact-hero-trust-label">{copy.hoursLabel}</span>
                <strong>
                  <BidiSafeValue>{displayHours}</BidiSafeValue>
                </strong>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="page-hero-media contact-hero-media">
          <Image
            src="/images/contact-clinic.svg"
            alt={copy.contactHeroTitle}
            width={1200}
            height={700}
            className="page-hero-image contact-hero-image"
            priority
            unoptimized
            sizes="(max-width: 900px) 100vw, 42vw"
          />
        </div>
      </div>
    </section>
  );
}
