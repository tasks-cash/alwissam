import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type {
  PublicHomepageSection,
  PublicService,
} from "../../lib/public-site";
import { pickLocalized } from "../../lib/public-site";
import { ServiceCard } from "./ServiceCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  services: PublicService[];
  section?: PublicHomepageSection | null;
};

export function DentalServicesSection({
  locale,
  copy,
  services,
  section,
}: Props) {
  const badge =
    pickLocalized(locale, section?.badgeAr, section?.badgeEn, section?.badgeFr) ||
    copy.sectionDentalServices;
  const title =
    pickLocalized(locale, section?.titleAr, section?.titleEn, section?.titleFr) ||
    copy.sectionDentalServices;
  const lead =
    pickLocalized(
      locale,
      section?.descriptionAr,
      section?.descriptionEn,
      section?.descriptionFr,
    ) || copy.sectionDentalServicesLead;
  const cta =
    pickLocalized(
      locale,
      section?.ctaLabelAr,
      section?.ctaLabelEn,
      section?.ctaLabelFr,
    ) || copy.allServices;
  const route = section?.ctaRoute || "/services";
  const ctaHref = `/${locale}${route.startsWith("/") ? route : `/${route}`}`;
  const image = section?.image || "/images/homepage/dental-services.svg";
  const imageAlt =
    pickLocalized(
      locale,
      section?.imageAltAr,
      section?.imageAltEn,
      section?.imageAltFr,
    ) || title;

  return (
    <div className="home-section-split home-section-services home-section-split--reverse">
      <div className="home-section-copy">
        <div className="section-head">
          <div>
            <p className="section-kicker">{badge}</p>
            <h2>{title}</h2>
            <p className="pub-lead">{lead}</p>
          </div>
          <Link href={ctaHref}>{cta}</Link>
        </div>
        {services.length === 0 ? (
          <p className="muted empty-state">
            {locale === "en"
              ? "No featured services are available right now."
              : locale === "fr"
                ? "Aucun service mis en avant pour le moment."
                : "لا توجد خدمات مميزة متاحة حاليًا."}
          </p>
        ) : (
          <div className="service-card-grid service-card-grid--premium">
            {services.map((s, i) => (
              <ServiceCard
                key={s.slug}
                locale={locale}
                copy={copy}
                service={s}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
      <div className="home-section-media">
        <Image
          src={image}
          alt={imageAlt}
          width={1400}
          height={900}
          className="home-section-image no-rtl-flip"
          sizes="(max-width: 900px) 100vw, 42vw"
          unoptimized={image.endsWith(".svg") || image.startsWith("/uploads/")}
        />
      </div>
    </div>
  );
}
