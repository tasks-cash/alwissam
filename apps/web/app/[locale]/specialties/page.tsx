import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicSite,
  localizedClinicName,
  localizedSpecialtyDesc,
  localizedSpecialtyName,
  localizedWorkingHours,
} from "../../../lib/public-site";

export default async function SpecialtiesPage({
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
  const specialties = site.content?.specialties || [];

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
        title={copy.sectionSpecialties}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navSpecialties },
        ]}
        tone="mist"
      />
      <PublicSection>
        {specialties.length === 0 ? (
          <div className="empty-state card-surface">
            <p>{dict.emptyState}</p>
          </div>
        ) : (
          <div className="pub-tile-grid pub-tile-grid-3">
            {specialties.map((s) => (
              <Link
                key={s.slug}
                href={`/${locale}/specialties/${s.slug}`}
                className="pub-tile"
              >
                <h2 style={{ margin: 0, fontSize: "1.12rem" }}>
                  {localizedSpecialtyName(locale, s)}
                </h2>
                <p>{localizedSpecialtyDesc(locale, s)}</p>
              </Link>
            ))}
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}
