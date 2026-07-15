"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicPatientExperience } from "../../lib/public-site";

const AUTOPLAY_MS = 6000;

type Props = {
  locale: Locale;
  copy: PublicCopy;
  experiences: PublicPatientExperience[];
  loadError?: boolean;
};

function Stars({ rating, label }: { rating: number; label: string }) {
  const safe = Math.min(5, Math.max(1, Math.round(rating || 0)));
  return (
    <p className="pe-rating" aria-label={`${label}: ${safe} / 5`}>
      <span aria-hidden="true" className="pe-stars" dir="ltr">
        {"★".repeat(safe)}
        <span className="pe-stars-empty">{"★".repeat(5 - safe)}</span>
      </span>
      <span className="sr-only">
        {label}: {safe} / 5
      </span>
    </p>
  );
}

function ExperienceText({
  text,
  copy,
}: {
  text: string;
  copy: PublicCopy;
}) {
  const [expanded, setExpanded] = useState(false);
  const needsClamp = text.length > 180;

  return (
    <div className="pe-text-wrap">
      <p className={`pe-text${needsClamp && !expanded ? " is-clamped" : ""}`}>
        {text}
      </p>
      {needsClamp ? (
        <button
          type="button"
          className="pe-read-more"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? copy.experiencesReadLess : copy.experiencesReadMore}
        </button>
      ) : null}
    </div>
  );
}

export function PatientExperiencesSlider({
  locale,
  copy,
  experiences,
  loadError,
}: Props) {
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(1);
  const [reduced, setReduced] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchX = useRef<number | null>(null);
  const labelId = useId();
  const isRtl = locale === "ar";
  const total = experiences.length;
  const canLoop = total > perView;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1100) setPerView(3);
      else if (w >= 700) setPerView(2);
      else setPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, total - perView);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => {
        if (!canLoop) {
          return Math.min(maxIndex, Math.max(0, i + dir));
        }
        const next = i + dir;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [canLoop, maxIndex],
  );

  useEffect(() => {
    if (index > maxIndex) setIndex(maxIndex);
  }, [index, maxIndex]);

  useEffect(() => {
    if (reduced || paused || total <= perView) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [go, paused, perView, reduced, total]);

  useEffect(() => {
    const onVis = () => {
      setPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (loadError) {
    return (
      <div className="pe-state pe-state-error" role="alert">
        <p>{copy.experiencesError}</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="pe-state">
        <p className="muted empty-state">{copy.experiencesEmpty}</p>
      </div>
    );
  }

  const stepPct = 100 / perView;

  return (
    <div
      className="pe-slider"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="pe-viewport"
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
      >
      <p id={labelId} className="sr-only">
          {copy.experiencesTitle}
        </p>
        <div
          ref={trackRef}
          className="pe-track"
          style={{
            transform: `translateX(${isRtl ? "" : "-"}${index * stepPct}%)`,
            transition: reduced ? "none" : "transform 480ms ease",
          }}
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            if (start == null) return;
            const end = e.changedTouches[0]?.clientX ?? start;
            const delta = end - start;
            if (Math.abs(delta) < 40) return;
            // In RTL, swipe right (positive delta) moves to previous semantic content.
            if (isRtl) go(delta > 0 ? -1 : 1);
            else go(delta > 0 ? -1 : 1);
          }}
        >
          {experiences.map((exp, i) => (
            <article
              key={exp.id}
              className="pe-card"
              style={{ flexBasis: `${stepPct}%` }}
              aria-hidden={i < index || i >= index + perView}
              aria-label={`${i + 1} / ${total}`}
            >
              <div className="pe-card-inner">
                <span className="pe-quote" aria-hidden>
                  “
                </span>
                <div className="pe-card-top">
                  <div className="pe-avatar" aria-hidden>
                    {exp.patientImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={exp.patientImageUrl} alt="" />
                    ) : (
                      <span>{(exp.displayName || "?").slice(0, 1)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="pe-name">{exp.displayName}</h3>
                    {exp.isVerifiedPatient ? (
                      <span className="pe-verified">
                        {copy.experiencesVerified}
                      </span>
                    ) : null}
                  </div>
                </div>
                <Stars rating={exp.rating} label={copy.experiencesRating} />
                <ExperienceText text={exp.review} copy={copy} />
                <footer className="pe-meta">
                  {exp.treatmentTitle ? <span>{exp.treatmentTitle}</span> : null}
                  {exp.doctorName ? <span>{exp.doctorName}</span> : null}
                  {exp.reviewDate ? (
                    <time dateTime={String(exp.reviewDate)}>
                      {new Date(exp.reviewDate).toLocaleDateString(locale)}
                    </time>
                  ) : null}
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="pe-controls">
        <button
          type="button"
          className="pe-btn"
          aria-label={copy.experiencesPrev}
          onClick={() => go(-1)}
        >
          {isRtl ? "→" : "←"}
        </button>
        <div className="pe-dots" role="tablist" aria-label={copy.experiencesTitle}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`${i + 1} / ${maxIndex + 1}`}
              className={i === index ? "is-active" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <button
          type="button"
          className="pe-btn"
          aria-label={copy.experiencesNext}
          onClick={() => go(1)}
        >
          {isRtl ? "←" : "→"}
        </button>
      </div>
      {reduceMotion ? null : (
        <p className="sr-only" aria-live="polite">
          {paused ? copy.experiencesPause : ""}
        </p>
      )}
    </div>
  );
}
