import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicReviews,
  fetchPublicSite,
  localizedClinicName,
  localizedReviewName,
  localizedReviewQuote,
  localizedWorkingHours,
  verifiedReviews,
} from "../../../lib/public-site";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const [site, apiReviews] = await Promise.all([
    fetchPublicSite(),
    fetchPublicReviews(48),
  ]);
  const name = localizedClinicName(locale, site.clinic) || dict.brand;
  const hours = localizedWorkingHours(locale, site.clinic);
  const contentReviews = verifiedReviews(site.content);
  const reviews = apiReviews.length ? apiReviews : contentReviews;

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
        title={copy.reviewsTitle}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navReviews },
        ]}
      />
      <PublicSection>
        {reviews.length ? (
          <div className="pub-tile-grid">
            {reviews.map((r, i) => (
              <article
                key={r.id || `${localizedReviewName(locale, r)}-${i}`}
                className="pub-tile"
              >
                {r.rating ? (
                  <p className="section-kicker" dir="ltr" aria-label={`${r.rating}/5`}>
                    {"★".repeat(Math.min(5, Math.max(1, r.rating)))}
                  </p>
                ) : null}
                <p>{localizedReviewQuote(locale, r)}</p>
                <h3>{localizedReviewName(locale, r)}</h3>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state card-surface">
            <p>{copy.emptyReviews}</p>
            <Link className="btn btn-primary" href={`/${locale}/contact`}>
              {copy.navContact}
            </Link>
          </div>
        )}
      </PublicSection>
    </PublicChrome>
  );
}
