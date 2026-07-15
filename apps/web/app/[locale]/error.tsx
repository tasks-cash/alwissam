"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { GlobalWhatsAppButton } from "../../components/public/GlobalWhatsAppButton";
import { isLocale, type Locale } from "../../lib/i18n/config";
import { getPublicCopy } from "../../lib/i18n/public-copy";

const FALLBACK_CLINIC = {
  phone: "0663098208",
  phoneInternational: "+213663098208",
  whatsappNumber: "213663098208",
  whatsappEnabled: true,
};

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const raw = typeof params?.locale === "string" ? params.locale : "ar";
  const locale: Locale = isLocale(raw) ? raw : "ar";
  const copy = getPublicCopy(locale);

  const title =
    locale === "en"
      ? "Something went wrong"
      : locale === "fr"
        ? "Une erreur est survenue"
        : "حدث خطأ غير متوقع";
  const lead =
    locale === "en"
      ? "Please try again. If the problem continues, contact the clinic."
      : locale === "fr"
        ? "Veuillez réessayer. Si le problème continue, contactez la clinique."
        : "يرجى إعادة المحاولة. إذا استمرّت المشكلة، تواصلوا مع العيادة.";

  return (
    <main
      className="public-shell"
      dir={locale === "ar" ? "rtl" : "ltr"}
      lang={locale}
    >
      <section className="pub-band pub-band-mist page-hero">
        <div className="pub-container">
          <h1>{title}</h1>
          <p className="pub-lead">{lead}</p>
          <div className="cta-row">
            <button type="button" className="btn btn-primary" onClick={reset}>
              {locale === "en"
                ? "Try again"
                : locale === "fr"
                  ? "Réessayer"
                  : "إعادة المحاولة"}
            </button>
            <Link className="btn btn-outline" href={`/${locale}`}>
              {copy.backHome}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.navContact}
            </Link>
          </div>
        </div>
      </section>
      <GlobalWhatsAppButton locale={locale} clinic={FALLBACK_CLINIC} />
    </main>
  );
}
