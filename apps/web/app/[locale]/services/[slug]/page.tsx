import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DoctorCard } from "../../../../components/public/DoctorCard";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
import { PageHero } from "../../../../components/public/PageHero";
import { SectionReveal } from "../../../../components/public/motion/SectionReveal";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import { contextualWhatsAppMessage } from "../../../../lib/clinic-contact";
import {
  fetchPublicServiceDetail,
  fetchPublicSite,
  localizedClinicName,
  localizedServiceDesc,
  localizedServiceName,
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
  const detail = await fetchPublicServiceDetail(slug, locale);
  if (!detail) {
    return buildPublicMetadata({
      locale,
      path: `/services/${slug}`,
      title: titleSegment(locale, "notFound"),
      description:
        locale === "en"
          ? "Service not found."
          : locale === "fr"
            ? "Service introuvable."
            : "الخدمة غير موجود.",
    });
  }
  const title = localizedServiceName(locale, detail.service);
  const description = (
    detail.service.description ||
    localizedServiceDesc(locale, detail.service)
  ).slice(0, 160);
  return buildPublicMetadata({
    locale,
    path: `/services/${slug}`,
    title,
    description,
  });
}

export default async function ServiceDetailPage({
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
    fetchPublicServiceDetail(slug, locale),
  ]);
  if (!detail) notFound();
  const { service, doctors } = detail;
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const title = localizedServiceName(locale, service);
  const description =
    service.description || localizedServiceDesc(locale, service);
  const parent = service.specialties?.[0];
  const bookParams = new URLSearchParams({ service: service.slug });
  if (parent?.slug) bookParams.set("specialty", parent.slug);
  const bookHref = `/${locale}/book-appointment?${bookParams.toString()}`;

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
        kind: "service",
        name: title,
      })}
    >
      <PageHero
        title={title}
        description={description}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { href: `/${locale}/services`, label: copy.navServices },
          ...(parent
            ? [
                {
                  href: `/${locale}/specialties/${parent.slug}`,
                  label: parent.name,
                },
              ]
            : []),
          { label: title },
        ]}
        tone="mist"
      />

      <PublicSection>
        <SectionReveal>
          <div className="service-detail-panel card-surface">
            <div className="service-detail-badges">
              {service.requiresConsultation ? (
                <p className="service-badge">{copy.consultationRequired}</p>
              ) : (
                <p className="service-badge service-badge--ok">
                  {copy.serviceAvailableLabel}
                </p>
              )}
              {typeof service.doctorCount === "number" ? (
                <p className="service-meta-chip">
                  <strong>{service.doctorCount}</strong> {copy.doctorCountLabel}
                </p>
              ) : null}
            </div>

            {service.specialties?.length ? (
              <p>
                {copy.parentSpecialtyLabel}:{" "}
                {service.specialties.map((s, i) => (
                  <span key={s.slug}>
                    {i > 0 ? " · " : ""}
                    <Link href={`/${locale}/specialties/${s.slug}`}>{s.name}</Link>
                  </span>
                ))}
              </p>
            ) : null}

            {description ? <p className="pub-lead">{description}</p> : null}
            <p className="specialty-disclaimer muted">
              {copy.medicalTreatmentDisclaimer}
            </p>

            <div className="cta-row">
              <Link className="btn btn-primary" href={bookHref}>
                {copy.relatedCta}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/contact`}>
                {copy.navContact}
              </Link>
            </div>
          </div>
        </SectionReveal>
      </PublicSection>

      <PublicSection tone="mist">
        <SectionReveal>
          <h2>{copy.sectionDoctors}</h2>
          {doctors.length === 0 ? (
            <p className="muted">{copy.emptyDoctors}</p>
          ) : (
            <div className="pub-doctors-grid specialty-doctors-grid">
              {doctors.map((d, i) => (
                <DoctorCard
                  key={d.id}
                  locale={locale}
                  copy={copy}
                  doctor={{ ...d, isBookable: d.isBookable !== false }}
                  large={false}
                  index={i}
                />
              ))}
            </div>
          )}
        </SectionReveal>
      </PublicSection>
    </PublicChrome>
  );
}
