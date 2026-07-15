import type { Metadata } from "next";
import Image from "next/image";
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
  pickLocalized,
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
  const dayLabels: Record<string, string> =
    locale === "en"
      ? {
          SATURDAY: "Saturday",
          SUNDAY: "Sunday",
          MONDAY: "Monday",
          TUESDAY: "Tuesday",
          WEDNESDAY: "Wednesday",
          THURSDAY: "Thursday",
          FRIDAY: "Friday",
        }
      : locale === "fr"
        ? {
            SATURDAY: "Samedi",
            SUNDAY: "Dimanche",
            MONDAY: "Lundi",
            TUESDAY: "Mardi",
            WEDNESDAY: "Mercredi",
            THURSDAY: "Jeudi",
            FRIDAY: "Vendredi",
          }
        : {
            SATURDAY: "السبت",
            SUNDAY: "الأحد",
            MONDAY: "الإثنين",
            TUESDAY: "الثلاثاء",
            WEDNESDAY: "الأربعاء",
            THURSDAY: "الخميس",
            FRIDAY: "الجمعة",
          };

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
          <div
            className={`doctor-avatar xl${doctor.profileImage ? " has-photo" : ""}`}
            aria-hidden={doctor.profileImage ? undefined : true}
          >
            {doctor.profileImage ? (
              <Image
                src={doctor.profileImage}
                alt={doctor.fullName}
                width={160}
                height={160}
                className="doctor-photo"
                priority
                unoptimized
              />
            ) : (
              doctor.fullName.slice(0, 1)
            )}
          </div>
          <div>
            <p className="section-kicker">{copy.navDoctors}</p>
            <h1>{doctor.fullName}</h1>
            <p className="pub-lead">{localizedDoctorSpecialty(locale, doctor)}</p>
            {pickLocalized(
              locale,
              doctor.professionalTitleAr,
              doctor.professionalTitleEn,
              doctor.professionalTitleFr,
            ) ? (
              <p className="muted">
                {pickLocalized(
                  locale,
                  doctor.professionalTitleAr,
                  doctor.professionalTitleEn,
                  doctor.professionalTitleFr,
                )}
              </p>
            ) : null}
            <p>{localizedDoctorBio(locale, doctor) || dict.brandSubtitle}</p>
            {Array.isArray(doctor.languages) && doctor.languages.length ? (
              <p className="pub-doctor-langs muted">
                {locale === "en"
                  ? "Languages"
                  : locale === "fr"
                    ? "Langues"
                    : "اللغات"}
                : <span dir="ltr">{doctor.languages.join(" · ")}</span>
              </p>
            ) : null}
            {availability ? (
              <p className="pub-availability">
                {copy.availabilityLabel}: {availability}
              </p>
            ) : null}
            <div className="doctor-schedule-block">
              <h2 className="doctor-schedule-title">
                {locale === "en"
                  ? "Working schedule"
                  : locale === "fr"
                    ? "Horaires"
                    : "جدول المواعيد"}
              </h2>
              {schedule.length > 0 ? (
                <ul className="doctor-schedule-list">
                  {schedule.map((h, i) => (
                    <li key={i}>
                      <span className="doctor-schedule-day">
                        {dayLabels[h.dayOfWeek] || h.dayOfWeek}
                      </span>
                      <span className="doctor-schedule-time" dir="ltr">
                        {h.startTime} – {h.endTime}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">{copy.doctorNoSchedule}</p>
              )}
            </div>
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
