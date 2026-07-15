"use client";

import { useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicReview } from "../../lib/public-site";
import {
  localizedReviewName,
  localizedReviewQuote,
} from "../../lib/public-site";

type Props = {
  locale: Locale;
  review: PublicReview;
  anonymousLabel: string;
  verifiedLabel: string;
  readMoreLabel: string;
  readLessLabel: string;
  maxChars?: number;
};

function formatReviewDate(locale: Locale, value?: string) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-GB",
      { year: "numeric", month: "short", day: "numeric" },
    ).format(new Date(value));
  } catch {
    return value;
  }
}

function Stars({
  rating,
  locale,
}: {
  rating: number;
  locale: Locale;
}) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  const label =
    locale === "en"
      ? `Rating: ${clamped} out of 5`
      : locale === "fr"
        ? `Évaluation : ${clamped} sur 5`
        : `التقييم: ${clamped} من 5`;
  return (
    <div className="review-card-stars" aria-label={label} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < clamped ? "star filled" : "star"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewCard({
  locale,
  review,
  anonymousLabel,
  verifiedLabel,
  readMoreLabel,
  readLessLabel,
  maxChars = 220,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const quote = localizedReviewQuote(locale, review);
  const name = review.isAnonymous
    ? anonymousLabel
    : localizedReviewName(locale, review);
  const date = formatReviewDate(locale, review.reviewDate || review.createdAt);
  const isVerified = Boolean(review.isVerified ?? review.verified);
  const needsTruncate = quote.length > maxChars;
  const shownQuote = useMemo(() => {
    if (!needsTruncate || expanded) return quote;
    return `${quote.slice(0, maxChars).trim()}…`;
  }, [expanded, maxChars, needsTruncate, quote]);

  return (
    <article className="review-card">
      <div className="review-card-accent" aria-hidden>
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
          <path
            d="M8 22V12c0-3.3 2.7-6 6-6h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M24 22V12c0-3.3-2.7-6-6-6h-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {review.rating ? (
        <Stars rating={review.rating} locale={locale} />
      ) : null}
      <blockquote className="review-card-quote">
        <p>{shownQuote}</p>
      </blockquote>
      {needsTruncate ? (
        <button
          type="button"
          className="review-card-read-more"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      ) : null}
      <footer className="review-card-footer">
        <div className="review-card-meta">
          <strong>{name}</strong>
          {isVerified ? (
            <span className="review-card-verified">{verifiedLabel}</span>
          ) : null}
        </div>
        {date ? (
          <time className="review-card-date" dateTime={review.reviewDate || review.createdAt}>
            {date}
          </time>
        ) : null}
      </footer>
    </article>
  );
}
