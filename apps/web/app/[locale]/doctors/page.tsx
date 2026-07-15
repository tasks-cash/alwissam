import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicDoctorsGrid } from "../../../components/public/PublicDoctorsGrid";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
  fetchPublicSite,
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
    path: "/doctors",
    title: titleSegment(locale, "doctors"),
    description:
      locale === "en"
        ? "Meet the doctors at Al Wissam Dental Clinic and book with the clinician who fits your needs."
        : locale === "fr"
          ? "Découvrez les médecins de la Clinique Dentaire El Wissam et prenez rendez-vous avec le clinicien adapté."
          : "تعرّف على أطباء عيادة الوسام لطب الأسنان واحجز مع الطبيب المناسب لحالتك.",
  });
}

export default async function DoctorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const doctors = await fetchPublicDoctors({
    bookable: true,
    publicOnly: true,
    limit: 24,
  });

  const heroDescription =
    locale === "ar"
      ? "تعرّف على فريق عيادة الوسام واختر الطبيب المناسب للخدمة والموعد الذي تحتاجه."
      : locale === "fr"
        ? "Découvrez l’équipe de la Clinique El Wissam et choisissez le médecin adapté au soin et au rendez-vous dont vous avez besoin."
        : "Meet the Al Wissam clinic team and choose the right doctor for the care and appointment you need.";

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
        title={locale === "ar" ? "أطباؤنا" : copy.sectionDoctors}
        description={heroDescription}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navDoctors },
        ]}
        tone="mist"
      />
      <PublicSection>
        <PublicDoctorsGrid locale={locale} copy={copy} doctors={doctors} />
        <div className="doctors-section-footer cta-row">
          <a className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.navBook}
          </a>
          <a className="btn btn-outline" href={`/${locale}/contact`}>
            {copy.navContact}
          </a>
        </div>
      </PublicSection>
    </PublicChrome>
  );
}
