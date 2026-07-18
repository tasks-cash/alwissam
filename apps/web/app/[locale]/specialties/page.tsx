import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SpecialtiesExplorer } from "../../../components/public/SpecialtiesExplorer";
import { SpecialtiesPremiumHero } from "../../../components/public/SpecialtiesPremiumHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { PubBookingCta } from "../../../components/public/PubBookingCta";
import { SectionReveal } from "../../../components/public/motion/SectionReveal";
import { isLocale, type Locale } from "../../../lib/i18n/config";
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
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: raw } = await params;
  const { q } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, catalog] = await Promise.all([
    fetchPublicSite(),
    fetchPublicSpecialties({ locale, limit: 48, page: 1 }),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const specialties = catalog.specialties;
  const featured = specialties.filter((s) => s.isFeatured);
  const floating = featured.slice(0, 3);
  const floatLabels =
    floating.length > 0 ? floating : specialties.slice(0, 3);
  const hero =
    site.specialtiesPage?.published === false ? null : site.specialtiesPage;

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
      <SpecialtiesPremiumHero
        locale={locale}
        copy={copy}
        floatingLabels={floatLabels}
        hero={hero}
      />

      <PublicSection>
        <SectionReveal>
          <SpecialtiesExplorer
            locale={locale}
            copy={copy}
            specialties={specialties}
            initialQuery={q || ""}
          />
        </SectionReveal>
      </PublicSection>

      <PublicSection tone="soft">
        <SectionReveal>
          <div className="specialties-explain card-surface">
            <h2>{copy.specialtyLinkedServicesTitle}</h2>
            <p className="pub-lead">{copy.specialtyLinkedServicesLead}</p>
            <p className="muted">{copy.specialtyDoctorDecidesNote}</p>
          </div>
        </SectionReveal>
      </PublicSection>

      <PublicSection>
        <PubBookingCta locale={locale} copy={copy} />
      </PublicSection>
    </PublicChrome>
  );
}
