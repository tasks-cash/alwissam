import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPageContent } from "../../../components/public/pages/AboutPageContent";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { isLocale, locales, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  contentField,
  fetchPublicDoctors,
  fetchPublicSite,
  localizedAbout,
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
  const site = await fetchPublicSite();
  const about = localizedAbout(locale, site.content) || copy.aboutHeroTitle;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `/${l}/about`]),
  ) as Record<string, string>;
  return {
    title: copy.navAbout,
    description: about.slice(0, 160),
    alternates: { canonical: `/${locale}/about`, languages },
    openGraph: {
      title: copy.aboutHeroTitle,
      description: about.slice(0, 160),
      locale,
      type: "website",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, doctors] = await Promise.all([
    fetchPublicSite(),
    fetchPublicDoctors(),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const about = localizedAbout(locale, site.content) || dict.homeLead;
  const mission = contentField(locale, site.content, "mission");
  const specialties = site.content?.specialties || [];

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
      <AboutPageContent
        locale={locale}
        copy={copy}
        brandName={name}
        about={about}
        mission={mission}
        hours={hours}
        clinic={site.clinic}
        doctors={doctors}
        specialties={specialties}
      />
    </PublicChrome>
  );
}
