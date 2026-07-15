import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactPageContent } from "../../../components/public/pages/ContactPageContent";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { isLocale, type Locale } from "../../../lib/i18n/config";
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
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";

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
    path: "/contact",
    title: titleSegment(locale, "contact"),
    description:
      locale === "en"
        ? "Contact Al Wissam Dental Clinic in Emir Abdelkader District, El Oued — send an inquiry or book an appointment with a clinic doctor."
        : locale === "fr"
          ? "Contactez la Clinique Dentaire El Wissam à la cité Emir Abdelkader, El Oued — envoyez une demande ou prenez rendez-vous avec un médecin."
          : "تواصل مع عيادة الوسام لطب الأسنان في حي الأمير عبد القادر بالوادي، وأرسل استفسارك أو احجز موعدًا مع أحد أطباء العيادة.",
  });
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
    fetchPublicDoctors({ bookable: true, publicOnly: true, limit: 5 }),
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
