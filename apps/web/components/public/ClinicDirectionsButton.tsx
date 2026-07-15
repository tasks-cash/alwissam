import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  href: string;
  className?: string;
  /** Visible button label; defaults to copy.directionsLabel */
  label?: string;
};

export function ClinicDirectionsButton({
  locale,
  copy,
  href,
  className = "btn btn-outline clinic-directions-btn",
  label,
}: Props) {
  if (!href) return null;
  const aria =
    locale === "en"
      ? "Open directions to Al Wissam Dental Clinic in Google Maps"
      : locale === "fr"
        ? "Ouvrir l’itinéraire vers la Clinique Dentaire El Wissam dans Google Maps"
        : "فتح اتجاهات الوصول إلى عيادة الوسام في خرائط Google";

  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
    >
      <span className="clinic-directions-icon" aria-hidden>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path
            d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
      <span className="clinic-directions-label-full">{label || copy.openDirectionsMaps}</span>
      <span className="clinic-directions-label-short">
        {copy.openDirectionsMapsShort || copy.heroDirections || copy.directionsLabel}
      </span>
    </a>
  );
}
