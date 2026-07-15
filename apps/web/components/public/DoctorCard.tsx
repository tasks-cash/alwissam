import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicDoctor } from "../../lib/public-site";
import {
  localizedDoctorAvailability,
  localizedDoctorSpecialty,
} from "../../lib/public-site";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  doctor: PublicDoctor;
};

export function DoctorCard({ locale, copy, doctor }: Props) {
  const specialty = localizedDoctorSpecialty(locale, doctor);
  const availability = localizedDoctorAvailability(locale, doctor);
  const bio =
    locale === "en"
      ? doctor.bioEn || doctor.bioAr
      : locale === "fr"
        ? doctor.bioFr || doctor.bioEn || doctor.bioAr
        : doctor.bioAr || doctor.bioEn;

  return (
    <article className="pub-doctor">
      <div className="doctor-avatar" aria-hidden>
        {doctor.fullName.slice(0, 1)}
      </div>
      <div>
        <h3>{doctor.fullName}</h3>
        {specialty ? <p className="pub-specialty-badge">{specialty}</p> : null}
        {doctor.type ? <p className="muted">{doctor.type}</p> : null}
        {bio ? <p className="pub-doctor-bio">{bio}</p> : null}
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
