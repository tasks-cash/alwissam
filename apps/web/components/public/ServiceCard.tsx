import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicService } from "../../lib/public-site";
import {
  localizedServiceDesc,
  localizedServiceName,
} from "../../lib/public-site";
import { DentalIcon } from "./DentalIcon";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  service: PublicService;
  index?: number;
  /** Preserve current specialty in booking URL when opened from a specialty page. */
  specialtySlug?: string;
};

export function ServiceCard({
  locale,
  copy,
  service,
  index = 0,
  specialtySlug,
}: Props) {
  const name = localizedServiceName(locale, service);
  const desc =
    service.shortDescription || localizedServiceDesc(locale, service);
  const parent = service.specialties?.[0];
  const canBook =
    service.isBookable !== false &&
    (typeof service.doctorCount !== "number" || service.doctorCount > 0);
  const detailsHref = `/${locale}/services/${service.slug}`;
  const bookParams = new URLSearchParams();
  bookParams.set("service", service.slug);
  if (specialtySlug) bookParams.set("specialty", specialtySlug);
  else if (parent?.slug) bookParams.set("specialty", parent.slug);
  const bookHref = `/${locale}/book-appointment?${bookParams.toString()}`;
  const delayMs = Math.min(index, 8) * 60;
  const alt =
    locale === "en"
      ? `${name} dental service`
      : locale === "fr"
        ? `Service dentaire ${name}`
        : `خدمة ${name}`;
  const durationLabel =
    typeof service.durationMinutes === "number" && service.durationMinutes > 0
      ? locale === "en"
        ? `${service.durationMinutes} min`
        : locale === "fr"
          ? `${service.durationMinutes} min`
          : `${service.durationMinutes} دقيقة`
      : null;

  return (
    <article
      className="service-card service-card--premium"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="service-card-media">
        {service.image ? (
          <Image
            src={service.image}
            alt={alt}
            width={640}
            height={400}
            className="service-card-photo"
            unoptimized
            sizes="(max-width: 768px) 92vw, (max-width: 1100px) 46vw, 32vw"
          />
        ) : (
          <span className="service-card-fallback" aria-hidden>
            <span className="service-card-icon">
              <DentalIcon name={service.icon || "tooth"} />
            </span>
          </span>
        )}
        {service.icon && service.image ? (
          <span className="service-card-icon-badge" aria-hidden>
            <DentalIcon name={service.icon} />
          </span>
        ) : null}
      </div>

      <div className="service-card-body">
        <h3>
          <Link href={detailsHref}>{name}</Link>
        </h3>
        {desc ? <p className="service-card-desc">{desc}</p> : null}

        <div className="service-card-meta">
          {parent ? (
            <p className="service-card-parent">
              <span className="muted">{copy.parentSpecialtyLabel}:</span>{" "}
              <Link href={`/${locale}/specialties/${parent.slug}`}>
                {parent.name}
              </Link>
            </p>
          ) : null}
          {typeof service.doctorCount === "number" ? (
            <p className="service-meta-chip">
              <strong>{service.doctorCount}</strong> {copy.doctorCountLabel}
            </p>
          ) : null}
          {durationLabel ? (
            <p className="service-meta-chip">{durationLabel}</p>
          ) : null}
          {service.requiresConsultation ? (
            <p className="service-badge">{copy.consultationRequired}</p>
          ) : (
            <p className="service-badge service-badge--ok">
              {copy.serviceAvailableLabel}
            </p>
          )}
        </div>

        <div className="cta-row service-card-actions">
          <Link className="btn btn-outline" href={detailsHref}>
            {copy.viewServiceDetails}
          </Link>
          <Link className="btn btn-outline" href={detailsHref}>
            {copy.serviceInfoAction}
          </Link>
          {canBook ? (
            <Link className="btn btn-primary" href={bookHref}>
              {copy.relatedCta}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
