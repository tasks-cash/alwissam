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

const AUTOPLAY_MS = 7000;

type Props = {
  locale: Locale;
  copy: PublicCopy;
  cases: PublicBeforeAfterCase[];
  loadError?: boolean;
};

function Comparison({
  item,
  copy,
  onDraggingChange,
}: {
  item: PublicBeforeAfterCase;
  copy: PublicCopy;
  onDraggingChange?: (dragging: boolean) => void;
}) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const controlId = useId();

  const setDragging = useCallback(
    (value: boolean) => {
      dragging.current = value;
      onDraggingChange?.(value);
    },
    [onDraggingChange],
  );

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
      e.preventDefault();
      setFromClientX(e.clientX);
    };
    const onUp = () => {
      if (!dragging.current) return;
      setDragging(false);
    };
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [setFromClientX, setDragging]);

  return (
    <div
      className="ba-compare"
      dir="ltr"
      ref={frameRef}
      onPointerDown={(e) => {
        // Keep compare drag from becoming a carousel swipe.
        e.stopPropagation();
        setDragging(true);
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
        aria-valuetext={`${Math.round(pos)}%`}
        aria-label={copy.comparisonControl}
        onChange={(e) => setPos(Number(e.target.value))}
        onFocus={() => onDraggingChange?.(true)}
        onBlur={() => onDraggingChange?.(false)}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <span className="sr-only" aria-live="polite">
        {Math.round(pos)}%
      </span>
    </div>
  );
}

export function BeforeAfterSlider({ locale, copy, cases, loadError }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const isRtl = locale === "ar";
  const total = cases.length;
  const labelId = useId();
  const statusId = useId();
  const canLoop = total > 1;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const go = useCallback(
    (dir: number) => {
      setIndex((i) => {
        if (total <= 1) return 0;
        const next = i + dir;
        if (!canLoop) return Math.min(total - 1, Math.max(0, next));
        if (next < 0) return total - 1;
        if (next >= total) return 0;
        return next;
      });
    },
    [canLoop, total],
  );

  useEffect(() => {
    if (reduced || paused || comparing || total <= 1) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [comparing, go, paused, reduced, total]);

  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setPaused(true);
      else setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

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
    <div
      className="ba-slider"
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
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
        aria-describedby={statusId}
        className="ba-case"
        onTouchStart={(e) => {
          if (comparing) return;
          touchX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (comparing) return;
          const start = touchX.current;
          touchX.current = null;
          if (start == null) return;
          const end = e.changedTouches[0]?.clientX ?? start;
          const delta = end - start;
          if (Math.abs(delta) < 48) return;
          if (isRtl) go(delta > 0 ? -1 : 1);
          else go(delta > 0 ? -1 : 1);
        }}
      >
        <p id={labelId} className="sr-only">
          {copy.beforeAfterTitle}
        </p>
        <p id={statusId} className="sr-only" aria-live="polite">
          {index + 1} / {total}
        </p>
        <Comparison
          item={item}
          copy={copy}
          onDraggingChange={setComparing}
        />
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
          <p className="ba-case-disclaimer">{copy.beforeAfterDisclaimer}</p>
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
          <div className="pe-dots" role="tablist" aria-label={copy.beforeAfterTitle}>
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
