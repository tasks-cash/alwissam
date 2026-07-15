import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DoctorCard } from "../../../components/public/DoctorCard";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
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
    featured: true,
    bookable: true,
    publicOnly: true,
    limit: 3,
  });

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
        title={copy.sectionDoctors}
        description={
          locale === "ar"
            ? "تعرّف على أطباء العيادة المميزين المتاحين للحجز."
            : locale === "fr"
              ? "Découvrez les médecins mis en avant disponibles pour la réservation."
              : "Meet featured clinic doctors available for booking."
        }
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navDoctors },
        ]}
        tone="mist"
      />
      <PublicSection>
        {doctors.length === 0 ? (
          <div className="empty-state card-surface">
            <p>{copy.emptyDoctors}</p>
          </div>
        ) : (
          <div className="pub-doctor-grid">
            {doctors.map((d) => (
              <DoctorCard key={d.id} locale={locale} copy={copy} doctor={d} />
            ))}
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}
