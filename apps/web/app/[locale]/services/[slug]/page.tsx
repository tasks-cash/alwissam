import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../../components/public/PageHero";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
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
            : "الخدمة غير موجودة.",
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
          { label: title },
        ]}
      />
      <PublicSection>
        {service.requiresConsultation ? (
          <p className="service-badge">{copy.consultationRequired}</p>
        ) : null}
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
        <p className="pub-lead">{copy.medicalTreatmentDisclaimer}</p>
        <div className="cta-row">
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment?service=${encodeURIComponent(service.slug)}`}
          >
            {copy.relatedCta}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/contact`}>
            {copy.navContact}
          </Link>
        </div>
      </PublicSection>
      <PublicSection tone="mist">
        <h2>{copy.sectionDoctors}</h2>
        {doctors.length === 0 ? (
          <p className="muted">{copy.emptyDoctors}</p>
        ) : (
          <div className="pub-tile-grid pub-tile-grid-3">
            {doctors.map((d) => (
              <article key={d.id} className="pub-tile">
                <h3>{d.fullName}</h3>
                <Link
                  className="btn btn-primary"
                  href={`/${locale}/book-appointment?doctor=${d.id}&service=${encodeURIComponent(service.slug)}`}
                >
                  {copy.bookWithDoctor}
                </Link>
              </article>
            ))}
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}
