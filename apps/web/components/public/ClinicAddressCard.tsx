import Image from "next/image";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import {
  buildWhatsAppUrl,
  resolveClinicContact,
  type ClinicContact,
} from "../../lib/clinic-contact";
import { pickLocalized } from "../../lib/public-site";
import { BidiSafeValue } from "./BidiSafeValue";
import { ClinicDirectionsButton } from "./ClinicDirectionsButton";
import { WorkingHours } from "./WorkingHours";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  hours?: string;
};

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M19 5l-9 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M11 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClinicAddressCard({ locale, copy, clinic, hours }: Props) {
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
  const hasSafeEmbed = Boolean(contact.mapsEmbedUrl);

  return (
    <aside
      className="clinic-address-card card-surface"
      aria-labelledby="clinic-address-title"
    >
      <div className="clinic-address-card-deco" aria-hidden>
        <span className="clinic-address-pin-pulse" />
      </div>
      <div className="clinic-address-card-grid">
        <div className="clinic-address-card-main">
          <p className="section-kicker">{copy.addressCardKicker}</p>
          <h2 id="clinic-address-title">{copy.addressCardTitle}</h2>
          {contact.address ? (
            <p className="clinic-address-text">
              <span className="clinic-directions-icon clinic-pin-icon" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path
                    d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="2.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </span>
              <span className="clinic-address-value">{contact.address}</span>
            </p>
          ) : null}

          {contact.phoneDisplay && contact.phoneTel ? (
            <p className="clinic-address-meta">
              <a href={contact.phoneTel}>
                <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
              </a>
            </p>
          ) : null}

          {contact.hours || hours ? (
            <WorkingHours copy={copy} hours={contact.hours || hours || ""} />
          ) : null}

          {directions ? (
            <div className="clinic-maps-url-block">
              <p className="clinic-maps-url-label" id="clinic-maps-url-label">
                {copy.mapsUrlLabel}
              </p>
              <a
                className="clinic-maps-url-link"
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
                aria-labelledby="clinic-maps-url-label"
              >
                <span className="clinic-maps-url-text">{directions}</span>
                <ExternalLinkIcon />
              </a>
            </div>
          ) : null}

          <div className="cta-row clinic-address-actions">
            <ClinicDirectionsButton
              locale={locale}
              copy={copy}
              href={directions}
              className="btn btn-primary clinic-directions-btn"
              label={copy.openDirectionsMaps}
            />
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
                {copy.whatsappCta}
              </a>
            ) : null}
          </div>
        </div>

        <div className="clinic-address-visual">
          {hasSafeEmbed ? (
            <iframe
              title={copy.addressCardTitle}
              src={contact.mapsEmbedUrl}
              className="contact-map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="clinic-location-visual-panel">
              <Image
                src="/images/contact-clinic.svg"
                alt={copy.locationImageAlt}
                width={960}
                height={720}
                className="clinic-location-image"
                loading="lazy"
                unoptimized
                sizes="(max-width: 900px) 100vw, 40vw"
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
