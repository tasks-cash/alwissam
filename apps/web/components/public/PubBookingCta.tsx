import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import {
  buildWhatsAppUrl,
  resolveClinicContact,
  type ClinicContact,
} from "../../lib/clinic-contact";
import { BidiSafeValue } from "./BidiSafeValue";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  clinic?: ClinicContact | null;
  hours?: string;
  brandName?: string;
};

/**
 * Premium full-width booking CTA band at the end of public marketing pages.
 * Uses clinic settings only — no invented contact details.
 */
export function PubBookingCta({
  locale,
  copy,
  clinic,
  hours,
  brandName,
}: Props) {
  const contact = resolveClinicContact(locale, clinic, brandName || "");
  const hourLines = (hours || contact.hours || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const daysLine =
    hourLines[0] ||
    (locale === "en"
      ? "Saturday to Thursday"
      : locale === "fr"
        ? "Du samedi au jeudi"
        : "من السبت إلى الخميس");
  const timeLine = hourLines[1] || "08:00–17:00";
  const waHref = contact.whatsappEnabled
    ? buildWhatsAppUrl(locale, clinic, undefined)
    : "";

  const title =
    locale === "en"
      ? "Your first step toward a healthier smile"
      : locale === "fr"
        ? "Votre premier pas vers un sourire plus sain"
        : "خطوتك الأولى نحو ابتسامة أكثر صحة";
  const lead =
    locale === "en"
      ? "Book from home, choose your doctor and time, or contact us to organize your visit."
      : locale === "fr"
        ? "Réservez depuis chez vous, choisissez le médecin et l’horaire, ou contactez-nous pour organiser votre visite."
        : "احجز موعدك من المنزل، واختر الطبيب والوقت المناسب لك، أو تواصل معنا لمساعدتك في تنظيم زيارتك.";

  const hoursBadge =
    locale === "en"
      ? "Clinic hours"
      : locale === "fr"
        ? "Horaires"
        : "ساعات العمل";
  const contactLabel =
    locale === "en"
      ? "Contact us"
      : locale === "fr"
        ? "Nous contacter"
        : "تواصل معنا";
  const waLabel =
    locale === "en"
      ? "WhatsApp"
      : locale === "fr"
        ? "WhatsApp"
        : "تواصل عبر واتساب";

  return (
    <div className="pub-cta-band pub-cta-band--premium">
      <div className="pub-cta-band-inner">
        <div className="pub-cta-band-copy">
          <span className="pub-cta-hours-badge">{hoursBadge}</span>
          <h2>{title}</h2>
          <p className="pub-cta-band-lead">{lead}</p>
          <ul className="pub-cta-meta">
            <li>{daysLine}</li>
            <li dir="ltr">{timeLine}</li>
            {contact.phoneDisplay ? (
              <li>
                <BidiSafeValue>{contact.phoneDisplay}</BidiSafeValue>
              </li>
            ) : null}
            {contact.address ? (
              <li className="pub-cta-address">{contact.address}</li>
            ) : null}
          </ul>
        </div>

        <div className="pub-cta-band-aside">
          <div className="pub-cta-visual" aria-hidden="true">
            <span className="pub-cta-visual-glow" />
            <span className="pub-cta-visual-mark" />
          </div>
          <div className="pub-cta-band-actions">
            <Link
              className="btn btn-primary btn-on-green"
              href={`/${locale}/book-appointment`}
            >
              {copy.navBook}
            </Link>
            <Link
              className="btn btn-outline btn-on-green"
              href={`/${locale}/contact`}
            >
              {contactLabel}
            </Link>
            {waHref ? (
              <a
                className="btn btn-outline btn-on-green"
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {waLabel}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
