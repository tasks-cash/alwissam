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
};

export function ServiceCard({ locale, copy, service }: Props) {
  const name = localizedServiceName(locale, service);
  const desc = localizedServiceDesc(locale, service);
  const parent = service.specialties?.[0]?.name;
  const canBook =
    typeof service.doctorCount !== "number" || service.doctorCount > 0;

  return (
    <article className="service-card">
      <span className="service-card-icon" aria-hidden>
        <DentalIcon name={service.icon || "tooth"} />
      </span>
      <h3>{name}</h3>
      {desc ? <p>{desc}</p> : null}
      {parent ? (
        <p className="service-card-parent muted">
          {copy.parentSpecialtyLabel}: {parent}
        </p>
      ) : null}
      {service.requiresConsultation ? (
        <p className="service-badge">{copy.consultationRequired}</p>
      ) : null}
      <div className="cta-row">
        <Link href={`/${locale}/services/${service.slug}`}>
          {copy.viewServiceDetails}
        </Link>
        {canBook ? (
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment?service=${encodeURIComponent(service.slug)}`}
          >
            {copy.relatedCta}
          </Link>
        ) : (
          <Link
            className="btn btn-outline"
            href={`/${locale}/services/${service.slug}`}
          >
            {copy.serviceInfoAction}
          </Link>
        )}
      </div>
    </article>
  );
}
