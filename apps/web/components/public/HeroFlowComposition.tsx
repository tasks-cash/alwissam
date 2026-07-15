"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type Props = {
  locale: Locale;
  caption: string;
  badgePrimary: string;
  badgeSecondary: string;
};

/**
 * Layered floating hero imagery. Motion is CSS-driven and disabled when
 * prefers-reduced-motion is set (via body class + media query).
 */
export function HeroFlowComposition({
  locale,
  caption,
  badgePrimary,
  badgeSecondary,
}: Props) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div
      className={`hero-flow${reduced ? " hero-flow--reduced" : ""}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-hidden={false}
    >
      <div className="hero-flow-shapes" aria-hidden>
        <span className="hero-flow-blob hero-flow-blob--a" />
        <span className="hero-flow-blob hero-flow-blob--b" />
        <span className="hero-flow-ring" />
      </div>

      <figure className="hero-flow-main">
        <Image
          src="/images/stock/dental-care-hero.jpg"
          alt={caption}
          width={920}
          height={1100}
          className="hero-flow-img"
          priority
          sizes="(max-width: 900px) 88vw, 42vw"
        />
        <figcaption className="sr-only">{caption}</figcaption>
      </figure>

      <figure className="hero-flow-support">
        <Image
          src="/images/stock/dental-clinic-interior.jpg"
          alt=""
          width={640}
          height={480}
          className="hero-flow-img"
          sizes="(max-width: 900px) 52vw, 22vw"
        />
      </figure>

      <div className="hero-flow-badge hero-flow-badge--primary" aria-hidden>
        {badgePrimary}
      </div>
      <div className="hero-flow-badge hero-flow-badge--secondary" aria-hidden>
        {badgeSecondary}
      </div>
    </div>
  );
}
