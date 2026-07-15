import { notFound } from "next/navigation";
import { AppointmentWizard } from "../../../components/public/AppointmentWizard";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicDoctors,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";

export default async function BookAppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    doctor?: string;
    specialty?: string;
    date?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const { doctor, specialty, date } = await searchParams;
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
      <PageHero
        title={copy.bookTitle}
        description={copy.bookLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navBook },
        ]}
      />
      <PublicSection tone="white">
        <div style={{ maxWidth: 760 }}>
          {hours ? (
            <p className="muted">
              {copy.hoursLabel}: {hours}
            </p>
          ) : null}
          <AppointmentWizard
            locale={locale}
            doctors={doctors}
            specialties={specialties}
            preselectedDoctorId={doctor}
            preselectedSpecialty={specialty}
            preselectedDate={date}
          />
        </div>
      </PublicSection>
    </PublicChrome>
  );
}
