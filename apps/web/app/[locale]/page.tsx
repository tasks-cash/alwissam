import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePageContent } from "../../components/public/pages/HomePageContent";
import { PublicChrome } from "../../components/public/PublicChrome";
import { isLocale, locales, type Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import {
  fetchPublicBeforeAfter,
  fetchPublicDoctors,
  fetchPublicPatientExperiences,
  fetchPublicServicesCatalog,
  fetchPublicSite,
  fetchPublicSpecialties,
  localizedAbout,
  localizedClinicName,
  localizedWorkingHours,
} from "../../lib/public-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const about = localizedAbout(locale, site.content) || dict.homeLead;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}`]),
  ) as Record<string, string>;

  return {
    title: name,
    description: about.slice(0, 160),
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      title: name,
      description: about.slice(0, 160),
      locale,
      type: "website",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, doctors, experiences, beforeAfterCases, specialtyRes, serviceRes] =
    await Promise.all([
      fetchPublicSite(),
      fetchPublicDoctors(),
      fetchPublicPatientExperiences({ locale, limit: 10 }),
      fetchPublicBeforeAfter({ locale, featured: true, limit: 10 }),
      fetchPublicSpecialties({ locale, featured: true, limit: 6 }),
      fetchPublicServicesCatalog({ locale, featured: true, limit: 8 }),
    ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const about = localizedAbout(locale, site.content) || dict.homeLead;
  const hours = localizedWorkingHours(locale, site.clinic);
  const specialties =
    specialtyRes.specialties.length > 0
      ? specialtyRes.specialties
      : (await fetchPublicSpecialties({ locale, limit: 6 })).specialties;
  const services =
    serviceRes.services.length > 0
      ? serviceRes.services
      : (await fetchPublicServicesCatalog({ locale, limit: 8 })).services;
  const faqs = site.content?.faqs || [];

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
      <HomePageContent
        locale={locale}
        dict={dict}
        copy={copy}
        brandName={name}
        about={about}
        hours={hours}
        clinic={site.clinic}
        doctors={doctors}
        specialties={specialties}
        services={services}
        faqs={faqs}
        experiences={experiences}
        beforeAfterCases={beforeAfterCases}
      />
    </PublicChrome>
  );
}
