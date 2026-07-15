import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPageContent } from "../../../components/public/pages/ContactPageContent";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { isLocale, locales, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
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
    locales.map((l) => [l, `/${l}/contact`]),
  ) as Record<string, string>;
  return {
    title: copy.navContact,
    description: copy.contactHeroLead,
    alternates: { canonical: `/${locale}/contact`, languages },
    openGraph: {
      title: copy.contactHeroTitle,
      description: copy.contactHeroLead,
      locale,
      type: "website",
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, doctors, specialtyRes, serviceRes] = await Promise.all([
    fetchPublicSite(),
    fetchPublicDoctors(),
    fetchPublicSpecialties({ locale, limit: 48 }),
    fetchPublicServicesCatalog({ locale, limit: 48 }),
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
      <ContactPageContent
        locale={locale}
        copy={copy}
        hours={hours}
        clinic={site.clinic}
        doctors={doctors}
        specialties={specialtyRes.specialties}
        services={serviceRes.services}
      />
    </PublicChrome>
  );
}
