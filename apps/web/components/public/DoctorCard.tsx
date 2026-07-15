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
  const languages =
    Array.isArray(doctor.languages) && doctor.languages.length
      ? doctor.languages.join(" · ")
      : "";

  return (
    <article className={`pub-doctor${large ? " pub-doctor-large" : ""}`}>
      <div
        className={`doctor-avatar${large ? " lg" : ""}${doctor.profileImage ? " has-photo" : ""}`}
        aria-hidden={doctor.profileImage ? undefined : true}
      >
        {doctor.profileImage ? (
          <Image
            src={doctor.profileImage}
            alt=""
            width={large ? 120 : 52}
            height={large ? 120 : 52}
            className="doctor-photo"
            unoptimized
          />
        ) : (
          doctor.fullName.slice(0, 1)
        )}
      </div>
      <div className="pub-doctor-body">
        <h3>{doctor.fullName}</h3>
        {specialty ? <p className="pub-specialty-badge">{specialty}</p> : null}
        {bio ? <p className="pub-doctor-bio">{bio}</p> : null}
        {languages ? (
          <p className="pub-doctor-langs muted">
            {locale === "en"
              ? "Languages"
              : locale === "fr"
                ? "Langues"
                : "اللغات"}
            : <span dir="ltr">{languages}</span>
          </p>
        ) : null}
        {availability ? (
          <p className="pub-availability">
            {copy.availabilityLabel}: {availability}
          </p>
        ) : null}
        <div className="cta-row">
          <Link href={`/${locale}/doctors/${doctor.id}`}>{copy.viewProfile}</Link>
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
