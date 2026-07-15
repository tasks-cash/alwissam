"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  caption: string;
  overlayMain: string;
  overlayAccent: string;
  overlayBadge: string;
};

/**
 * Premium photographic hero composition with restrained motion and overlays.
 * Photographs are never mirrored; dir only controls overlay text direction.
 */
export function HeroFlowComposition({
  locale,
  caption,
  overlayMain,
  overlayAccent,
  overlayBadge,
}: Props) {
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, [reduced]);

  return (
    <div
      className={`hero-plane${reduced ? " hero-plane--reduced" : ""}${
        visible ? " hero-plane--in" : ""
      }`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="hero-plane-glow" aria-hidden />
      <figure className="hero-plane-frame">
        <Image
          src="/images/stock/dental-care-hero.jpg"
          alt={caption}
          width={1100}
          height={1320}
          className="hero-plane-img"
          priority
          sizes="(max-width: 900px) 92vw, 46vw"
        />
        <span className="hero-plane-overlay hero-plane-overlay--main">
          {overlayMain}
        </span>
        <span className="hero-plane-overlay hero-plane-overlay--badge">
          {overlayBadge}
        </span>
        <figcaption className="sr-only">{caption}</figcaption>
      </figure>
      <figure className="hero-plane-accent">
        <Image
          src="/images/stock/dental-clinic-interior.jpg"
          alt=""
          width={720}
          height={540}
          className="hero-plane-img"
          loading="lazy"
          sizes="(max-width: 900px) 48vw, 22vw"
        />
        <span className="hero-plane-overlay hero-plane-overlay--accent" aria-hidden>
          {overlayAccent}
        </span>
      </figure>
    </div>
  );
}
