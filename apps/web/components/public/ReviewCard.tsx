"use client";

import { useMemo, useState } from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicReview } from "../../lib/public-site";
import {
  localizedReviewName,
  localizedReviewQuote,
  pickLocalized,
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

function ReviewAvatar({
  review,
  name,
}: {
  review: PublicReview;
  name: string;
}) {
  const type = String(review.avatarType || "neutral").toLowerCase();
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  if (type === "uploaded" && review.patientImage?.startsWith("/api/media/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="review-card-avatar review-card-avatar--image"
        src={review.patientImage}
        alt=""
        width={48}
        height={48}
      />
    );
  }

  const tone =
    type === "male"
      ? "review-card-avatar--male"
      : type === "female"
        ? "review-card-avatar--female"
        : type === "initials"
          ? "review-card-avatar--initials"
          : "review-card-avatar--neutral";

  return (
    <span className={`review-card-avatar ${tone}`} aria-hidden>
      {type === "initials" || !type ? initials || "ز" : initials || "ز"}
    </span>
  );
}

export function ReviewCard({
  locale,
  review,
  anonymousLabel,
  verifiedLabel: _verifiedLabel,
  readMoreLabel,
  readLessLabel,
  maxChars = 220,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const quote = localizedReviewQuote(locale, review);
  const name = review.isAnonymous
    ? anonymousLabel
    : localizedReviewName(locale, review);
  const subject = pickLocalized(
    locale,
    review.subjectAr || review.subject,
    review.subjectEn,
    review.subjectFr,
    review.subject || "",
  );
  const date = formatReviewDate(locale, review.reviewDate || review.createdAt);
  // Integrity: never show a fake "verified visit" badge on public cards.
  void _verifiedLabel;
  const needsTruncate = quote.length > maxChars;
  const shownQuote = useMemo(() => {
    if (!needsTruncate || expanded) return quote;
    return `${quote.slice(0, maxChars).trim()}…`;
  }, [expanded, maxChars, needsTruncate, quote]);
  const relation =
    review.serviceSlug || review.specialtySlug
      ? [review.serviceSlug, review.specialtySlug].filter(Boolean).join(" · ")
      : "";

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
      {subject ? <h3 className="review-card-subject">{subject}</h3> : null}
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
          <ReviewAvatar review={review} name={name} />
          <div>
            <strong>{name}</strong>
            {relation ? (
              <p className="review-card-relation muted">{relation}</p>
            ) : null}
          </div>
        </div>
        {date ? (
          <time
            className="review-card-date"
            dateTime={review.reviewDate || review.createdAt}
          >
            {date}
          </time>
        ) : null}
      </footer>
    </article>
  );
}
