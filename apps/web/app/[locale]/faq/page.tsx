import { notFound } from "next/navigation";
import { FaqAccordion } from "../../../components/public/FaqAccordion";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const site = await fetchPublicSite();
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const faqs = site.content?.faqs || [];

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
      hours={hours}
    >
      <PageHero
        title={copy.sectionFaq}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navFaq },
        ]}
      />
      <PublicSection>
        {faqs.length === 0 ? (
          <div className="empty-state card-surface">
            <p>{dict.emptyState}</p>
          </div>
        ) : (
          <FaqAccordion locale={locale} faqs={faqs} />
        )}
      </PublicSection>
    </PublicChrome>
  );
}
