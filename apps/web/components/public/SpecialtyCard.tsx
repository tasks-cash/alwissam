import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicSpecialty } from "../../lib/public-site";
import { localizedSpecialtyDesc, localizedSpecialtyName } from "../../lib/public-site";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  specialty: PublicSpecialty;
  doctorCount?: number;
};

export function SpecialtyCard({ locale, copy, specialty, doctorCount }: Props) {
  const name = localizedSpecialtyName(locale, specialty);
  const desc = localizedSpecialtyDesc(locale, specialty);

  return (
    <article className="pub-tile specialty-card">
      <span className="specialty-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path
            d="M12 3v18M7 10l5-5 5 5M8 14h8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <h3>{name}</h3>
      {desc ? <p>{desc}</p> : null}
      {typeof doctorCount === "number" ? (
        <p className="muted">
          {doctorCount} {copy.doctorCountLabel}
        </p>
      ) : null}
      <div className="cta-row">
        <Link href={`/${locale}/specialties/${specialty.slug}`}>
          {locale === "en" ? "Details" : locale === "fr" ? "Détails" : "التفاصيل"}
        </Link>
        <Link
          className="btn btn-primary"
          href={`/${locale}/book-appointment?specialty=${encodeURIComponent(name)}`}
        >
          {copy.navBook}
        </Link>
      </div>
    </article>
  );
}
