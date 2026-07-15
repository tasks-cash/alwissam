import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorCard } from "../../../../components/public/DoctorCard";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
import { ServiceCard } from "../../../../components/public/ServiceCard";
import { SpecialtyPatientJourney } from "../../../../components/public/SpecialtyPatientJourney";
import { FloatingImage } from "../../../../components/public/motion/FloatingImage";
import { SectionReveal } from "../../../../components/public/motion/SectionReveal";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import { contextualWhatsAppMessage } from "../../../../lib/clinic-contact";
import {
  fetchPublicSite,
  fetchPublicSpecialty,
  localizedClinicName,
  localizedSpecialtyDesc,
  localizedSpecialtyName,
  localizedWorkingHours,
} from "../../../../lib/public-site";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../../lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const detail = await fetchPublicSpecialty(slug, locale);
  if (!detail) {
    return buildPublicMetadata({
      locale,
      path: `/specialties/${slug}`,
      title: titleSegment(locale, "notFound"),
      description:
        locale === "en"
          ? "Specialty not found."
          : locale === "fr"
            ? "Spécialité introuvable."
            : "التخصص غير موجود.",
    });
  }
  const title = localizedSpecialtyName(locale, detail.specialty);
  const description = localizedSpecialtyDesc(locale, detail.specialty).slice(
    0,
    160,
  );
  return buildPublicMetadata({
    locale,
    path: `/specialties/${slug}`,
    title,
    description,
  });
}

export default async function SpecialtyDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, detail] = await Promise.all([
    fetchPublicSite(),
    fetchPublicSpecialty(slug, locale),
  ]);
  if (!detail) notFound();
  const { specialty, services, doctors } = detail;
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const title = localizedSpecialtyName(locale, specialty);
  const description = localizedSpecialtyDesc(locale, specialty);
  const bookHref = `/${locale}/book-appointment?specialty=${encodeURIComponent(specialty.slug)}`;
  const alt =
    locale === "en"
      ? `${title} specialty`
      : locale === "fr"
        ? `Spécialité ${title}`
        : `تخصص ${title}`;

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      clinic={site.clinic}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
      hours={hours}
      whatsappMessage={contextualWhatsAppMessage(locale, {
        kind: "specialty",
        name: title,
      })}
    >
      <section className="pub-band specialty-detail-hero">
        <div className="pub-container specialty-detail-hero-grid">
          <SectionReveal from="start" className="specialty-detail-hero-copy">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href={`/${locale}`}>{copy.navHome}</Link>
                </li>
                <li>
                  <Link href={`/${locale}/specialties`}>{copy.navSpecialties}</Link>
                </li>
                <li>
                  <span>{title}</span>
                </li>
              </ol>
            </nav>
            <p className="section-kicker">{copy.specialtyRelatedLabel}</p>
            <h1>{title}</h1>
            {description ? <p className="pub-lead">{description}</p> : null}
            <div className="specialty-detail-stats">
              <article>
                <strong>{specialty.serviceCount ?? services.length}</strong>
                <span>{copy.serviceCountLabel}</span>
              </article>
              <article>
                <strong>{specialty.doctorCount ?? doctors.length}</strong>
                <span>{copy.doctorCountLabel}</span>
              </article>
            </div>
            <div className="cta-row">
              <Link className="btn btn-primary" href={bookHref}>
                {copy.relatedCta}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/contact`}>
                {copy.navContact}
              </Link>
            </div>
          </SectionReveal>

          <SectionReveal from="end" delayMs={70} className="specialty-detail-hero-media">
            <FloatingImage>
              <div className="specialty-detail-media-frame">
                {specialty.image ? (
                  <Image
                    src={specialty.image}
                    alt={alt}
                    width={720}
                    height={560}
                    priority
                    className="specialty-detail-image"
                    unoptimized
                    sizes="(max-width: 900px) 92vw, 420px"
                  />
                ) : (
                  <Image
                    src="/images/hero-clinic.svg"
                    alt={alt}
                    width={720}
                    height={560}
                    priority
                    className="specialty-detail-image"
                    sizes="(max-width: 900px) 92vw, 420px"
                  />
                )}
              </div>
            </FloatingImage>
          </SectionReveal>
        </div>
      </section>

      <PublicSection>
        <SectionReveal>
          <div className="specialty-overview card-surface">
            <h2>{copy.specialtyOverviewTitle}</h2>
            {description ? <p>{description}</p> : null}
            <p className="muted">{copy.specialtyDoctorDecidesNote}</p>
          </div>
        </SectionReveal>
      </PublicSection>

      <PublicSection tone="soft">
        <SectionReveal>
          <div className="section-head">
            <div>
              <p className="section-kicker">{copy.specialtyRelatedLabel}</p>
              <h2>{copy.specialtyLinkedServicesTitle}</h2>
              <p className="pub-lead">{copy.specialtyLinkedServicesLead}</p>
            </div>
          </div>
          {services.length === 0 ? (
            <p className="muted empty-state">{copy.emptyServices}</p>
          ) : (
            <div className="service-card-grid service-card-grid--premium">
              {services.map((s, i) => (
                <ServiceCard
                  key={s.slug}
                  locale={locale}
                  copy={copy}
                  service={s}
                  index={i}
                  specialtySlug={specialty.slug}
                />
              ))}
            </div>
          )}
        </SectionReveal>
      </PublicSection>

      <PublicSection>
        <SectionReveal>
          <div className="section-head">
            <div>
              <h2>{copy.sectionDoctors}</h2>
              <p className="pub-lead">{copy.sectionDoctorsLead}</p>
            </div>
            <Link href={`/${locale}/doctors`}>{copy.viewDoctorsCta}</Link>
          </div>
          {doctors.length === 0 ? (
            <p className="muted empty-state">{copy.emptyDoctors}</p>
          ) : (
            <div className="pub-doctors-grid specialty-doctors-grid">
              {doctors.map((d, i) => (
                <DoctorCard
                  key={d.id}
                  locale={locale}
                  copy={copy}
                  doctor={{
                    ...d,
                    isBookable: d.isBookable !== false,
                  }}
                  large={false}
                  index={i}
                />
              ))}
            </div>
          )}
        </SectionReveal>
      </PublicSection>

      <PublicSection tone="mist">
        <SpecialtyPatientJourney locale={locale} copy={copy} />
      </PublicSection>

      <PublicSection>
        <SectionReveal>
          <div className="specialty-book-panel card-surface">
            <h2>{copy.specialtyBookPanelTitle}</h2>
            <p className="pub-lead">{copy.specialtyBookPanelLead}</p>
            <p className="specialty-disclaimer muted">
              {copy.medicalTreatmentDisclaimer}
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" href={bookHref}>
                {copy.relatedCta}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/doctors`}>
                {copy.viewDoctorsCta}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/contact`}>
                {copy.navContact}
              </Link>
            </div>
          </div>
        </SectionReveal>
      </PublicSection>
    </PublicChrome>
  );
}
