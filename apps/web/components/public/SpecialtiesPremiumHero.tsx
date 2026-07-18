import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type {
  PublicSpecialty,
  PublicSpecialtiesPage,
} from "../../lib/public-site";
import {
  localizedSpecialtyName,
  pickLocalized,
} from "../../lib/public-site";
import { FloatingImage } from "./motion/FloatingImage";
import { SectionReveal } from "./motion/SectionReveal";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  floatingLabels: PublicSpecialty[];
  hero?: PublicSpecialtiesPage | null;
};

function resolveRoute(locale: Locale, route?: string) {
  const value = (route || "").trim();
  if (!value) return `/${locale}/book-appointment`;
  if (value.startsWith("#")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `/${locale}${value}`;
  return `/${locale}/${value.replace(/^\//, "")}`;
}

export function SpecialtiesPremiumHero({
  locale,
  copy,
  floatingLabels,
  hero,
}: Props) {
  const labels = floatingLabels.slice(0, 3);
  const badge = pickLocalized(
    locale,
    hero?.badgeAr,
    hero?.badgeEn,
    hero?.badgeFr,
    copy.navSpecialties,
  );
  const title = pickLocalized(
    locale,
    hero?.titleAr,
    hero?.titleEn,
    hero?.titleFr,
    copy.specialtiesHeroTitle,
  );
  const description = pickLocalized(
    locale,
    hero?.descriptionAr,
    hero?.descriptionEn,
    hero?.descriptionFr,
    copy.specialtiesHeroLead,
  );
  const image = hero?.image || "/images/hero-clinic.svg";
  const alt = pickLocalized(
    locale,
    hero?.imageAltAr,
    hero?.imageAltEn,
    hero?.imageAltFr,
    locale === "en"
      ? "Dental specialties at Al Wissam Dental Clinic"
      : locale === "fr"
        ? "Spécialités dentaires de la Clinique Dentaire El Wissam"
        : "تخصصات طب الأسنان في عيادة الوسام",
  );
  const primaryLabel = pickLocalized(
    locale,
    hero?.primaryCtaLabelAr,
    hero?.primaryCtaLabelEn,
    hero?.primaryCtaLabelFr,
    copy.browseSpecialtiesCta,
  );
  const secondaryLabel = pickLocalized(
    locale,
    hero?.secondaryCtaLabelAr,
    hero?.secondaryCtaLabelEn,
    hero?.secondaryCtaLabelFr,
    copy.relatedCta,
  );
  const primaryHref = resolveRoute(locale, hero?.primaryCtaRoute || "#specialty-grid");
  const secondaryHref = resolveRoute(
    locale,
    hero?.secondaryCtaRoute || "/book-appointment",
  );

  return (
    <section className="pub-band specialties-premium-hero">
      <div className="specialties-hero-deco" aria-hidden>
        <span className="specialties-hero-glow" />
        <span className="specialties-hero-ring" />
      </div>
      <div className="pub-container specialties-hero-grid">
        <SectionReveal from="start" className="specialties-hero-copy">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href={`/${locale}`}>{copy.navHome}</Link>
              </li>
              <li>
                <span>{copy.navSpecialties}</span>
              </li>
            </ol>
          </nav>
          <p className="section-kicker">{badge}</p>
          <h1>{title}</h1>
          <p className="pub-lead">{description}</p>
          <div className="cta-row specialties-hero-actions">
            {primaryHref.startsWith("#") ? (
              <a className="btn btn-primary" href={primaryHref}>
                {primaryLabel}
              </a>
            ) : (
              <Link className="btn btn-primary" href={primaryHref}>
                {primaryLabel}
              </Link>
            )}
            <Link className="btn btn-outline" href={secondaryHref}>
              {secondaryLabel}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.navContact}
            </Link>
          </div>
        </SectionReveal>

        <SectionReveal from="end" delayMs={80} className="specialties-hero-visual">
          <FloatingImage className="specialties-hero-float">
            <div className="specialties-hero-frame">
              <Image
                src={image}
                alt={alt}
                width={720}
                height={560}
                priority
                className="specialties-hero-image"
                sizes="(max-width: 900px) 92vw, 420px"
                unoptimized={image.startsWith("/api/media/")}
              />
              {labels.map((s, i) => (
                <span
                  key={s.slug}
                  className={`specialties-float-label specialties-float-label--${i + 1}`}
                >
                  {localizedSpecialtyName(locale, s)}
                </span>
              ))}
            </div>
          </FloatingImage>
        </SectionReveal>
      </div>
    </section>
  );
}
