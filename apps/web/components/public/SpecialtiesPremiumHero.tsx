import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicSpecialty } from "../../lib/public-site";
import { localizedSpecialtyName } from "../../lib/public-site";
import { FloatingImage } from "./motion/FloatingImage";
import { SectionReveal } from "./motion/SectionReveal";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  floatingLabels: PublicSpecialty[];
};

export function SpecialtiesPremiumHero({
  locale,
  copy,
  floatingLabels,
}: Props) {
  const labels = floatingLabels.slice(0, 3);
  const alt =
    locale === "en"
      ? "Dental specialties at Al Wissam Dental Clinic"
      : locale === "fr"
        ? "Spécialités dentaires de la Clinique Dentaire El Wissam"
        : "تخصصات طب الأسنان في عيادة الوسام";

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
          <p className="section-kicker">{copy.navSpecialties}</p>
          <h1>{copy.specialtiesHeroTitle}</h1>
          <p className="pub-lead">{copy.specialtiesHeroLead}</p>
          <div className="cta-row specialties-hero-actions">
            <a className="btn btn-primary" href="#specialty-grid">
              {copy.browseSpecialtiesCta}
            </a>
            <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
              {copy.relatedCta}
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
                src="/images/hero-clinic.svg"
                alt={alt}
                width={720}
                height={560}
                priority
                className="specialties-hero-image"
                sizes="(max-width: 900px) 92vw, 420px"
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
