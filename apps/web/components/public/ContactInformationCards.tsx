import type { ReactNode } from "react";
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

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  hours?: string;
};

type InfoRow = {
  key: string;
  title: string;
  body: ReactNode;
  icon: ReactNode;
};

function IconPin() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M7.5 3.5h3.2l1.2 4.2-2 1.2a12.5 12.5 0 0 0 5.2 5.2l1.2-2 4.2 1.2v3.2c0 .9-.7 1.7-1.6 1.8A16.5 16.5 0 0 1 3.7 5.1c.1-.9.9-1.6 1.8-1.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 7.5 7.5 5.5 7.5-5.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4.5l3 1.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconWa() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L4 21l4.8-.7A8.5 8.5 0 1 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IconFb() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="M14 9h2.5V6.2A18 18 0 0 0 13.7 6C11.1 6 9.4 7.7 9.4 10.6V12H7v3h2.4v7h3.1v-7H15l.5-3h-2.9v-1.1c0-.9.2-1.9 1.4-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconMaps() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
      <path
        d="m4 7.5 5.5-2.5 5 2.5 5.5-2.5v11.5l-5.5 2.5-5-2.5L4 19Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.5 5v11.5M14.5 7.5V19" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

/** Premium contact information panel — shared across locales via Contact page. */
export function ContactInformationCards({
  locale,
  copy,
  clinic,
  hours,
}: Props) {
  const clinicName = pickLocalized(
    locale,
    clinic?.nameAr || clinic?.clinicNameAr,
    clinic?.nameEn || clinic?.clinicNameEn,
    clinic?.nameFr || clinic?.clinicNameFr,
    "",
  );
  const contact = resolveClinicContact(locale, clinic, clinicName);
  const waHref = contact.whatsappEnabled
    ? buildWhatsAppUrl(locale, {
        ...clinic,
        whatsappNumber: contact.whatsappNumber,
        whatsappEnabled: true,
      })
    : "";
  const directions = contact.mapsLink || "";
  const displayHours = contact.hours || hours || "";

  const rows: InfoRow[] = [];

  if (clinicName) {
    rows.push({
      key: "name",
      title: copy.footerClinic,
      body: <p>{clinicName}</p>,
      icon: <IconPin />,
    });
  }
  if (contact.address) {
    rows.push({
      key: "address",
      title: copy.addressLabel,
      body: <p>{contact.address}</p>,
      icon: <IconPin />,
    });
  }
  if (contact.phoneDisplay && contact.phoneTel) {
    rows.push({
      key: "phone",
      title: copy.phoneNumberLabel,
      body: (
        <a href={contact.phoneTel}>
          <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
        </a>
      ),
      icon: <IconPhone />,
    });
  }
  if (contact.email) {
    rows.push({
      key: "email",
      title: copy.emailLabel,
      body: (
        <a href={`mailto:${contact.email}`}>
          <BidiSafeValue>{contact.email}</BidiSafeValue>
        </a>
      ),
      icon: <IconMail />,
    });
  }
  if (displayHours) {
    rows.push({
      key: "hours",
      title: copy.hoursLabel,
      body: (
        <p style={{ whiteSpace: "pre-line" }}>
          <BidiSafeValue>{displayHours}</BidiSafeValue>
        </p>
      ),
      icon: <IconClock />,
    });
  }
  if (waHref) {
    rows.push({
      key: "whatsapp",
      title: copy.whatsappLabel,
      body: (
        <a href={waHref} target="_blank" rel="noopener noreferrer">
          <BidiSafeValue>
            {contact.phoneDisplay || copy.whatsappLabel}
          </BidiSafeValue>
        </a>
      ),
      icon: <IconWa />,
    });
  }
  if (contact.facebookUrl) {
    rows.push({
      key: "facebook",
      title: copy.facebookLabel,
      body: (
        <a
          href={contact.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={facebookAriaLabel(locale)}
        >
          Clinic.ElWissam
        </a>
      ),
      icon: <IconFb />,
    });
  }

  if (!rows.length && !directions) return null;

  return (
    <aside
      className="contact-info-panel"
      aria-labelledby="contact-info-panel-title"
    >
      <p className="section-kicker">{copy.contactInfoSummaryTitle}</p>
      <h2 id="contact-info-panel-title">{copy.contactInfoSummaryTitle}</h2>
      <ul className="contact-info-rows">
        {rows.map((row) => (
          <li key={row.key} className="contact-info-row">
            <span className="contact-info-row-icon">{row.icon}</span>
            <div>
              <h3>{row.title}</h3>
              {row.body}
            </div>
          </li>
        ))}
        {directions ? (
          <li className="contact-info-row contact-info-row-maps">
            <span className="contact-info-row-icon">
              <IconMaps />
            </span>
            <div>
              <h3>{copy.directionsLabel}</h3>
              <ClinicDirectionsButton
                locale={locale}
                copy={copy}
                href={directions}
                label={copy.openDirectionsMaps}
              />
            </div>
          </li>
        ) : null}
      </ul>
    </aside>
  );
}
