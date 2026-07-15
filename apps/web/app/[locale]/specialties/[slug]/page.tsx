import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../../components/public/PageHero";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
import { ServiceCard } from "../../../../components/public/ServiceCard";
import { isLocale, locales, type Locale } from "../../../../lib/i18n/config";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const detail = await fetchPublicSpecialty(slug, locale);
  if (!detail) return {};
  const title = localizedSpecialtyName(locale, detail.specialty);
  const description = localizedSpecialtyDesc(locale, detail.specialty).slice(
    0,
    160,
  );
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}/specialties/${slug}`]),
  ) as Record<string, string>;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/specialties/${slug}`, languages },
    openGraph: { title, description, locale },
  };
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
      <PageHero
        title={title}
        description={localizedSpecialtyDesc(locale, specialty)}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { href: `/${locale}/specialties`, label: copy.navSpecialties },
          { label: title },
        ]}
        tone="mist"
      />
      <PublicSection>
        <div className="cta-row">
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment?specialty=${encodeURIComponent(specialty.slug)}`}
          >
            {copy.relatedCta}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/contact`}>
            {copy.navContact}
          </Link>
        </div>
      </PublicSection>
      <PublicSection tone="soft">
        <h2>{copy.sectionDentalServices}</h2>
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
      </PublicSection>
      <PublicSection>
        <h2>{copy.sectionDoctors}</h2>
        {doctors.length === 0 ? (
          <p className="muted">{copy.emptyDoctors}</p>
        ) : (
          <div className="pub-tile-grid pub-tile-grid-3">
            {doctors.map((d) => (
              <article key={d.id} className="pub-tile">
                <h3>{d.fullName}</h3>
                <Link href={`/${locale}/doctors/${d.id}`}>
                  {copy.viewProfile}
                </Link>
                <Link
                  className="btn btn-primary"
                  href={`/${locale}/book-appointment?doctor=${d.id}&specialty=${encodeURIComponent(specialty.slug)}`}
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
