"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type {
  PublicReview,
  PublicReviewsStats,
} from "../../lib/public-site";
import { ReviewCard } from "./ReviewCard";

type ReviewsCopy = {
  searchPlaceholder: string;
  searchLabel: string;
  clearSearch: string;
  filterRating: string;
  filterVerified: string;
  filterFeatured: string;
  allRatings: string;
  resultsCountTemplate: string;
  featuredTitle: string;
  emptyReviews: string;
  loadError: string;
  retry: string;
  anonymousLabel: string;
  verifiedLabel: string;
  readMore: string;
  readLess: string;
  prevPage: string;
  nextPage: string;
  pageLabel: string;
  statsPublished: string;
  statsAverage: string;
  statsVerified: string;
  book: string;
  contact: string;
};

type Props = {
  locale: Locale;
  initialItems: PublicReview[];
  initialFeatured: PublicReview[];
  initialStats: PublicReviewsStats;
  initialPage: number;
  initialTotal: number;
  initialTotalPages: number;
  initialSearch?: string;
  initialRating?: string;
  initialVerified?: boolean;
  initialFeaturedOnly?: boolean;
  copy: ReviewsCopy;
};

export function ReviewsExplorer({
  locale,
  initialItems,
  initialFeatured,
  initialStats,
  initialPage,
  initialTotal,
  initialTotalPages,
  initialSearch = "",
  initialRating = "",
  initialVerified = false,
  initialFeaturedOnly = false,
  copy,
}: Props) {
  const baseId = useId();
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [rating, setRating] = useState(initialRating);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);
  const [featuredOnly, setFeaturedOnly] = useState(initialFeaturedOnly);
  const [page, setPage] = useState(initialPage);
  const [items, setItems] = useState(initialItems);
  const [featured, setFeatured] = useState(initialFeatured);
  const [stats, setStats] = useState(initialStats);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setError(false);
    try {
      const params = new URLSearchParams({
        locale,
        page: String(page),
        limit: "30",
      });
      if (search) params.set("search", search);
      if (rating) params.set("rating", rating);
      if (verifiedOnly) params.set("verified", "true");
      if (featuredOnly) params.set("featured", "true");
      const res = await fetch(`/api/public/reviews?${params}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : data.reviews || []);
      setTotal(Number(data.total) || 0);
      setTotalPages(Number(data.totalPages) || 1);
      if (data.stats) setStats(data.stats);
    } catch {
      setError(true);
    }
  }, [featuredOnly, locale, page, rating, search, verifiedOnly]);

  useEffect(() => {
    startTransition(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    if (search || rating || verifiedOnly || featuredOnly) return;
    let cancelled = false;
    void fetch(
      `/api/public/reviews?locale=${locale}&featured=true&limit=6`,
    ).then(async (res) => {
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) {
        setFeatured(Array.isArray(data.items) ? data.items : data.reviews || []);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [featuredOnly, locale, rating, search, verifiedOnly]);

  const showFeatured =
    !search && !rating && !verifiedOnly && !featuredOnly && featured.length > 0;

  return (
    <div className="reviews-explorer">
      <div className="reviews-stats-band">
        <div className="reviews-stat">
          <strong>{stats.publishedCount}</strong>
          <span>{copy.statsPublished}</span>
        </div>
        <div className="reviews-stat">
          <strong dir="ltr">{stats.averageRating || "—"}</strong>
          <span>{copy.statsAverage}</span>
        </div>
        <div className="reviews-stat">
          <strong>{stats.verifiedCount}</strong>
          <span>{copy.statsVerified}</span>
        </div>
      </div>

      <div className="reviews-filters">
        <div className="reviews-search-block">
          <label className="reviews-search-label" htmlFor={`${baseId}-search`}>
            {copy.searchLabel}
          </label>
          <div className="reviews-search-row">
            <input
              id={`${baseId}-search`}
              type="search"
              className="reviews-search-input input"
              placeholder={copy.searchPlaceholder}
              value={searchInput}
              onChange={(e) => {
                setPage(1);
                setSearchInput(e.target.value);
              }}
              autoComplete="off"
              dir={locale === "ar" ? "rtl" : "ltr"}
            />
            {searchInput ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setPage(1);
                  setSearchInput("");
                }}
              >
                {copy.clearSearch}
              </button>
            ) : null}
          </div>
        </div>
        <div className="reviews-filter-row">
          <select
            className="input"
            aria-label={copy.filterRating}
            value={rating}
            onChange={(e) => {
              setPage(1);
              setRating(e.target.value);
            }}
          >
            <option value="">{copy.allRatings}</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={String(n)}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
          <label className="reviews-check">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setPage(1);
                setVerifiedOnly(e.target.checked);
              }}
            />
            {copy.filterVerified}
          </label>
          <label className="reviews-check">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => {
                setPage(1);
                setFeaturedOnly(e.target.checked);
              }}
            />
            {copy.filterFeatured}
          </label>
        </div>
        <p className="reviews-results-count" aria-live="polite">
          {pending
            ? "…"
            : copy.resultsCountTemplate.replace("{n}", String(error ? 0 : total))}
        </p>
      </div>

      {error ? (
        <div className="reviews-state card-surface" role="alert">
          <p>{copy.loadError}</p>
          <button type="button" className="btn btn-primary" onClick={() => void load()}>
            {copy.retry}
          </button>
        </div>
      ) : null}

      {!error && showFeatured ? (
        <section className="reviews-featured" aria-labelledby={`${baseId}-featured`}>
          <h2 id={`${baseId}-featured`}>{copy.featuredTitle}</h2>
          <div className="reviews-grid">
            {featured.map((r, i) => (
              <ReviewCard
                key={r.id || `feat-${i}`}
                locale={locale}
                review={r}
                anonymousLabel={copy.anonymousLabel}
                verifiedLabel={copy.verifiedLabel}
                readMoreLabel={copy.readMore}
                readLessLabel={copy.readLess}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!error && items.length === 0 ? (
        <div className="reviews-state card-surface">
          <p>{copy.emptyReviews}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/${locale}/book-appointment`}>
              {copy.book}
            </Link>
            <Link className="btn btn-outline" href={`/${locale}/contact`}>
              {copy.contact}
            </Link>
          </div>
        </div>
      ) : null}

      {!error && items.length > 0 ? (
        <div className="reviews-grid">
          {items.map((r, i) => (
            <ReviewCard
              key={r.id || `item-${i}`}
              locale={locale}
              review={r}
              anonymousLabel={copy.anonymousLabel}
              verifiedLabel={copy.verifiedLabel}
              readMoreLabel={copy.readMore}
              readLessLabel={copy.readLess}
            />
          ))}
        </div>
      ) : null}

      {!error && totalPages > 1 ? (
        <nav className="reviews-pagination" aria-label={copy.pageLabel}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page <= 1 || pending}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {copy.prevPage}
          </button>
          <span className="reviews-page-indicator">
            {copy.pageLabel} {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn btn-outline"
            disabled={page >= totalPages || pending}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            {copy.nextPage}
          </button>
        </nav>
      ) : null}
    </div>
  );
}
