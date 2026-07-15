import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogSearch } from "../../../components/public/CatalogSearch";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { ServiceCard } from "../../../components/public/ServiceCard";
import { isLocale, locales, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicServicesCatalog,
  fetchPublicSite,
  fetchPublicSpecialties,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = getPublicCopy(locale);
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}/services`]),
  ) as Record<string, string>;
  return {
    title: copy.sectionDentalServices,
    description: copy.sectionDentalServicesLead.slice(0, 160),
    alternates: { canonical: `/${locale}/services`, languages },
    openGraph: {
      title: copy.sectionDentalServices,
      description: copy.sectionDentalServicesLead.slice(0, 160),
      locale,
    },
  };
}

export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; specialty?: string; page?: string }>;
}) {
  const { locale: raw } = await params;
  const { q, specialty, page: pageRaw } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const page = Math.max(1, Number(pageRaw) || 1);
  const [site, specialtiesRes, servicesRes] = await Promise.all([
    fetchPublicSite(),
    fetchPublicSpecialties({ locale, limit: 48 }),
    fetchPublicServicesCatalog({
      locale,
      specialty: specialty || undefined,
      search: q || undefined,
      limit: 24,
      page,
    }),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);

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
    >
      <PageHero
        title={copy.sectionDentalServices}
        description={copy.sectionDentalServicesLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navServices },
        ]}
      />
      <PublicSection tone="soft" className="dental-services-section">
        <CatalogSearch
          locale={locale}
          placeholder={copy.searchSpecialtyService}
          basePath={`/${locale}/services`}
          initialQuery={q || ""}
          specialtyOptions={specialtiesRes.specialties.map((s) => ({
            slug: s.slug,
            label: s.name || s.nameAr || s.slug,
          }))}
          initialSpecialty={specialty || ""}
        />
        {servicesRes.services.length === 0 ? (
          <div className="empty-state card-surface">
            <p>{copy.emptyServices}</p>
          </div>
        ) : (
          <div className="service-card-grid">
            {servicesRes.services.map((s) => (
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
    </PublicChrome>
  );
}
