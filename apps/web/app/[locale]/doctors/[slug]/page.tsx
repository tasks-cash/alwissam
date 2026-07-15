import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { PublicSection } from "../../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import { contextualWhatsAppMessage } from "../../../../lib/clinic-contact";
import {
  fetchPublicDoctor,
  fetchPublicSite,
  localizedClinicName,
  localizedDoctorAvailability,
  localizedDoctorBio,
  localizedDoctorSpecialty,
  localizedWorkingHours,
} from "../../../../lib/public-site";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../../lib/seo/page-metadata";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const doctor = await fetchPublicDoctor(slug);
  if (!doctor) {
    return buildPublicMetadata({
      locale,
      path: `/doctors/${slug}`,
      title: titleSegment(locale, "notFound"),
      description:
        locale === "en"
          ? "Doctor profile not found."
          : locale === "fr"
            ? "Profil médecin introuvable."
            : "ملف الطبيب غير موجود.",
    });
  }
  const doctorTitle =
    locale === "en"
      ? doctor.fullName
      : locale === "fr"
        ? doctor.fullName
        : doctor.fullName.startsWith("الدكتور")
          ? doctor.fullName
          : `الدكتور ${doctor.fullName}`;
  return buildPublicMetadata({
    locale,
    path: `/doctors/${slug}`,
    title: doctorTitle,
    description:
      (locale === "en"
        ? doctor.bioEn || doctor.bioAr
        : locale === "fr"
          ? doctor.bioFr || doctor.bioEn || doctor.bioAr
          : doctor.bioAr || doctor.bioEn) ||
      (locale === "en"
        ? "Public doctor profile at Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Profil public d’un médecin de la Clinique Dentaire El Wissam."
          : "الملف العام لطبيب في عيادة الوسام لطب الأسنان."),
  });
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, doctor] = await Promise.all([
    fetchPublicSite(),
    fetchPublicDoctor(slug),
  ]);
  if (!doctor) notFound();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const availability = localizedDoctorAvailability(locale, doctor);
  const schedule = (doctor.workingHours || []).filter((h) => h.isActive !== false);

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
      whatsappMessage={contextualWhatsAppMessage(locale, {
        kind: "doctor",
        name: doctor.fullName,
      })}
    >
      <PublicSection>
        <div className="doctor-profile">
          <div className="doctor-avatar xl" aria-hidden>
            {doctor.fullName.slice(0, 1)}
          </div>
          <div>
            <p className="section-kicker">{copy.navDoctors}</p>
            <h1>{doctor.fullName}</h1>
            <p className="pub-lead">{localizedDoctorSpecialty(locale, doctor)}</p>
            <p>{localizedDoctorBio(locale, doctor) || dict.brandSubtitle}</p>
            {availability ? (
              <p className="pub-availability">
                {copy.availabilityLabel}: {availability}
              </p>
            ) : null}
            {schedule.length > 0 ? (
              <ul className="contact-list" style={{ marginTop: "1rem" }}>
                {schedule.map((h, i) => (
                  <li key={i} dir="ltr">
                    {h.dayOfWeek}: {h.startTime} – {h.endTime}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="cta-row" style={{ marginTop: "1.25rem" }}>
              <Link
                className="btn btn-primary"
                href={`/${locale}/book-appointment?doctor=${doctor.id}`}
              >
                {copy.bookWithDoctor}
              </Link>
              <Link className="btn btn-outline" href={`/${locale}/doctors`}>
                {copy.allDoctors}
              </Link>
            </div>
          </div>
        </div>
      </PublicSection>
    </PublicChrome>
  );
}
