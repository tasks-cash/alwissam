import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { WorkingHours } from "./WorkingHours";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  phone?: string;
  address?: string;
  hours?: string;
  mapsEmbedUrl?: string;
  mapsLink?: string;
  whatsapp?: string;
};

export function ClinicLocation({
  locale,
  copy,
  phone,
  address,
  hours,
  mapsEmbedUrl,
  mapsLink,
  whatsapp,
}: Props) {
  const directions =
    mapsLink ||
    (address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : undefined);

  return (
    <div className="clinic-location-grid">
      <div className="card-surface clinic-location-card">
        <h2>{copy.locationTitle}</h2>
        <ul className="contact-list">
          {phone ? (
            <li>
              <a href={`tel:${phone}`} dir="ltr">
                {phone}
              </a>
            </li>
          ) : null}
          {address ? <li>{address}</li> : null}
          {whatsapp ? (
            <li>
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                dir="ltr"
              >
                WhatsApp
              </a>
            </li>
          ) : null}
        </ul>
        {hours ? <WorkingHours copy={copy} hours={hours} /> : null}
        <div className="cta-row">
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
          <Link className="btn btn-outline" href={`/${locale}/contact`}>
            {copy.navContact}
          </Link>
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </Link>
        </div>
      </div>
      {mapsEmbedUrl ? (
        <iframe
          title={copy.locationTitle}
          src={mapsEmbedUrl}
          className="contact-map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="contact-map-fallback card-surface" aria-hidden>
          <div className="pub-hero-orbit" />
        </div>
      )}
    </div>
  );
}
