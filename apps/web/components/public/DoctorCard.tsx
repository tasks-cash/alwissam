import Image from "next/image";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
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
};

export function DoctorCard({ locale, copy, doctor, large = true }: Props) {
  const specialty = localizedDoctorSpecialty(locale, doctor);
  const availability = localizedDoctorAvailability(locale, doctor);
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
  const workingDays = (doctor.workingHours || [])
    .filter((d) => d?.isActive !== false && d?.dayOfWeek)
    .map((d) => d.dayOfWeek)
    .filter((v, i, arr) => arr.indexOf(v) === i);
  const daysSummary = workingDays.length
    ? workingDays.join(locale === "ar" ? " · " : " · ")
    : "";

  return (
    <article
      className={`pub-doctor pub-doctor-portrait${large ? " pub-doctor-large" : ""}`}
    >
      <div className="doctor-portrait-media">
        <div
          className={`doctor-avatar portrait${doctor.profileImage ? " has-photo" : ""}`}
          aria-hidden={doctor.profileImage ? undefined : true}
        >
          {doctor.profileImage ? (
            <Image
              src={doctor.profileImage}
              alt=""
              width={480}
              height={560}
              className="doctor-photo"
              unoptimized
              sizes="(max-width: 700px) 90vw, 320px"
            />
          ) : (
            <span className="doctor-initial">{doctor.fullName.slice(0, 1)}</span>
          )}
        </div>
        {specialty ? (
          <span className="pub-specialty-badge doctor-specialty-overlap">
            {specialty}
          </span>
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

        {(availability || daysSummary) ? (
          <div className="doctor-schedule-block">
            {daysSummary ? (
              <p className="pub-availability">
                {locale === "en"
                  ? "Working days"
                  : locale === "fr"
                    ? "Jours de travail"
                    : "أيام العمل"}
                : {daysSummary}
              </p>
            ) : null}
            {availability ? (
              <p className="pub-availability">
                {copy.availabilityLabel}: {availability}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="cta-row doctor-card-actions">
          <Link
            className="btn btn-outline"
            href={`/${locale}/doctors/${doctor.id}`}
          >
            {copy.viewProfile}
          </Link>
          <Link
            className="btn btn-primary"
            href={`/${locale}/book-appointment?doctor=${doctor.id}`}
          >
            {copy.bookWithDoctor}
          </Link>
        </div>
      </div>
    </article>
  );
}
