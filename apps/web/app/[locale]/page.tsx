import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "../../lib/i18n/config";
import { getDictionary } from "../../lib/i18n/dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);

  return (
    <main className="hero-panel">
      <p className="eyebrow">{dict.brand}</p>
      <h1>{dict.homeTitle}</h1>
      <p className="lead">{dict.homeLead}</p>
      <div className="cta-row">
        <Link className="btn btn-primary" href={`/${locale}/staff/login`}>
          {dict.staffLogin}
        </Link>
        <Link className="btn btn-outline" href={`/${locale}/patient/login`}>
          {dict.patientLogin}
        </Link>
        <Link className="btn btn-outline" href={`/${locale}/forgot-password`}>
          {dict.forgotPassword}
        </Link>
      </div>
    </main>
  );
}
