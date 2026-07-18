import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "../../../components/public/PageHero";
import { PublicChrome } from "../../../components/public/PublicChrome";
import { PublicSection } from "../../../components/public/PublicSection";
import { ReviewsExplorer } from "../../../components/public/ReviewsExplorer";
import { isLocale, type Locale } from "../../../lib/i18n/config";
import {
  buildPublicMetadata,
  titleSegment,
} from "../../../lib/seo/page-metadata";
import { getDictionary } from "../../../lib/i18n/dictionaries";
import { getPublicCopy } from "../../../lib/i18n/public-copy";
import {
  fetchPublicReviews,
  fetchPublicSite,
  localizedClinicName,
  localizedWorkingHours,
} from "../../../lib/public-site";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = getPublicCopy(locale);
  return buildPublicMetadata({
    locale,
    path: "/reviews",
    title: titleSegment(locale, "reviews"),
    description: copy.reviewsLead,
  });
}

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    q?: string;
    rating?: string;
    verified?: string;
    featured?: string;
  }>;
}) {
  const { locale: raw } = await params;
  const sp = await searchParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = getDictionary(locale);
  const copy = getPublicCopy(locale);
  const page = Math.max(1, Number(sp.page) || 1);
  const [site, reviewsRes, featuredRes] = await Promise.all([
    fetchPublicSite(),
    fetchPublicReviews({
      locale,
      page,
      limit: 30,
      search: sp.q,
      rating: sp.rating ? Number(sp.rating) : undefined,
      verified: sp.verified === "true",
      featured: sp.featured === "true",
    }),
    fetchPublicReviews({ locale, featured: true, limit: 6 }),
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
        title={copy.reviewsTitle}
        description={copy.reviewsLead}
        crumbs={[
          { href: `/${locale}`, label: copy.navHome },
          { label: copy.navReviews },
        ]}
        tone="mist"
      />
      <PublicSection>
        <ReviewsExplorer
          locale={locale}
          initialItems={reviewsRes.items}
          initialFeatured={featuredRes.items}
          initialStats={reviewsRes.stats}
          initialPage={reviewsRes.page}
          initialTotal={reviewsRes.total}
          initialTotalPages={reviewsRes.totalPages}
          initialSearch={sp.q || ""}
          initialRating={sp.rating || ""}
          initialVerified={sp.verified === "true"}
          initialFeaturedOnly={sp.featured === "true"}
          copy={{
            searchPlaceholder: copy.reviewsSearchPlaceholder,
            searchLabel: copy.reviewsSearchLabel,
            clearSearch: copy.reviewsClearSearch,
            filterRating: copy.reviewsFilterRating,
            filterVerified: copy.reviewsFilterVerified,
            filterFeatured: copy.reviewsFilterFeatured,
            allRatings: copy.reviewsAllRatings,
            resultsCountTemplate: copy.reviewsResultsCount,
            featuredTitle: copy.reviewsFeaturedTitle,
            emptyReviews: copy.emptyReviews,
            loadError: copy.reviewsLoadError,
            retry: copy.retryLabel,
            anonymousLabel: copy.reviewsAnonymous,
            verifiedLabel: copy.reviewsVerifiedBadge,
            readMore: copy.reviewsReadMore,
            readLess: copy.reviewsReadLess,
            prevPage: copy.reviewsPrevPage,
            nextPage: copy.reviewsNextPage,
            pageLabel: copy.reviewsPageLabel,
            statsPublished: copy.reviewsStatsPublished,
            statsAverage: copy.reviewsStatsAverage,
            statsVerified: copy.reviewsStatsVerified,
            book: copy.navBook,
            contact: copy.navContact,
          }}
        />
      </PublicSection>
    </PublicChrome>
  );
}
