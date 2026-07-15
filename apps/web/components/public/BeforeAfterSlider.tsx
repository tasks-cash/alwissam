"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import type { Locale } from "../../lib/i18n/config";
import type { PublicCopy } from "../../lib/i18n/public-copy";
import type { PublicBeforeAfterCase } from "../../lib/public-site";

type Props = {
  locale: Locale;
  copy: PublicCopy;
  cases: PublicBeforeAfterCase[];
  loadError?: boolean;
};

function Comparison({
  item,
  copy,
}: {
  item: PublicBeforeAfterCase;
  copy: PublicCopy;
}) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const controlId = useId();

  const setFromClientX = useCallback((clientX: number) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, raw)));
  }, []);

  useEffect(() => {
    setPos(50);
  }, [item.id]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setFromClientX]);

  return (
    <div
      className="ba-compare"
      dir="ltr"
      ref={frameRef}
      onPointerDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="ba-img ba-img-after"
        src={item.afterImageUrl}
        alt={item.afterAlt || copy.afterLabel}
        draggable={false}
      />
      <div
        className="ba-before-clip"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ba-img ba-img-before"
          src={item.beforeImageUrl}
          alt={item.beforeAlt || copy.beforeLabel}
          draggable={false}
        />
      </div>
      <div className="ba-divider" style={{ left: `${pos}%` }} aria-hidden>
        <span className="ba-handle" />
      </div>
      <span className="ba-tag ba-tag-before">{copy.beforeLabel}</span>
      <span className="ba-tag ba-tag-after">{copy.afterLabel}</span>
      <label className="sr-only" htmlFor={controlId}>
        {copy.comparisonControl}
      </label>
      <input
        id={controlId}
        className="ba-range"
        type="range"
        min={2}
        max={98}
        value={pos}
        aria-valuemin={2}
        aria-valuemax={98}
        aria-valuenow={Math.round(pos)}
        aria-label={copy.comparisonControl}
        onChange={(e) => setPos(Number(e.target.value))}
      />
    </div>
  );
}

export function BeforeAfterSlider({ locale, copy, cases, loadError }: Props) {
  const [index, setIndex] = useState(0);
  const isRtl = locale === "ar";
  const total = cases.length;
  const labelId = useId();

  const go = (dir: number) => {
    setIndex((i) => {
      if (total <= 1) return 0;
      const next = i + dir;
      if (next < 0) return total - 1;
      if (next >= total) return 0;
      return next;
    });
  };

  if (loadError) {
    return (
      <div className="pe-state pe-state-error" role="alert">
        <p>{copy.beforeAfterError}</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="pe-state">
        <p className="muted empty-state">{copy.beforeAfterEmpty}</p>
      </div>
    );
  }

  const item = cases[index]!;

  return (
    <div className="ba-slider" dir={isRtl ? "rtl" : "ltr"}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        className="ba-case"
      >
        <p id={labelId} className="sr-only">
          {copy.beforeAfterTitle} — {index + 1} / {total}
        </p>
        <Comparison item={item} copy={copy} />
        <div className="ba-case-copy">
          <h3>{item.title}</h3>
          {item.description ? <p>{item.description}</p> : null}
          <ul className="ba-meta">
            {item.doctorName ? <li>{item.doctorName}</li> : null}
            {item.specialtySlug ? <li>{item.specialtySlug}</li> : null}
            {item.serviceSlug ? <li>{item.serviceSlug}</li> : null}
            {item.treatmentDuration ? <li>{item.treatmentDuration}</li> : null}
            {item.resultDate ? (
              <li>
                <time dateTime={String(item.resultDate)}>
                  {new Date(item.resultDate).toLocaleDateString(locale)}
                </time>
              </li>
            ) : null}
          </ul>
          <Link
            className="btn btn-outline"
            href={`/${locale}/book-appointment`}
          >
            {copy.bookTreatmentCta}
          </Link>
        </div>
      </div>

      {total > 1 ? (
        <div className="pe-controls ba-controls">
          <button
            type="button"
            className="pe-btn"
            aria-label={copy.beforeAfterPrev}
            onClick={() => go(-1)}
          >
            {isRtl ? "→" : "←"}
          </button>
          <div className="pe-dots" role="tablist">
            {cases.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`${i + 1} / ${total}`}
                className={i === index ? "is-active" : undefined}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="pe-btn"
            aria-label={copy.beforeAfterNext}
            onClick={() => go(1)}
          >
            {isRtl ? "←" : "→"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
