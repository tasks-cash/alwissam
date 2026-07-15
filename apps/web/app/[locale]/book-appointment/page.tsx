import { notFound } from "next/navigation";
import { AppointmentWizard } from "../../../components/public/AppointmentWizard";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import { contextualWhatsAppMessage } from "../../../lib/clinic-contact";
import {
  fetchPublicDoctors,
  fetchPublicServicesCatalog,
  fetchPublicSite,
  fetchPublicSpecialties,
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
    service?: string;
    date?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const { doctor, specialty, service, date } = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, doctors, specialtyRes, serviceRes] = await Promise.all([
    fetchPublicSite(),
    fetchPublicDoctors(),
    fetchPublicSpecialties({ locale, limit: 48 }),
    fetchPublicServicesCatalog({
      locale,
      specialty: specialty || undefined,
      limit: 48,
    }),
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
      whatsappMessage={contextualWhatsAppMessage(locale, { kind: "booking" })}
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
            specialties={specialtyRes.specialties}
            services={serviceRes.services}
            preselectedDoctorId={doctor}
            preselectedSpecialty={specialty}
            preselectedService={service}
            preselectedDate={date}
          />
        </div>
      </PublicSection>
    </PublicChrome>
  );
}
