import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import { localizedDoctorScheduleSummary } from "../../lib/doctor-schedule";
import type { PublicDoctor } from "../../lib/public-site";
import {
  localizedDoctorAvailability,
  localizedDoctorSpecialty,
  pickLocalized,
} from "../../lib/public-site";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  doctor: PublicDoctor;
  large?: boolean;
  /** Optional stagger index for list animations (0-based). */
  index?: number;
};

export function DoctorCard({
  locale,
  copy,
  doctor,
  large = true,
  index = 0,
}: Props) {
  const specialty = localizedDoctorSpecialty(locale, doctor);
  const availability = localizedDoctorAvailability(locale, doctor);
  const schedule = localizedDoctorScheduleSummary(locale, doctor);
  const bio = pickLocalized(locale, doctor.bioAr, doctor.bioEn, doctor.bioFr);
  const title = pickLocalized(
    locale,
    doctor.professionalTitleAr,
    doctor.professionalTitleEn,
    doctor.professionalTitleFr,
  );
  const languages =
    Array.isArray(doctor.languages) && doctor.languages.length
      ? doctor.languages.join(" · ")
      : "";
  const languagesLabel =
    locale === "en" ? "Languages" : locale === "fr" ? "Langues" : "اللغات";

  const profileAria =
    locale === "en"
      ? `View profile for Doctor ${doctor.fullName}`
      : locale === "fr"
        ? `Voir le profil du Dr ${doctor.fullName}`
        : `عرض ملف الطبيب ${doctor.fullName}`;
  const bookAria =
    locale === "en"
      ? `Book an appointment with Doctor ${doctor.fullName}`
      : locale === "fr"
        ? `Prendre rendez-vous avec le Dr ${doctor.fullName}`
        : `حجز موعد مع الطبيب ${doctor.fullName}`;

  const delayMs = Math.min(index, 8) * 70;

  return (
    <article
      className={`pub-doctor pub-doctor-portrait pub-doctor-premium doctor-card${large ? " pub-doctor-large" : ""}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="doctor-portrait-media">
        <div
          className={`doctor-avatar portrait${doctor.profileImage ? " has-photo" : ""}`}
          aria-hidden={doctor.profileImage ? undefined : true}
        >
          {doctor.profileImage ? (
            <Image
              src={doctor.profileImage}
              alt={doctor.fullName}
              width={480}
              height={560}
              className="doctor-photo"
              unoptimized
              sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 320px"
            />
          ) : (
            <span className="doctor-initial" aria-hidden>
              {doctor.fullName.slice(0, 1)}
            </span>
          )}
          <span className="doctor-portrait-gradient" aria-hidden />
        </div>
        {specialty ? (
          <p className="pub-specialty-chip doctor-specialty-overlap">
            {specialty}
          </p>
        ) : null}
      </div>

      <div className="pub-doctor-body">
        <h3>{doctor.fullName}</h3>
        {title ? <p className="pub-doctor-title">{title}</p> : null}
        {bio ? <p className="pub-doctor-bio">{bio}</p> : null}
        {languages ? (
          <p className="pub-doctor-langs muted">
            {languagesLabel}: <span dir="ltr">{languages}</span>
          </p>
        ) : null}

        <div className="doctor-schedule-block">
          <p className="pub-availability">{schedule}</p>
          {availability ? (
            <p className="pub-availability pub-availability--note">
              {copy.availabilityLabel}: {availability}
            </p>
          ) : null}
        </div>

        <div className="cta-row doctor-card-actions">
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctors/${doctor.id}`}
            aria-label={profileAria}
          >
            {copy.viewProfile}
          </Link>
          {doctor.isBookable !== false ? (
            <Link
              className="btn btn-primary"
              href={`/${locale}/book-appointment?doctor=${doctor.id}`}
              aria-label={bookAria}
            >
              {copy.bookWithDoctor}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
