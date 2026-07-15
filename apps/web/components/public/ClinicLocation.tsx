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
import { ClinicDirectionsButton } from "./ClinicDirectionsButton";
import { ClinicGoogleMap } from "./ClinicGoogleMap";
import { WorkingHours } from "./WorkingHours";
import { SectionReveal } from "./motion/SectionReveal";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  /** @deprecated prefer clinic prop */
  phone?: string;
  address?: string;
  hours?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
  whatsapp?: string;
};

/** Shared location/contact block used by About and other public pages. */
export function ClinicLocation({
  locale,
  copy,
  clinic,
  phone,
  address,
  hours,
  mapsEmbedUrl,
  mapsLink,
  whatsapp,
}: Props) {
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    "",
  );
  const contact = resolveClinicContact(
    locale,
    {
      ...clinic,
      phone: clinic?.phone || phone,
      address: clinic?.address || address,
      addressAr: clinic?.addressAr || address,
      mapsEmbedUrl: clinic?.mapsEmbedUrl || mapsEmbedUrl,
      mapsLink: clinic?.mapsLink || mapsLink,
      whatsappNumber: clinic?.whatsappNumber || whatsapp,
    },
    clinicName,
  );

  const directions = contact.mapsLink || "";
  const waHref = contact.whatsappEnabled
    ? buildWhatsAppUrl(locale, {
        ...clinic,
        whatsappNumber: contact.whatsappNumber,
        whatsappEnabled: true,
      })
    : "";

  return (
    <div className="clinic-location-premium">
      <SectionReveal from="start" className="clinic-location-info">
        <p className="section-kicker">{copy.locationTitle}</p>
        <h2>{copy.locationTitle}</h2>
        <p className="pub-lead location-lead">{copy.locationLead}</p>

        <dl className="clinic-contact-dl">
          {contact.name ? (
            <div>
              <dt>{copy.clinicIntroTitle}</dt>
              <dd>{contact.name}</dd>
            </div>
          ) : null}
          {contact.address ? (
            <div>
              <dt>{copy.addressLabel}</dt>
              <dd>{contact.address}</dd>
            </div>
          ) : null}
          {contact.phoneDisplay && contact.phoneTel ? (
            <div>
              <dt>{copy.phoneNumberLabel}</dt>
              <dd>
                <a href={contact.phoneTel}>
                  <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
                </a>
              </dd>
            </div>
          ) : null}
          {contact.email ? (
            <div>
              <dt>{copy.emailLabel}</dt>
              <dd>
                <a href={`mailto:${contact.email}`}>
                  <BidiSafeValue>{contact.email}</BidiSafeValue>
                </a>
              </dd>
            </div>
          ) : null}
          {waHref ? (
            <div>
              <dt>{copy.whatsappLabel}</dt>
              <dd>
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  <BidiSafeValue>
                    {contact.phoneDisplay || copy.whatsappLabel}
                  </BidiSafeValue>
                </a>
              </dd>
            </div>
          ) : null}
          {contact.facebookUrl ? (
            <div>
              <dt>{copy.facebookLabel}</dt>
              <dd>
                <a
                  href={contact.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={facebookAriaLabel(locale)}
                >
                  Clinic.ElWissam
                </a>
              </dd>
            </div>
          ) : null}
        </dl>

        {contact.hours || hours ? (
          <WorkingHours copy={copy} hours={contact.hours || hours || ""} />
        ) : null}

        <div className="clinic-location-actions cta-row">
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment`}
          >
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
              {copy.whatsappLabel}
            </a>
          ) : null}
          {directions ? (
            <ClinicDirectionsButton
              locale={locale}
              copy={copy}
              href={directions}
              className="btn btn-outline clinic-directions-btn"
              label={copy.directionsLabel}
            />
          ) : null}
        </div>
      </SectionReveal>

      <SectionReveal from="end" delayMs={90} className="clinic-location-visual">
        <ClinicGoogleMap
          locale={locale}
          copy={copy}
          address={contact.address}
          mapsEmbedUrl={contact.mapsEmbedUrl}
          mapsLink={directions}
        />
      </SectionReveal>
    </div>
  );
}
