import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePageContent } from "../../components/public/pages/HomePageContent";
import { PublicChrome } from "../../components/public/PublicChrome";
import { isLocale, locales, type Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
  fetchPublicReviews,
  fetchPublicSite,
  localizedAbout,
  localizedClinicName,
  localizedWorkingHours,
  verifiedReviews,
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
  const [site, doctors, apiReviews] = await Promise.all([
    fetchPublicSite(),
    fetchPublicDoctors(),
    fetchPublicReviews(6),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const about = localizedAbout(locale, site.content) || dict.homeLead;
  const hours = localizedWorkingHours(locale, site.clinic);
  const services = site.content?.services || [];
  const specialties = site.content?.specialties || [];
  const faqs = site.content?.faqs || [];
  const reviews = apiReviews.length
    ? apiReviews
    : verifiedReviews(site.content);

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
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
        reviews={reviews}
      />
    </PublicChrome>
  );
}
