import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { SpecialtyCard } from "../../../components/public/SpecialtyCard";
import { CatalogSearch } from "../../../components/public/CatalogSearch";
import { isLocale, locales, type Locale } from "../../../lib/i18n/config";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
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
  return buildPublicMetadata({
    locale,
    path: "/specialties",
    title: titleSegment(locale, "specialties"),
    description:
      locale === "en"
        ? "Explore dental specialties at Al Wissam Dental Clinic and choose the right path for your appointment."
        : locale === "fr"
          ? "Explorez les spécialités de la Clinique Dentaire El Wissam et choisissez le parcours adapté."
          : "استكشف تخصصات عيادة الوسام لطب الأسنان واختر المسار المناسب لحجز موعدك.",
  });
}


export default async function SpecialtiesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale: raw } = await params;
  const { q, page: pageRaw } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const page = Math.max(1, Number(pageRaw) || 1);
  const [site, catalog] = await Promise.all([
    fetchPublicSite(),
    fetchPublicSpecialties({ locale, limit: 24, page }),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const query = (q || "").trim().toLowerCase();
  const specialties = query
    ? catalog.specialties.filter((s) => {
        const blob = [s.nameAr, s.nameEn, s.nameFr, s.slug, s.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      })
    : catalog.specialties;

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
        title={copy.sectionSpecialties}
        description={copy.sectionSpecialtiesLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navSpecialties },
        ]}
        tone="mist"
      />
      <PublicSection>
        <CatalogSearch
          locale={locale}
          placeholder={copy.searchSpecialtyService}
          basePath={`/${locale}/specialties`}
          initialQuery={q || ""}
        />
        {specialties.length === 0 ? (
          <div className="empty-state card-surface">
            <p>{copy.emptySpecialties}</p>
          </div>
        ) : (
          <div className="pub-tile-grid pub-tile-grid-3">
            {specialties.map((s) => (
              <SpecialtyCard
                key={s.slug}
                locale={locale}
                copy={copy}
                specialty={s}
              />
            ))}
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}
