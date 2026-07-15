import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeforeAfterSlider } from "../../../components/public/BeforeAfterSlider";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";
import {
  fetchPublicBeforeAfter,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";
import { PubBookingCta } from "../../../components/public/PubBookingCta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  return buildPublicMetadata({
    locale,
    path: "/before-after",
    title: titleSegment(locale, "beforeAfter"),
    description:
      locale === "en"
        ? "View approved before-and-after treatment cases from Al Wissam Dental Clinic."
        : locale === "fr"
          ? "Consultez les cas avant/après validés de la Clinique Dentaire El Wissam."
          : "اطّلع على حالات قبل وبعد العلاج المعتمدة في عيادة الوسام لطب الأسنان.",
  });
}

export default async function BeforeAfterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, cases] = await Promise.all([
    fetchPublicSite(),
    fetchPublicBeforeAfter({ locale, featured: true, limit: 10 }),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);

  return (
    <PublicChrome
      locale={locale}
      dict={dict}
      brand={name}
      clinic={site.clinic}
      phone={site.clinic?.phone}
      email={site.clinic?.email}
      address={site.clinic?.address}
      hours={hours}
    >
      <PageHero
        title={copy.beforeAfterTitle}
        description={copy.beforeAfterLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.beforeAfterTitle },
        ]}
        tone="mist"
      />
      <PublicSection>
        <BeforeAfterSlider locale={locale} copy={copy} cases={cases} />
        <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
          {copy.beforeAfterDisclaimer}
        </p>
      </PublicSection>
      <PublicSection tone="green">
        <PubBookingCta
          locale={locale}
          copy={copy}
          clinic={site.clinic}
          hours={hours}
          brandName={name}
        />
      </PublicSection>
    </PublicChrome>
  );
}
