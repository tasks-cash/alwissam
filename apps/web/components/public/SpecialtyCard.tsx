import Image from "next/image";
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
  index?: number;
};

export function SpecialtyCard({
  locale,
  copy,
  specialty,
  index = 0,
}: Props) {
  const name = localizedSpecialtyName(locale, specialty);
  const desc = localizedSpecialtyDesc(locale, specialty);
  const doctorCount = specialty.doctorCount;
  const serviceCount = specialty.serviceCount;
  const previews = (specialty.servicePreviews || []).slice(0, 3);
  const canBook = typeof doctorCount === "number" ? doctorCount > 0 : true;
  const detailsHref = `/${locale}/specialties/${specialty.slug}`;
  const bookHref = `/${locale}/book-appointment?specialty=${encodeURIComponent(specialty.slug)}`;
  const delayMs = Math.min(index, 8) * 70;
  const alt =
    locale === "en"
      ? `${name} specialty at Al Wissam Dental Clinic`
      : locale === "fr"
        ? `Spécialité ${name} — Clinique Dentaire El Wissam`
        : `تخصص ${name} في عيادة الوسام لطب الأسنان`;

  return (
    <article
      className="specialty-card specialty-card--premium"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="specialty-card-media">
        {specialty.image ? (
          <Image
            src={specialty.image}
            alt={alt}
            width={640}
            height={360}
            className="specialty-card-photo"
            unoptimized
            sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 360px"
          />
        ) : (
          <span className="specialty-card-icon" aria-hidden>
            <DentalIcon name={specialty.icon || "tooth"} />
          </span>
        )}
        {specialty.isFeatured ? (
          <span className="specialty-card-badge">{copy.featuredSpecialtyBadge}</span>
        ) : null}
      </div>

      <div className="specialty-card-body">
        <h3>
          <Link href={detailsHref}>{name}</Link>
        </h3>
        {desc ? <p className="specialty-card-desc">{desc}</p> : null}

        <div className="specialty-card-stats" aria-label={copy.specialtyStatsLabel}>
          {typeof serviceCount === "number" ? (
            <span>
              <strong>{serviceCount}</strong> {copy.serviceCountLabel}
            </span>
          ) : null}
          {typeof doctorCount === "number" ? (
            <span>
              <strong>{doctorCount}</strong> {copy.doctorCountLabel}
            </span>
          ) : null}
        </div>

        {previews.length > 0 ? (
          <ul className="specialty-service-chips">
            {previews.map((p) => (
              <li key={p.slug}>
                <Link href={`/${locale}/services/${p.slug}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="cta-row specialty-card-actions">
          <Link className="btn btn-outline" href={detailsHref}>
            {copy.viewSpecialtyDetails}
          </Link>
          {canBook ? (
            <Link className="btn btn-primary" href={bookHref}>
              {copy.relatedCta}
            </Link>
          ) : (
            <Link className="btn btn-outline" href={detailsHref}>
              {copy.serviceInfoAction}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
