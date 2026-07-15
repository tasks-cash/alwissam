import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicChrome } from "../../../../components/public/PublicChrome";
import { isLocale, type Locale } from "../../../../lib/i18n/config";
import { getDictionary } from "../../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../../lib/i18n/public-copy";
import {
  fetchPublicSite,
  localizedClinicName,
  localizedServiceDesc,
  localizedServiceName,
} from "../../../../lib/public-site";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const service = (site.content?.services || []).find((s) => s.slug === slug);
  if (!service) notFound();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
    >
      <section className="public-section">
        <p className="eyebrow">{copy.navServices}</p>
        <h1>{localizedServiceName(locale, service)}</h1>
        <p className="lead">{localizedServiceDesc(locale, service)}</p>
        <p className="muted">{copy.disclaimer}</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
            {copy.relatedCta}
          </Link>
          <Link className="btn btn-outline" href={`/${locale}/services`}>
            {copy.allServices}
          </Link>
        </div>
      </section>
    </PublicChrome>
  );
}
