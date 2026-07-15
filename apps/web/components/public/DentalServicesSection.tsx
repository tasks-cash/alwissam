import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicService } from "../../lib/public-site";
import { ServiceCard } from "./ServiceCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  services: PublicService[];
};

export function DentalServicesSection({ locale, copy, services }: Props) {
  return (
    <>
      <div className="section-head">
        <div>
          <p className="section-kicker">{copy.sectionDentalServices}</p>
          <h2>{copy.sectionDentalServices}</h2>
          <p className="pub-lead">{copy.sectionDentalServicesLead}</p>
        </div>
        <Link href={`/${locale}/services`}>{copy.allServices}</Link>
      </div>
      {services.length === 0 ? (
        <p className="muted empty-state">{copy.emptyServices}</p>
      ) : (
        <div className="service-card-grid">
          {services.map((s) => (
            <ServiceCard
              key={s.slug}
              locale={locale}
              copy={copy}
              service={s}
            />
          ))}
        </div>
      )}
    </>
  );
}
