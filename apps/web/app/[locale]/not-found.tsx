import Link from "next/link";
import { GlobalContactChannels } from "../../components/public/GlobalContactChannels";
import { getDictionary } from "../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../lib/i18n/public-copy";
import { isLocale, type Locale } from "../../lib/i18n/config";

export default async function LocaleNotFound({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const raw = params ? (await params).locale : undefined;
  const locale: Locale = raw && isLocale(raw) ? raw : "ar";
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const title =
    locale === "en"
      ? "Page not found"
      : locale === "fr"
        ? "Page introuvable"
        : "الصفحة غير موجودة";
  const lead =
    locale === "en"
      ? "The page you requested is unavailable. Return home or book an appointment."
      : locale === "fr"
        ? "La page demandée est indisponible. Revenez à l’accueil ou réservez un rendez-vous."
        : "الصفحة المطلوبة غير متاحة. يمكنكم العودة للرئيسية أو حجز موعد.";

  return (
    <main className="public-shell" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <section className="pub-band pub-band-mist page-hero">
        <div className="pub-container">
          <p className="muted">404</p>
          <h1>{title}</h1>
          <p className="pub-lead">{lead}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/${locale}`}>
              {copy.backHome}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/book-appointment`}>
              {copy.navBook}
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "1.5rem" }}>
            {dict.brand}
          </p>
        </div>
      </section>
      <GlobalContactChannels locale={locale} />
    </main>
  );
}
