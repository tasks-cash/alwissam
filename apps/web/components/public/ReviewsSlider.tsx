"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicReview } from "../../lib/public-site";
import { ReviewCard } from "./ReviewCard";

type Props = {
  locale: Locale;
  reviews: PublicReview[];
  anonymousLabel: string;
  verifiedLabel: string;
  readMoreLabel: string;
  readLessLabel: string;
  featuredTitle?: string;
  emptyLabel: string;
  intervalMs?: number;
};

function visibleCountForWidth(width: number) {
  if (width < 768) return 1;
  if (width < 1100) return 2;
  return 3;
}

/**
 * Accessible reviews slider: auto-advance with pause on hover/focus/hidden tab,
 * swipe, keyboard, and reduced-motion support.
 */
export function ReviewsSlider({
  locale,
  reviews,
  anonymousLabel,
  verifiedLabel,
  readMoreLabel,
  readLessLabel,
  featuredTitle,
  emptyLabel,
  intervalMs = 6500,
}: Props) {
  const labelId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(1);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const pointerStart = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const update = () => setVisible(visibleCountForWidth(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const maxIndex = Math.max(0, reviews.length - visible);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const next = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (reduced || paused || reviews.length <= visible) return;
    const t = window.setInterval(next, intervalMs);
    return () => window.clearInterval(t);
  }, [reduced, paused, reviews.length, visible, intervalMs, next]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      locale === "ar" ? next() : prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      locale === "ar" ? prev() : next();
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    pointerStart.current = e.clientX;
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    if (pointerStart.current == null) return;
    const delta = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) locale === "ar" ? next() : prev();
    else locale === "ar" ? prev() : next();
  };

  if (reviews.length === 0) {
    return <p className="muted empty-state">{emptyLabel}</p>;
  }

  const pageCount = maxIndex + 1;

  return (
    <div
      className="reviews-slider"
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={featuredTitle ? labelId : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      {featuredTitle ? (
        <h3 id={labelId} className="reviews-slider-title">
          {featuredTitle}
        </h3>
      ) : null}
      <div
        className="reviews-slider-viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div
          ref={trackRef}
          className="reviews-slider-track"
          style={{
            transform: `translate3d(${locale === "ar" ? "" : "-"}${
              index * (100 / Math.max(visible, 1))
            }%, 0, 0)`,
            ["--reviews-visible" as string]: String(visible),
          }}
        >
          {reviews.map((review) => (
            <div key={review.id || review.displayName} className="reviews-slider-slide">
              <ReviewCard
                locale={locale}
                review={review}
                anonymousLabel={anonymousLabel}
                verifiedLabel={verifiedLabel}
                readMoreLabel={readMoreLabel}
                readLessLabel={readLessLabel}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="reviews-slider-controls">
        <button
          type="button"
          className="btn btn-outline reviews-slider-nav"
          onClick={prev}
          aria-label={locale === "en" ? "Previous reviews" : "التقييم السابق"}
        >
          {locale === "ar" ? "›" : "‹"}
        </button>
        <div className="reviews-slider-dots" role="tablist">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={
                i === index
                  ? "reviews-slider-dot active"
                  : "reviews-slider-dot"
              }
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-outline reviews-slider-nav"
          onClick={next}
          aria-label={locale === "en" ? "Next reviews" : "التقييم التالي"}
        >
          {locale === "ar" ? "‹" : "›"}
        </button>
      </div>
    </div>
  );
}
