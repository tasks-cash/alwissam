import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type {
  PublicHomepageSection,
  PublicSpecialty,
} from "../../lib/public-site";
import { pickLocalized } from "../../lib/public-site";
import { SpecialtyCard } from "./SpecialtyCard";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  specialties: PublicSpecialty[];
  section?: PublicHomepageSection | null;
};

export function SpecialtiesSection({
  locale,
  copy,
  specialties,
  section,
}: Props) {
  const badge =
    pickLocalized(locale, section?.badgeAr, section?.badgeEn, section?.badgeFr) ||
    copy.sectionSpecialties;
  const title =
    pickLocalized(locale, section?.titleAr, section?.titleEn, section?.titleFr) ||
    copy.sectionSpecialties;
  const lead =
    pickLocalized(
      locale,
      section?.descriptionAr,
      section?.descriptionEn,
      section?.descriptionFr,
    ) || copy.sectionSpecialtiesLead;
  const cta =
    pickLocalized(
      locale,
      section?.ctaLabelAr,
      section?.ctaLabelEn,
      section?.ctaLabelFr,
    ) || copy.allSpecialties;
  const route = section?.ctaRoute || "/specialties";
  const ctaHref = `/${locale}${route.startsWith("/") ? route : `/${route}`}`;
  const image = section?.image || "/images/homepage/medical-specialties.svg";
  const imageAlt =
    pickLocalized(
      locale,
      section?.imageAltAr,
      section?.imageAltEn,
      section?.imageAltFr,
    ) || title;

  return (
    <div className="home-section-split home-section-specialties">
      <div className="home-section-copy">
        <div className="section-head">
          <div>
            <p className="section-kicker">{badge}</p>
            <h2>{title}</h2>
            <p className="pub-lead">{lead}</p>
          </div>
          <Link href={ctaHref}>{cta}</Link>
        </div>
        {specialties.length === 0 ? (
          <p className="muted empty-state">
            {locale === "en"
              ? "No featured specialties are available right now."
              : locale === "fr"
                ? "Aucune spécialité mise en avant pour le moment."
                : "لا توجد تخصصات مميزة متاحة حاليًا."}
          </p>
        ) : (
          <div className="pub-tile-grid pub-tile-grid-3 specialty-card-grid">
            {specialties.map((s, i) => (
              <SpecialtyCard
                key={s.slug}
                locale={locale}
                copy={copy}
                specialty={s}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
      <div className="home-section-media" aria-hidden={false}>
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
