import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicSpecialty } from "../../lib/public-site";
import {
  localizedSpecialtyDesc,
  localizedSpecialtyName,
} from "../../lib/public-site";
import { DentalIcon } from "./DentalIcon";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  specialty: PublicSpecialty;
};

export function SpecialtyCard({ locale, copy, specialty }: Props) {
  const name = localizedSpecialtyName(locale, specialty);
  const desc = localizedSpecialtyDesc(locale, specialty);
  const doctorCount = specialty.doctorCount;
  const serviceCount = specialty.serviceCount;
  const canBook = typeof doctorCount === "number" ? doctorCount > 0 : true;

  return (
    <article className="pub-tile specialty-card">
      <span className="specialty-icon" aria-hidden>
        <DentalIcon name={specialty.icon || "tooth"} />
      </span>
      <h3>{name}</h3>
      {desc ? <p>{desc}</p> : null}
      {typeof serviceCount === "number" ? (
        <p className="muted">
          {serviceCount} {copy.serviceCountLabel}
        </p>
      ) : null}
      {typeof doctorCount === "number" && doctorCount > 0 ? (
        <p className="muted">
          {doctorCount} {copy.doctorCountLabel}
        </p>
      ) : null}
      <div className="cta-row">
        <Link href={`/${locale}/specialties/${specialty.slug}`}>
          {copy.viewSpecialtyDetails}
        </Link>
        {canBook ? (
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment?specialty=${encodeURIComponent(specialty.slug)}`}
          >
            {copy.relatedCta}
          </Link>
        ) : (
          <Link
            className="btn btn-outline"
            href={`/${locale}/specialties/${specialty.slug}`}
          >
            {copy.serviceInfoAction}
          </Link>
        )}
      </div>
    </article>
  );
}
